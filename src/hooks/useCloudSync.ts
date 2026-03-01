import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  CLOUD_SYNC_ENABLED,
  FIREBASE_DEVICE_ID_STORAGE_KEY,
  FIREBASE_SYNC_MAX_CATCH_UP_PAGES,
  FIREBASE_SYNC_PAGE_SIZE,
  FIREBASE_SYNC_DEBOUNCE_MS,
} from "../constants/firebase";
import { CloudSyncStatusEnum } from "../types/enums";
import type { BoardStateSnapshot } from "../types/interfaces/board-state-snapshot";
import type { AuthUser } from "../types/interfaces/auth/auth-user";
import type { CloudSyncOperation } from "../types/interfaces/sync/cloud-sync-operation";
import type { CloudSyncState } from "../types/types/sync/cloud-sync-state";
import {
  appendCloudSyncOperation,
  hashBoardSnapshot,
  listCloudSyncOperationsSince,
  listenToCloudSyncOperationsSince,
  listenToCloudBoardDocument,
  mergeBoardSnapshots,
  pullCloudBoardDocument,
  pushCloudBoardDocument,
} from "../services/firebase-sync";
import { applyCloudSyncOperation } from "../sync/op-apply/apply-cloud-sync-operation";
import { cloudSyncStore } from "../sync/op-queue/indexeddb-cloud-sync-store";
import {
  cloudSyncEngineReducer,
  initialCloudSyncEngineState,
  toCloudSyncState,
} from "../sync/op-queue/cloud-sync-engine-reducer";
import { createCloudSyncOperation } from "../sync/op-protocol/create-cloud-sync-operation";

interface UseCloudSyncInput {
  localSnapshot: BoardStateSnapshot;
  applySnapshot: (snapshot: BoardStateSnapshot) => void;
  user: AuthUser | null;
  t: (key: string) => string;
}

function resolveDeviceId(): string {
  const existingDeviceId = localStorage.getItem(FIREBASE_DEVICE_ID_STORAGE_KEY);
  if (existingDeviceId && existingDeviceId.trim().length > 0) {
    return existingDeviceId;
  }

  const nextDeviceId = crypto.randomUUID();
  localStorage.setItem(FIREBASE_DEVICE_ID_STORAGE_KEY, nextDeviceId);
  return nextDeviceId;
}

export function useCloudSync(input: UseCloudSyncInput): CloudSyncState {
  const { localSnapshot, applySnapshot, user, t } = input;
  const deviceId = useMemo(() => resolveDeviceId(), []);
  const [state, dispatch] = useReducer(
    cloudSyncEngineReducer,
    initialCloudSyncEngineState,
  );
  const isSyncLoopRunningRef = useRef(false);
  const isApplyingRemoteUpdateRef = useRef(false);
  const isHydratedRef = useRef(false);
  const localSnapshotRef = useRef(localSnapshot);
  const pendingFlushTimeoutRef = useRef<number | null>(null);
  const lastQueuedSnapshotHashRef = useRef<string | null>(null);
  const cloudOpsUnsubscribeRef = useRef<(() => void) | null>(null);
  const cloudBoardUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    localSnapshotRef.current = localSnapshot;
  }, [localSnapshot]);

  const refreshQueueMetrics = useCallback(async () => {
    const queueLength = await cloudSyncStore.getQueueLength();
    const cursor = await cloudSyncStore.readCursor();
    dispatch({
      type: "set_metrics",
      queueLength,
      lastAckSortKey: cursor?.sortKey ?? null,
    });
  }, []);

  const applyIncomingOperation = useCallback(
    async (
      operation: CloudSyncOperation,
      currentUser: AuthUser,
    ): Promise<void> => {
      const alreadyApplied = await cloudSyncStore.isOpApplied(operation.opId);
      if (alreadyApplied) {
        await cloudSyncStore.writeCursor({
          sortKey: operation.sortKey,
          opId: operation.opId,
        });
        dispatch({
          type: "set_metrics",
          lastAckSortKey: operation.sortKey,
        });
        return;
      }

      if (operation.deviceId !== deviceId) {
        const pendingQueueLength = await cloudSyncStore.getQueueLength();
        if (pendingQueueLength > 0) {
          const mergedSnapshot = mergeBoardSnapshots(
            localSnapshotRef.current,
            operation.payload,
          );
          isApplyingRemoteUpdateRef.current = true;
          applySnapshot(mergedSnapshot);

          const nextClientSequence =
            await cloudSyncStore.getNextClientSequence();
          const mergedOperation = createCloudSyncOperation({
            deviceId,
            clientSeq: nextClientSequence,
            snapshot: mergedSnapshot,
          });
          await cloudSyncStore.replaceOutboxWithOperation(mergedOperation);
        } else {
          const nextSnapshot = applyCloudSyncOperation({
            currentSnapshot: localSnapshotRef.current,
            operation,
          });
          isApplyingRemoteUpdateRef.current = true;
          applySnapshot(nextSnapshot);
        }
      }

      await cloudSyncStore.markOpAsApplied(operation.opId);
      await cloudSyncStore.writeCursor({
        sortKey: operation.sortKey,
        opId: operation.opId,
      });
      dispatch({
        type: "set_metrics",
        lastAckSortKey: operation.sortKey,
      });
      await pushCloudBoardDocument({
        uid: currentUser.uid,
        snapshot: localSnapshotRef.current,
        deviceId,
        cursor: { sortKey: operation.sortKey, opId: operation.opId },
      });
      await refreshQueueMetrics();
    },
    [applySnapshot, deviceId, refreshQueueMetrics],
  );

  const catchUpOperations = useCallback(
    async (currentUser: AuthUser): Promise<void> => {
      let cursor = await cloudSyncStore.readCursor();
      let pagesProcessed = 0;

      dispatch({ type: "set_status", status: CloudSyncStatusEnum.CatchingUp });
      dispatch({ type: "set_message", message: null });

      while (pagesProcessed < FIREBASE_SYNC_MAX_CATCH_UP_PAGES) {
        const page = await listCloudSyncOperationsSince({
          uid: currentUser.uid,
          cursor,
          pageSize: FIREBASE_SYNC_PAGE_SIZE,
        });

        if (page.operations.length === 0) {
          break;
        }

        for (const operation of page.operations) {
          if (cursor && operation.sortKey < cursor.sortKey) {
            dispatch({
              type: "set_status",
              status: CloudSyncStatusEnum.NeedsResync,
            });
            dispatch({ type: "set_message", message: t("sync.error.resync") });
            return;
          }

          await applyIncomingOperation(operation, currentUser);
          cursor = { sortKey: operation.sortKey, opId: operation.opId };
        }

        pagesProcessed += 1;
      }

      if (pagesProcessed >= FIREBASE_SYNC_MAX_CATCH_UP_PAGES) {
        dispatch({
          type: "set_status",
          status: CloudSyncStatusEnum.NeedsResync,
        });
        dispatch({ type: "set_message", message: t("sync.error.resync") });
        return;
      }

      dispatch({ type: "set_status", status: CloudSyncStatusEnum.Recovered });
      dispatch({ type: "set_last_synced_at", value: new Date().toISOString() });
    },
    [applyIncomingOperation, t],
  );

  const flushOutbox = useCallback(
    async (currentUser: AuthUser): Promise<void> => {
      if (isSyncLoopRunningRef.current) {
        return;
      }

      if (!navigator.onLine) {
        dispatch({ type: "set_status", status: CloudSyncStatusEnum.Offline });
        dispatch({ type: "set_message", message: t("sync.error.offline") });
        return;
      }

      isSyncLoopRunningRef.current = true;
      dispatch({ type: "set_status", status: CloudSyncStatusEnum.Syncing });
      dispatch({ type: "set_message", message: null });

      try {
        while (true) {
          const operations = await cloudSyncStore.getReadyOperations(20);
          if (operations.length === 0) {
            break;
          }

          dispatch({
            type: "set_metrics",
            pendingUploads: operations.length,
          });

          for (const operation of operations) {
            try {
              await appendCloudSyncOperation({
                uid: currentUser.uid,
                operation,
              });
              await pushCloudBoardDocument({
                uid: currentUser.uid,
                snapshot: operation.payload,
                deviceId,
                cursor: { sortKey: operation.sortKey, opId: operation.opId },
              });
              await cloudSyncStore.markOpAsApplied(operation.opId);
              await cloudSyncStore.writeCursor({
                sortKey: operation.sortKey,
                opId: operation.opId,
              });
              await cloudSyncStore.removeOperation(operation.opId);
              dispatch({
                type: "set_metrics",
                lastAckSortKey: operation.sortKey,
              });
              dispatch({
                type: "set_last_synced_at",
                value: new Date().toISOString(),
              });
            } catch {
              await cloudSyncStore.markOperationAttemptFailed(operation.opId);
              dispatch({
                type: "set_status",
                status: CloudSyncStatusEnum.Error,
              });
              dispatch({ type: "set_message", message: t("sync.error.push") });
              await refreshQueueMetrics();
              return;
            }
          }
        }
      } finally {
        isSyncLoopRunningRef.current = false;
        dispatch({ type: "set_metrics", pendingUploads: 0 });
        await refreshQueueMetrics();
        const queueLength = await cloudSyncStore.getQueueLength();
        dispatch({
          type: "set_status",
          status:
            queueLength === 0
              ? CloudSyncStatusEnum.Synced
              : CloudSyncStatusEnum.Syncing,
        });
      }
    },
    [deviceId, refreshQueueMetrics, t],
  );

  const scheduleFlush = useCallback(
    (currentUser: AuthUser) => {
      if (pendingFlushTimeoutRef.current !== null) {
        window.clearTimeout(pendingFlushTimeoutRef.current);
      }
      pendingFlushTimeoutRef.current = window.setTimeout(() => {
        void flushOutbox(currentUser);
      }, FIREBASE_SYNC_DEBOUNCE_MS);
    },
    [flushOutbox],
  );

  const enqueueSnapshotAsOperation = useCallback(
    async (currentUser: AuthUser): Promise<void> => {
      const snapshotHash = hashBoardSnapshot(localSnapshotRef.current);
      if (snapshotHash === lastQueuedSnapshotHashRef.current) {
        return;
      }
      lastQueuedSnapshotHashRef.current = snapshotHash;

      const nextClientSequence = await cloudSyncStore.getNextClientSequence();
      const operation = createCloudSyncOperation({
        deviceId,
        clientSeq: nextClientSequence,
        snapshot: localSnapshotRef.current,
      });
      await cloudSyncStore.enqueueOperation(operation);
      await refreshQueueMetrics();
      scheduleFlush(currentUser);
    },
    [deviceId, refreshQueueMetrics, scheduleFlush],
  );

  const cleanupListeners = useCallback(() => {
    if (cloudOpsUnsubscribeRef.current) {
      cloudOpsUnsubscribeRef.current();
      cloudOpsUnsubscribeRef.current = null;
    }
    if (cloudBoardUnsubscribeRef.current) {
      cloudBoardUnsubscribeRef.current();
      cloudBoardUnsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    dispatch({ type: "set_user", user });

    if (!CLOUD_SYNC_ENABLED || !user) {
      isHydratedRef.current = false;
      cleanupListeners();
      return;
    }

    const currentUser = user;
    let isCancelled = false;
    dispatch({ type: "reset", user: currentUser });

    async function initialize() {
      await refreshQueueMetrics();
      const cloudDocument = await pullCloudBoardDocument(currentUser.uid);
      if (isCancelled) {
        return;
      }

      if (!cloudDocument) {
        await enqueueSnapshotAsOperation(currentUser);
      } else {
        const localHash = hashBoardSnapshot(localSnapshotRef.current);
        const cloudHash = hashBoardSnapshot(cloudDocument.snapshot);

        if (localHash !== cloudHash) {
          const mergedSnapshot = mergeBoardSnapshots(
            localSnapshotRef.current,
            cloudDocument.snapshot,
          );
          isApplyingRemoteUpdateRef.current = true;
          applySnapshot(mergedSnapshot);
          localSnapshotRef.current = mergedSnapshot;
          await enqueueSnapshotAsOperation(currentUser);
        } else if (cloudDocument.cursorSortKey && cloudDocument.cursorOpId) {
          await cloudSyncStore.writeCursor({
            sortKey: cloudDocument.cursorSortKey,
            opId: cloudDocument.cursorOpId,
          });
        }
      }

      await catchUpOperations(currentUser);
      await flushOutbox(currentUser);
      isHydratedRef.current = true;
      dispatch({ type: "set_status", status: CloudSyncStatusEnum.Synced });
      dispatch({ type: "set_message", message: null });
    }

    void initialize()
      .then(() => {
        if (isCancelled) {
          return;
        }
        cloudOpsUnsubscribeRef.current = listenToCloudSyncOperationsSince(
          currentUser.uid,
          null,
          (operation) => {
            void applyIncomingOperation(operation, currentUser).catch(() => {
              dispatch({
                type: "set_status",
                status: CloudSyncStatusEnum.Error,
              });
              dispatch({
                type: "set_message",
                message: t("sync.error.listen"),
              });
            });
          },
          () => {
            dispatch({ type: "set_status", status: CloudSyncStatusEnum.Error });
            dispatch({ type: "set_message", message: t("sync.error.listen") });
          },
        );

        cloudBoardUnsubscribeRef.current = listenToCloudBoardDocument(
          currentUser.uid,
          () => {
            // Board document listener is retained as an anti-entropy fallback source.
          },
          () => {},
        );
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        dispatch({ type: "set_status", status: CloudSyncStatusEnum.Error });
        dispatch({ type: "set_message", message: t("sync.error.init") });
      });

    return () => {
      isCancelled = true;
      cleanupListeners();
      if (pendingFlushTimeoutRef.current !== null) {
        window.clearTimeout(pendingFlushTimeoutRef.current);
      }
    };
  }, [
    applyIncomingOperation,
    applySnapshot,
    catchUpOperations,
    cleanupListeners,
    deviceId,
    enqueueSnapshotAsOperation,
    flushOutbox,
    refreshQueueMetrics,
    t,
    user,
  ]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user || !isHydratedRef.current) {
      return;
    }

    if (isApplyingRemoteUpdateRef.current) {
      isApplyingRemoteUpdateRef.current = false;
      return;
    }

    void enqueueSnapshotAsOperation(user).catch(() => {
      dispatch({ type: "set_status", status: CloudSyncStatusEnum.Error });
      dispatch({ type: "set_message", message: t("sync.error.push") });
    });
  }, [enqueueSnapshotAsOperation, localSnapshot, t, user]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user) {
      return;
    }
    const currentUser = user;

    function handleOnlineStatus(): void {
      if (!navigator.onLine) {
        dispatch({ type: "set_status", status: CloudSyncStatusEnum.Offline });
        dispatch({ type: "set_message", message: t("sync.error.offline") });
        return;
      }

      dispatch({
        type: "set_status",
        status: CloudSyncStatusEnum.Reconnecting,
      });
      dispatch({ type: "set_message", message: null });
      void catchUpOperations(currentUser)
        .then(() => flushOutbox(currentUser))
        .then(() => {
          dispatch({
            type: "set_status",
            status: CloudSyncStatusEnum.Synced,
          });
        })
        .catch(() => {
          dispatch({
            type: "set_status",
            status: CloudSyncStatusEnum.NeedsResync,
          });
          dispatch({ type: "set_message", message: t("sync.error.resync") });
        });
    }

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [catchUpOperations, flushOutbox, t, user]);

  return toCloudSyncState(state, CLOUD_SYNC_ENABLED);
}
