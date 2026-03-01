export interface CloudSyncMetrics {
  queueLength: number;
  pendingUploads: number;
  lastAckSortKey: string | null;
}
