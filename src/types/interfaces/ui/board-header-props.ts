import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { BackupActionResult } from "./backup-action-result";
import type { SomedayItem } from "../someday-item";
import type { Task } from "../task";

export interface BoardHeaderProps {
  onResetLocalData: () => void;
  onResetCloudData: () => Promise<BackupActionResult>;
  onOpenGuide: () => void;
  onOpenReview: () => void;
  taskInput: string;
  setTaskInput: Dispatch<SetStateAction<string>>;
  onCaptureItem: (event: FormEvent<HTMLFormElement>) => void;
  isCloudSyncEnabled: boolean;
  onSignOut: () => Promise<void>;
  cloudSyncStatusLabel: string;
  cloudSyncQueueLength: number;
  cloudSyncPendingUploads: number;
  cloudSyncLastAckSortKey: string | null;
  archivedTasks: Task[];
  somedayItems: SomedayItem[];
  onUnarchiveTask: (taskId: string) => void;
  onMoveSomedayToInbox: (itemId: string) => void;
}
