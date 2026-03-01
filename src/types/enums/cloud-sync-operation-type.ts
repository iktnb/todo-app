export const CloudSyncOperationType = {
  ReplaceSnapshot: "replace_snapshot",
} as const;

export type CloudSyncOperationType =
  (typeof CloudSyncOperationType)[keyof typeof CloudSyncOperationType];
