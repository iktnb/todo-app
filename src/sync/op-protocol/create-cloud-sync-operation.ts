import { CloudSyncOperationTypeEnum } from "../../types/enums";
import type { BoardStateSnapshot } from "../../types/interfaces/board-state-snapshot";
import type { CloudSyncOperation } from "../../types/interfaces/sync/cloud-sync-operation";

function padClientSequence(sequence: number): string {
  return String(sequence).padStart(12, "0");
}

export function createCloudSyncOperation(input: {
  deviceId: string;
  clientSeq: number;
  snapshot: BoardStateSnapshot;
}): CloudSyncOperation {
  const clientTime = new Date().toISOString();
  const opId = crypto.randomUUID();

  return {
    opId,
    type: CloudSyncOperationTypeEnum.ReplaceSnapshot,
    deviceId: input.deviceId,
    clientSeq: input.clientSeq,
    clientTime,
    sortKey: `${clientTime}_${input.deviceId}_${padClientSequence(input.clientSeq)}`,
    payload: input.snapshot,
  };
}
