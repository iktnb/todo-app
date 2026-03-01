export const CloudSyncStatus = {
  Disabled: "disabled",
  SignedOut: "signed_out",
  Syncing: "syncing",
  Reconnecting: "reconnecting",
  CatchingUp: "catching_up",
  Recovered: "recovered",
  NeedsResync: "needs_resync",
  Synced: "synced",
  Offline: "offline",
  Error: "error",
  NeedsAttention: "needs_attention",
} as const;

export type CloudSyncStatus =
  (typeof CloudSyncStatus)[keyof typeof CloudSyncStatus];
