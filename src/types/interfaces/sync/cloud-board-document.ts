import type { BoardStateSnapshot } from "../board-state-snapshot";

export interface CloudBoardDocument {
  snapshot: BoardStateSnapshot;
  snapshotVersion: number;
  updatedAt: string | null;
  clientUpdatedAt: string;
  deviceId: string;
}
