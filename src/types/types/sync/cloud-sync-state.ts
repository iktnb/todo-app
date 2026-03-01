import type { AuthUser } from "../../interfaces/auth/auth-user";
import type { CloudSyncStatus } from "../../enums/cloud-sync-status";

export interface CloudSyncState {
  status: CloudSyncStatus;
  message: string | null;
  lastSyncedAt: string | null;
  user: AuthUser | null;
}
