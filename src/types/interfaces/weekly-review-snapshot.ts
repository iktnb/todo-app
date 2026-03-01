import type { WeeklyReviewCounters } from "./weekly-review-counters";

export interface WeeklyReviewSnapshot {
  startedAt: string;
  completedAt: string;
  completed: boolean;
  step: number;
  note: string;
  counters: WeeklyReviewCounters;
}
