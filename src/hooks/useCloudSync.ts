import { useEffect, useMemo, useRef, useState } from "react";
import {
  CLOUD_SYNC_ENABLED,
  FIREBASE_DEVICE_ID_STORAGE_KEY,
  FIREBASE_SYNC_DEBOUNCE_MS,
} from "../constants/firebase";
import { CloudSyncStatusEnum } from "../types/enums";
import type { CloudSyncStatus } from "../types/enums/cloud-sync-status";
import type { BoardStateSnapshot } from "../types/interfaces/board-state-snapshot";
import type { AuthUser } from "../types/interfaces/auth/auth-user";
import type { CloudSyncState } from "../types/types/sync/cloud-sync-state";
import {
  hashBoardSnapshot,
  listenToCloudBoardDocument,
  mergeBoardSnapshots,
  pullCloudBoardDocument,
  pushCloudBoardDocument,
} from "../services/firebase-sync";

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
  const [status, setStatus] = useState<CloudSyncStatus>(
    CloudSyncStatusEnum.SignedOut,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const lastUploadedHashRef = useRef<string | null>(null);
  const isApplyingRemoteUpdateRef = useRef(false);
  const isHydratedRef = useRef(false);
  const localSnapshotRef = useRef(localSnapshot);

  useEffect(() => {
    localSnapshotRef.current = localSnapshot;
  }, [localSnapshot]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user) {
      isHydratedRef.current = false;
      lastUploadedHashRef.current = null;
      return;
    }

    const currentUser = user;
    let isCancelled = false;
    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }
      setStatus(CloudSyncStatusEnum.Syncing);
      setMessage(null);
    });

    async function initialize() {
      const cloudDocument = await pullCloudBoardDocument(currentUser.uid);
      if (isCancelled) {
        return;
      }

      if (!cloudDocument) {
        await pushCloudBoardDocument({
          uid: currentUser.uid,
          snapshot: localSnapshotRef.current,
          deviceId,
        });
        if (isCancelled) {
          return;
        }
        const hash = hashBoardSnapshot(localSnapshotRef.current);
        lastUploadedHashRef.current = hash;
        setStatus(CloudSyncStatusEnum.Synced);
        setLastSyncedAt(new Date().toISOString());
        isHydratedRef.current = true;
        return;
      }

      const localHash = hashBoardSnapshot(localSnapshotRef.current);
      const cloudHash = hashBoardSnapshot(cloudDocument.snapshot);

      if (localHash !== cloudHash) {
        setStatus(CloudSyncStatusEnum.NeedsAttention);
        const shouldReplaceLocal = window.confirm(t("sync.merge.prompt"));
        if (shouldReplaceLocal) {
          isApplyingRemoteUpdateRef.current = true;
          applySnapshot(cloudDocument.snapshot);
          lastUploadedHashRef.current = cloudHash;
        } else {
          const mergedSnapshot = mergeBoardSnapshots(
            localSnapshotRef.current,
            cloudDocument.snapshot,
          );
          const mergedHash = hashBoardSnapshot(mergedSnapshot);
          isApplyingRemoteUpdateRef.current = true;
          applySnapshot(mergedSnapshot);
          await pushCloudBoardDocument({
            uid: currentUser.uid,
            snapshot: mergedSnapshot,
            deviceId,
          });
          lastUploadedHashRef.current = mergedHash;
          setLastSyncedAt(new Date().toISOString());
        }
      } else {
        lastUploadedHashRef.current = localHash;
      }

      isHydratedRef.current = true;
      setStatus(CloudSyncStatusEnum.Synced);
      setMessage(null);
    }

    let unsubscribe = () => {};
    void initialize()
      .then(() => {
        if (isCancelled) {
          return;
        }

        unsubscribe = listenToCloudBoardDocument(
          currentUser.uid,
          (cloudDocument) => {
            if (isCancelled) {
              return;
            }

            const nextHash = hashBoardSnapshot(cloudDocument.snapshot);
            if (nextHash === lastUploadedHashRef.current) {
              return;
            }

            if (cloudDocument.deviceId === deviceId) {
              return;
            }

            isApplyingRemoteUpdateRef.current = true;
            applySnapshot(cloudDocument.snapshot);
            lastUploadedHashRef.current = nextHash;
            setStatus(CloudSyncStatusEnum.Synced);
            setLastSyncedAt(
              cloudDocument.updatedAt ?? new Date().toISOString(),
            );
            setMessage(null);
          },
          () => {
            if (isCancelled) {
              return;
            }

            setStatus(CloudSyncStatusEnum.Error);
            setMessage(t("sync.error.listen"));
          },
        );
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setStatus(CloudSyncStatusEnum.Error);
        setMessage(t("sync.error.init"));
      });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [applySnapshot, deviceId, t, user]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user || !isHydratedRef.current) {
      return;
    }

    if (isApplyingRemoteUpdateRef.current) {
      isApplyingRemoteUpdateRef.current = false;
      return;
    }

    if (!navigator.onLine) {
      queueMicrotask(() => {
        setStatus(CloudSyncStatusEnum.Offline);
        setMessage(t("sync.error.offline"));
      });
      return;
    }

    const nextHash = hashBoardSnapshot(localSnapshot);
    if (nextHash === lastUploadedHashRef.current) {
      return;
    }

    queueMicrotask(() => {
      setStatus(CloudSyncStatusEnum.Syncing);
      setMessage(null);
    });

    const timeoutId = window.setTimeout(() => {
      void pushCloudBoardDocument({
        uid: user.uid,
        snapshot: localSnapshot,
        deviceId,
      })
        .then(() => {
          lastUploadedHashRef.current = nextHash;
          setStatus(CloudSyncStatusEnum.Synced);
          setLastSyncedAt(new Date().toISOString());
        })
        .catch(() => {
          setStatus(CloudSyncStatusEnum.Error);
          setMessage(t("sync.error.push"));
        });
    }, FIREBASE_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deviceId, localSnapshot, t, user]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !user) {
      return;
    }

    function handleOnlineStatus() {
      if (!navigator.onLine) {
        setStatus(CloudSyncStatusEnum.Offline);
        return;
      }

      setStatus(CloudSyncStatusEnum.Synced);
      setMessage(null);
    }

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [user]);

  return {
    status: !CLOUD_SYNC_ENABLED
      ? CloudSyncStatusEnum.Disabled
      : !user
        ? CloudSyncStatusEnum.SignedOut
        : status,
    message,
    lastSyncedAt,
    user,
  };
}
