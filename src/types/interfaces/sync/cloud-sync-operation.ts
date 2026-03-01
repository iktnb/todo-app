import type { BoardStateSnapshot } from "../board-state-snapshot";
import type { CloudSyncOperationType } from "../../enums/cloud-sync-operation-type";

export interface CloudSyncOperation {
  opId: string;
  type: CloudSyncOperationType;
  deviceId: string;
  clientSeq: number;
  clientTime: string;
  sortKey: string;
  payload: BoardStateSnapshot;
}
