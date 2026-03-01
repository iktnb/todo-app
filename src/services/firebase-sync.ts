import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { BOARD_SNAPSHOT_VERSION } from "../constants/storage";
import { firebaseFirestore } from "../lib/firebase/client";
import type { BoardStateSnapshot } from "../types/interfaces/board-state-snapshot";
import type { CloudBoardDocument } from "../types/interfaces/sync/cloud-board-document";

function getBoardDocRef(uid: string) {
  if (!firebaseFirestore) {
    return null;
  }

  return doc(firebaseFirestore, "users", uid, "boardState", "current");
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
  });
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
