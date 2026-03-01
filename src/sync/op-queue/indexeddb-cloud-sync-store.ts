import type { CloudSyncCursor } from "../../types/interfaces/sync/cloud-sync-cursor";
import type { CloudSyncOperation } from "../../types/interfaces/sync/cloud-sync-operation";
import {
  FIREBASE_SYNC_RETRY_BASE_MS,
  FIREBASE_SYNC_RETRY_MAX_MS,
} from "../../constants/firebase";

interface CloudSyncOutboxRecord {
  opId: string;
  operation: CloudSyncOperation;
  attempts: number;
  nextAttemptAt: number;
  enqueuedAt: number;
}

interface CloudSyncMetaRecord {
  key: string;
  value: unknown;
}

const DB_NAME = "flowanchor-cloud-sync";
const DB_VERSION = 1;
const OUTBOX_STORE = "outbox";
const META_STORE = "meta";
const LAST_ACK_CURSOR_KEY = "lastAckCursor";
const APPLIED_OP_IDS_KEY = "appliedOpIds";
const CLIENT_SEQUENCE_KEY = "clientSequence";

function openCloudSyncDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        const outboxStore = database.createObjectStore(OUTBOX_STORE, {
          keyPath: "opId",
        });
        outboxStore.createIndex("nextAttemptAt", "nextAttemptAt", {
          unique: false,
        });
        outboxStore.createIndex("enqueuedAt", "enqueuedAt", { unique: false });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runReadonlyTransaction<T>(
  database: IDBDatabase,
  storeName: string,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = runner(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runReadwriteTransaction<T>(
  database: IDBDatabase,
  storeName: string,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = runner(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function normalizeAppliedOpIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

function buildRetryDelay(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(
    FIREBASE_SYNC_RETRY_BASE_MS * 2 ** exponent + jitter,
    FIREBASE_SYNC_RETRY_MAX_MS,
  );
}

export class IndexedDbCloudSyncStore {
  async enqueueOperation(operation: CloudSyncOperation): Promise<void> {
    const database = await openCloudSyncDb();
    await runReadwriteTransaction(database, OUTBOX_STORE, (store) =>
      store.put({
        opId: operation.opId,
        operation,
        attempts: 0,
        nextAttemptAt: 0,
        enqueuedAt: Date.now(),
      } satisfies CloudSyncOutboxRecord),
    );
    database.close();
  }

  async replaceOutboxWithOperation(
    operation: CloudSyncOperation,
  ): Promise<void> {
    const database = await openCloudSyncDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(OUTBOX_STORE, "readwrite");
      const store = transaction.objectStore(OUTBOX_STORE);
      store.clear();
      store.put({
        opId: operation.opId,
        operation,
        attempts: 0,
        nextAttemptAt: 0,
        enqueuedAt: Date.now(),
      } satisfies CloudSyncOutboxRecord);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }

  async getReadyOperations(limitCount: number): Promise<CloudSyncOperation[]> {
    const database = await openCloudSyncDb();
    const now = Date.now();
    const records = await runReadonlyTransaction<unknown[]>(
      database,
      OUTBOX_STORE,
      (store) => store.getAll(),
    );
    database.close();
    return records
      .filter((record): record is CloudSyncOutboxRecord => {
        return (
          typeof record === "object" &&
          record !== null &&
          "operation" in record &&
          "opId" in record
        );
      })
      .filter((record) => record.nextAttemptAt <= now)
      .sort((firstRecord, secondRecord) => {
        if (
          firstRecord.operation.clientSeq !== secondRecord.operation.clientSeq
        ) {
          return (
            firstRecord.operation.clientSeq - secondRecord.operation.clientSeq
          );
        }
        return firstRecord.enqueuedAt - secondRecord.enqueuedAt;
      })
      .slice(0, limitCount)
      .map((record) => record.operation);
  }

  async markOperationAttemptFailed(opId: string): Promise<void> {
    const database = await openCloudSyncDb();
    const existingRecord = await runReadonlyTransaction<
      CloudSyncOutboxRecord | undefined
    >(database, OUTBOX_STORE, (store) => store.get(opId));
    if (!existingRecord) {
      database.close();
      return;
    }

    const attempts = existingRecord.attempts + 1;
    const nextAttemptAt = Date.now() + buildRetryDelay(attempts);
    await runReadwriteTransaction(database, OUTBOX_STORE, (store) =>
      store.put({
        ...existingRecord,
        attempts,
        nextAttemptAt,
      } satisfies CloudSyncOutboxRecord),
    );
    database.close();
  }

  async removeOperation(opId: string): Promise<void> {
    const database = await openCloudSyncDb();
    await runReadwriteTransaction(database, OUTBOX_STORE, (store) =>
      store.delete(opId),
    );
    database.close();
  }

  async getQueueLength(): Promise<number> {
    const database = await openCloudSyncDb();
    const count = await runReadonlyTransaction<number>(
      database,
      OUTBOX_STORE,
      (store) => store.count(),
    );
    database.close();
    return count;
  }

  async readCursor(): Promise<CloudSyncCursor | null> {
    const database = await openCloudSyncDb();
    const record = await runReadonlyTransaction<
      CloudSyncMetaRecord | undefined
    >(database, META_STORE, (store) => store.get(LAST_ACK_CURSOR_KEY));
    database.close();
    if (!record || typeof record.value !== "object" || record.value === null) {
      return null;
    }

    const maybeCursor = record.value as Partial<CloudSyncCursor>;
    if (
      typeof maybeCursor.sortKey !== "string" ||
      typeof maybeCursor.opId !== "string"
    ) {
      return null;
    }
    return { sortKey: maybeCursor.sortKey, opId: maybeCursor.opId };
  }

  async writeCursor(cursor: CloudSyncCursor): Promise<void> {
    const database = await openCloudSyncDb();
    await runReadwriteTransaction(database, META_STORE, (store) =>
      store.put({
        key: LAST_ACK_CURSOR_KEY,
        value: cursor,
      } satisfies CloudSyncMetaRecord),
    );
    database.close();
  }

  async readAppliedOpIds(): Promise<string[]> {
    const database = await openCloudSyncDb();
    const record = await runReadonlyTransaction<
      CloudSyncMetaRecord | undefined
    >(database, META_STORE, (store) => store.get(APPLIED_OP_IDS_KEY));
    database.close();
    return normalizeAppliedOpIds(record?.value);
  }

  async markOpAsApplied(opId: string): Promise<void> {
    const appliedOpIds = await this.readAppliedOpIds();
    if (appliedOpIds.includes(opId)) {
      return;
    }

    const nextAppliedOpIds = [...appliedOpIds, opId].slice(-1000);
    const database = await openCloudSyncDb();
    await runReadwriteTransaction(database, META_STORE, (store) =>
      store.put({
        key: APPLIED_OP_IDS_KEY,
        value: nextAppliedOpIds,
      } satisfies CloudSyncMetaRecord),
    );
    database.close();
  }

  async isOpApplied(opId: string): Promise<boolean> {
    const appliedOpIds = await this.readAppliedOpIds();
    return appliedOpIds.includes(opId);
  }

  async getNextClientSequence(): Promise<number> {
    const database = await openCloudSyncDb();
    const record = await runReadonlyTransaction<
      CloudSyncMetaRecord | undefined
    >(database, META_STORE, (store) => store.get(CLIENT_SEQUENCE_KEY));

    const currentValue =
      typeof record?.value === "number" && Number.isFinite(record.value)
        ? record.value
        : 0;
    const nextValue = currentValue + 1;
    await runReadwriteTransaction(database, META_STORE, (store) =>
      store.put({
        key: CLIENT_SEQUENCE_KEY,
        value: nextValue,
      } satisfies CloudSyncMetaRecord),
    );
    database.close();
    return nextValue;
  }

  async clearSyncState(): Promise<void> {
    const database = await openCloudSyncDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        [OUTBOX_STORE, META_STORE],
        "readwrite",
      );
      transaction.objectStore(OUTBOX_STORE).clear();
      transaction.objectStore(META_STORE).delete(LAST_ACK_CURSOR_KEY);
      transaction.objectStore(META_STORE).delete(APPLIED_OP_IDS_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }
}

export const cloudSyncStore = new IndexedDbCloudSyncStore();
