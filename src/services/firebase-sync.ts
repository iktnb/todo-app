import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  limit,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { BOARD_SNAPSHOT_VERSION } from "../constants/storage";
import { firebaseFirestore } from "../lib/firebase/client";
import type { BoardStateSnapshot } from "../types/interfaces/board-state-snapshot";
import type { CloudBoardDocument } from "../types/interfaces/sync/cloud-board-document";
import type { CloudSyncCursor } from "../types/interfaces/sync/cloud-sync-cursor";
import type { CloudSyncOperation } from "../types/interfaces/sync/cloud-sync-operation";
import type { CloudSyncOperationPage } from "../types/interfaces/sync/cloud-sync-operation-page";

function getBoardDocRef(uid: string) {
  if (!firebaseFirestore) {
    return null;
  }

  return doc(firebaseFirestore, "users", uid, "boardState", "current");
}

function getSyncOpsCollectionRef(uid: string) {
  if (!firebaseFirestore) {
    return null;
  }
  return collection(firebaseFirestore, "users", uid, "syncOps");
}

function getSyncOpDocRef(uid: string, opId: string) {
  const syncOpsCollectionRef = getSyncOpsCollectionRef(uid);
  if (!syncOpsCollectionRef) {
    return null;
  }
  return doc(syncOpsCollectionRef, opId);
}

function isBoardSnapshot(value: unknown): value is BoardStateSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === BOARD_SNAPSHOT_VERSION
  );
}

function readUpdatedAt(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function toCloudBoardDocument(data: unknown): CloudBoardDocument | null {
  if (
    typeof data !== "object" ||
    data === null ||
    !("snapshot" in data) ||
    !isBoardSnapshot(data.snapshot) ||
    !("snapshotVersion" in data) ||
    typeof data.snapshotVersion !== "number" ||
    !("clientUpdatedAt" in data) ||
    typeof data.clientUpdatedAt !== "string" ||
    !("deviceId" in data) ||
    typeof data.deviceId !== "string"
  ) {
    return null;
  }

  return {
    snapshot: data.snapshot,
    snapshotVersion: data.snapshotVersion,
    updatedAt: "updatedAt" in data ? readUpdatedAt(data.updatedAt) : null,
    clientUpdatedAt: data.clientUpdatedAt,
    deviceId: data.deviceId,
    cursorSortKey:
      "cursorSortKey" in data && typeof data.cursorSortKey === "string"
        ? data.cursorSortKey
        : undefined,
    cursorOpId:
      "cursorOpId" in data && typeof data.cursorOpId === "string"
        ? data.cursorOpId
        : undefined,
  };
}

export async function pullCloudBoardDocument(
  uid: string,
): Promise<CloudBoardDocument | null> {
  const boardRef = getBoardDocRef(uid);
  if (!boardRef) {
    return null;
  }

  const snapshot = await getDoc(boardRef);
  if (!snapshot.exists()) {
    return null;
  }

  return toCloudBoardDocument(snapshot.data());
}

export async function pushCloudBoardDocument(input: {
  uid: string;
  snapshot: BoardStateSnapshot;
  deviceId: string;
  cursor?: CloudSyncCursor | null;
}): Promise<void> {
  const boardRef = getBoardDocRef(input.uid);
  if (!boardRef) {
    return;
  }

  await setDoc(boardRef, {
    snapshot: input.snapshot,
    snapshotVersion: BOARD_SNAPSHOT_VERSION,
    clientUpdatedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
    deviceId: input.deviceId,
    cursorSortKey: input.cursor?.sortKey ?? null,
    cursorOpId: input.cursor?.opId ?? null,
  });
}

function isCloudSyncOperation(data: unknown): data is CloudSyncOperation {
  return (
    typeof data === "object" &&
    data !== null &&
    "opId" in data &&
    typeof data.opId === "string" &&
    "type" in data &&
    typeof data.type === "string" &&
    "deviceId" in data &&
    typeof data.deviceId === "string" &&
    "clientSeq" in data &&
    typeof data.clientSeq === "number" &&
    Number.isFinite(data.clientSeq) &&
    "clientTime" in data &&
    typeof data.clientTime === "string" &&
    "sortKey" in data &&
    typeof data.sortKey === "string" &&
    "payload" in data &&
    isBoardSnapshot(data.payload)
  );
}

export async function appendCloudSyncOperation(input: {
  uid: string;
  operation: CloudSyncOperation;
}): Promise<void> {
  const opRef = getSyncOpDocRef(input.uid, input.operation.opId);
  if (!opRef) {
    return;
  }

  await setDoc(opRef, {
    ...input.operation,
    createdAt: serverTimestamp(),
  });
}

export async function listCloudSyncOperationsSince(input: {
  uid: string;
  cursor: CloudSyncCursor | null;
  pageSize: number;
}): Promise<CloudSyncOperationPage> {
  const syncOpsCollectionRef = getSyncOpsCollectionRef(input.uid);
  if (!syncOpsCollectionRef) {
    return {
      operations: [],
      nextCursor: input.cursor,
    };
  }

  const constraints: QueryConstraint[] = [
    orderBy("sortKey", "asc"),
    orderBy("opId", "asc"),
    limit(input.pageSize),
  ];
  if (input.cursor) {
    constraints.splice(
      2,
      0,
      startAfter(input.cursor.sortKey, input.cursor.opId),
    );
  }

  const snapshot = await getDocs(query(syncOpsCollectionRef, ...constraints));
  const operations: CloudSyncOperation[] = [];
  for (const documentSnapshot of snapshot.docs) {
    const data = documentSnapshot.data();
    if (!isCloudSyncOperation(data)) {
      continue;
    }
    operations.push(data);
  }

  const lastOperation = operations[operations.length - 1] ?? null;
  return {
    operations,
    nextCursor: lastOperation
      ? { sortKey: lastOperation.sortKey, opId: lastOperation.opId }
      : input.cursor,
  };
}

export function listenToCloudSyncOperationsSince(
  uid: string,
  cursor: CloudSyncCursor | null,
  onChange: (operation: CloudSyncOperation) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const syncOpsCollectionRef = getSyncOpsCollectionRef(uid);
  if (!syncOpsCollectionRef) {
    return () => {};
  }

  const constraints: QueryConstraint[] = [
    orderBy("sortKey", "asc"),
    orderBy("opId", "asc"),
  ];
  if (cursor) {
    constraints.push(startAfter(cursor.sortKey, cursor.opId));
  }

  return onSnapshot(
    query(syncOpsCollectionRef, ...constraints),
    (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== "added") {
          continue;
        }
        const data = change.doc.data();
        if (isCloudSyncOperation(data)) {
          onChange(data);
        }
      }
    },
    (error) => onError(error),
  );
}

export function listenToCloudBoardDocument(
  uid: string,
  onChange: (document: CloudBoardDocument) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const boardRef = getBoardDocRef(uid);
  if (!boardRef) {
    return () => {};
  }

  return onSnapshot(
    boardRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const cloudDocument = toCloudBoardDocument(snapshot.data());
      if (cloudDocument) {
        onChange(cloudDocument);
      }
    },
    (error) => {
      onError(error);
    },
  );
}

function mergeById<T extends { id: string }>(
  cloudItems: T[],
  localItems: T[],
): T[] {
  const map = new Map<string, T>();
  for (const cloudItem of cloudItems) {
    map.set(cloudItem.id, cloudItem);
  }
  for (const localItem of localItems) {
    map.set(localItem.id, localItem);
  }
  return [...map.values()];
}

function mergeReviewHistory(
  cloud: BoardStateSnapshot["reviewHistory"],
  local: BoardStateSnapshot["reviewHistory"],
): BoardStateSnapshot["reviewHistory"] {
  const entries = new Map<
    string,
    BoardStateSnapshot["reviewHistory"][number]
  >();
  for (const entry of cloud) {
    entries.set(`${entry.startedAt}-${entry.completedAt}`, entry);
  }
  for (const entry of local) {
    entries.set(`${entry.startedAt}-${entry.completedAt}`, entry);
  }
  return [...entries.values()].slice(0, 10);
}

export function mergeBoardSnapshots(
  localSnapshot: BoardStateSnapshot,
  cloudSnapshot: BoardStateSnapshot,
): BoardStateSnapshot {
  const mergedContexts = mergeById(
    cloudSnapshot.contexts,
    localSnapshot.contexts,
  );

  const mergedSelectedContextId =
    localSnapshot.selectedContextId &&
    mergedContexts.some(
      (context) => context.id === localSnapshot.selectedContextId,
    )
      ? localSnapshot.selectedContextId
      : cloudSnapshot.selectedContextId &&
          mergedContexts.some(
            (context) => context.id === cloudSnapshot.selectedContextId,
          )
        ? cloudSnapshot.selectedContextId
        : null;

  return {
    version: BOARD_SNAPSHOT_VERSION,
    columns: mergeById(cloudSnapshot.columns, localSnapshot.columns),
    tasks: mergeById(cloudSnapshot.tasks, localSnapshot.tasks),
    items: mergeById(cloudSnapshot.items, localSnapshot.items),
    nextActions: mergeById(
      cloudSnapshot.nextActions,
      localSnapshot.nextActions,
    ),
    projects: mergeById(cloudSnapshot.projects, localSnapshot.projects),
    somedayItems: mergeById(
      cloudSnapshot.somedayItems,
      localSnapshot.somedayItems,
    ),
    contexts: mergedContexts,
    selectedContextId: mergedSelectedContextId,
    legacyTaskIds: [
      ...new Set([
        ...cloudSnapshot.legacyTaskIds,
        ...localSnapshot.legacyTaskIds,
      ]),
    ],
    isMigratedFromLegacy:
      cloudSnapshot.isMigratedFromLegacy || localSnapshot.isMigratedFromLegacy,
    currentReviewStep: Math.max(
      cloudSnapshot.currentReviewStep,
      localSnapshot.currentReviewStep,
    ),
    weeklyReviewStartedAt:
      localSnapshot.weeklyReviewStartedAt ??
      cloudSnapshot.weeklyReviewStartedAt,
    weeklyReviewNote:
      localSnapshot.weeklyReviewNote.trim().length > 0
        ? localSnapshot.weeklyReviewNote
        : cloudSnapshot.weeklyReviewNote,
    reviewHistory: mergeReviewHistory(
      cloudSnapshot.reviewHistory,
      localSnapshot.reviewHistory,
    ),
  };
}

export function hashBoardSnapshot(snapshot: BoardStateSnapshot): string {
  return JSON.stringify(snapshot);
}
