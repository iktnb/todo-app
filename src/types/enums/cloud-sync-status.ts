export const CloudSyncStatus = {
  Disabled: "disabled",
  SignedOut: "signed_out",
  Syncing: "syncing",
  Synced: "synced",
  Offline: "offline",
  Error: "error",
  NeedsAttention: "needs_attention",
} as const;

export type CloudSyncStatus =
  (typeof CloudSyncStatus)[keyof typeof CloudSyncStatus];
