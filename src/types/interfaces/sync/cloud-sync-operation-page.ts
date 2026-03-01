import type { CloudSyncCursor } from "./cloud-sync-cursor";
import type { CloudSyncOperation } from "./cloud-sync-operation";

export interface CloudSyncOperationPage {
  operations: CloudSyncOperation[];
  nextCursor: CloudSyncCursor | null;
}
