export const BoardDashboardWidgetType = {
  TasksSummary: "tasks_summary",
  TaskStatusBreakdown: "task_status_breakdown",
  WaitingTasks: "waiting_tasks",
  ActivityHeatmap: "activity_heatmap",
} as const;

export type BoardDashboardWidgetType =
  (typeof BoardDashboardWidgetType)[keyof typeof BoardDashboardWidgetType];
