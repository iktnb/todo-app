import type { Column } from "./column";
import type { Task } from "./task";

export interface LegacyBoardStateSnapshot {
  version: 1;
  columns: Column[];
  tasks: Task[];
}
