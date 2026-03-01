import type { Task } from "../task";

export interface BoardHeaderArchiveModalProps {
  isOpen: boolean;
  archivedTasks: Task[];
  onUnarchiveTask: (taskId: string) => void;
  onClose: () => void;
}
