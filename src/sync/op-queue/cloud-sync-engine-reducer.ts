import { CloudSyncStatusEnum } from "../../types/enums";
import type { CloudSyncStatus } from "../../types/enums/cloud-sync-status";
import type { CloudSyncState } from "../../types/types/sync/cloud-sync-state";
import type { AuthUser } from "../../types/interfaces/auth/auth-user";

interface CloudSyncEngineState {
  status: CloudSyncStatus;
  message: string | null;
  lastSyncedAt: string | null;
  user: AuthUser | null;
  queueLength: number;
  pendingUploads: number;
  lastAckSortKey: string | null;
}

type CloudSyncEngineAction =
  | { type: "set_status"; status: CloudSyncStatus }
  | { type: "set_message"; message: string | null }
  | { type: "set_last_synced_at"; value: string | null }
  | { type: "set_user"; user: AuthUser | null }
  | {
      type: "set_metrics";
      queueLength?: number;
      pendingUploads?: number;
      lastAckSortKey?: string | null;
    }
  | { type: "reset"; user: AuthUser | null };

export const initialCloudSyncEngineState: CloudSyncEngineState = {
  status: CloudSyncStatusEnum.SignedOut,
  message: null,
  lastSyncedAt: null,
  user: null,
  queueLength: 0,
  pendingUploads: 0,
  lastAckSortKey: null,
};

export function cloudSyncEngineReducer(
  state: CloudSyncEngineState,
  action: CloudSyncEngineAction,
): CloudSyncEngineState {
  switch (action.type) {
    case "set_status":
      return { ...state, status: action.status };
    case "set_message":
      return { ...state, message: action.message };
    case "set_last_synced_at":
      return { ...state, lastSyncedAt: action.value };
    case "set_user":
      return { ...state, user: action.user };
    case "set_metrics":
      return {
        ...state,
        queueLength: action.queueLength ?? state.queueLength,
        pendingUploads: action.pendingUploads ?? state.pendingUploads,
        lastAckSortKey: action.lastAckSortKey ?? state.lastAckSortKey,
      };
    case "reset":
      return {
        ...initialCloudSyncEngineState,
        user: action.user,
        status: action.user
          ? CloudSyncStatusEnum.Syncing
          : CloudSyncStatusEnum.SignedOut,
      };
    default:
      return state;
  }
}

export function toCloudSyncState(
  state: CloudSyncEngineState,
  cloudSyncEnabled: boolean,
): CloudSyncState {
  return {
    status: !cloudSyncEnabled
      ? CloudSyncStatusEnum.Disabled
      : !state.user
        ? CloudSyncStatusEnum.SignedOut
        : state.status,
    message: state.message,
    lastSyncedAt: state.lastSyncedAt,
    user: state.user,
    metrics: {
      queueLength: state.queueLength,
      pendingUploads: state.pendingUploads,
      lastAckSortKey: state.lastAckSortKey,
    },
  };
}
