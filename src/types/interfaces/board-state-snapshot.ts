import type { Column } from "./column";
import type { Context } from "./context";
import type { Item } from "./item";
import type { NextAction } from "./next-action";
import type { Project } from "./project";
import type { SomedayItem } from "./someday-item";
import type { Task } from "./task";
import type { BoardUiPreferences } from "./ui/board-ui-preferences";
import type { WeeklyReviewSnapshot } from "./weekly-review-snapshot";

export interface BoardStateSnapshot {
  version: 8;
  columns: Column[];
  tasks: Task[];
  items: Item[];
  nextActions: NextAction[];
  projects: Project[];
  somedayItems: SomedayItem[];
  contexts: Context[];
  selectedContextId: string | null;
  legacyTaskIds: string[];
  isMigratedFromLegacy: boolean;
  currentReviewStep: number;
  weeklyReviewStartedAt: string | null;
  weeklyReviewNote: string;
  reviewHistory: WeeklyReviewSnapshot[];
  completionCountsByDate: Record<string, number>;
  uiPreferences: BoardUiPreferences;
}
