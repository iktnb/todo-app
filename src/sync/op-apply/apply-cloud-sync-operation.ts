import { CloudSyncOperationTypeEnum } from "../../types/enums";
import type { BoardStateSnapshot } from "../../types/interfaces/board-state-snapshot";
import type { CloudSyncOperation } from "../../types/interfaces/sync/cloud-sync-operation";
import { mergeBoardSnapshots } from "../../services/firebase-sync";

export function applyCloudSyncOperation(input: {
  currentSnapshot: BoardStateSnapshot;
  operation: CloudSyncOperation;
}): BoardStateSnapshot {
  if (input.operation.type === CloudSyncOperationTypeEnum.ReplaceSnapshot) {
    return mergeBoardSnapshots(input.currentSnapshot, input.operation.payload);
  }

  return input.currentSnapshot;
}
