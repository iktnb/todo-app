import type { ReactNode } from "react";
import {
  BoardDashboardWidgetTypeEnum,
  type HeatmapSensitivity,
  type BoardDashboardWidgetType,
} from "../../../types/enums";
import type { Task, TaskStatus } from "../../../types/board";
import type { BoardDashboardLayout } from "../../../types/interfaces/ui";
import { useI18n } from "../../../i18n/useI18n";
import { DashboardWidgetGrid } from "./DashboardWidgetGrid";
import { TasksSummaryWidget } from "./widgets/TasksSummaryWidget";
import { TaskStatusBreakdownWidget } from "./widgets/TaskStatusBreakdownWidget";
import { ActivityHeatmapWidget } from "./widgets/ActivityHeatmapWidget";
import { WaitingTasksWidget } from "./widgets/WaitingTasksWidget";

interface BoardDashboardPanelProps {
  dashboardLayout: BoardDashboardLayout;
  dashboardSummary: {
    inboxTasksTotal: number;
    inboxDoneTasks: number;
    inboxWaitingTasks: number;
    nextActionsDone: number;
    projectsDone: number;
  };
  dashboardTaskStatusCounts: Record<TaskStatus, number>;
  waitingTasks: Task[];
  onSetWaitingTaskStatus: (taskId: string, nextStatus: TaskStatus) => void;
  dashboardActivityByDate: Record<string, number>;
  heatmapSensitivity: HeatmapSensitivity;
  onMoveWidget: (
    draggedWidgetType: BoardDashboardWidgetType,
    targetWidgetType: BoardDashboardWidgetType,
  ) => void;
  onHideWidget: (widgetType: BoardDashboardWidgetType) => void;
  onShowWidget: (widgetType: BoardDashboardWidgetType) => void;
  onResetLayout: () => void;
  onUpdateHeatmapSensitivity: (nextSensitivity: HeatmapSensitivity) => void;
}

const DASHBOARD_WIDGET_TYPES: BoardDashboardWidgetType[] = [
  BoardDashboardWidgetTypeEnum.TasksSummary,
  BoardDashboardWidgetTypeEnum.TaskStatusBreakdown,
  BoardDashboardWidgetTypeEnum.WaitingTasks,
  BoardDashboardWidgetTypeEnum.ActivityHeatmap,
];

export function BoardDashboardPanel({
  dashboardLayout,
  dashboardSummary,
  dashboardTaskStatusCounts,
  waitingTasks,
  onSetWaitingTaskStatus,
  dashboardActivityByDate,
  heatmapSensitivity,
  onMoveWidget,
  onHideWidget,
  onShowWidget,
  onResetLayout,
  onUpdateHeatmapSensitivity,
}: BoardDashboardPanelProps) {
  const { t } = useI18n();
  const hiddenWidgetsSet = new Set(dashboardLayout.hiddenWidgets);
  const visibleWidgets = dashboardLayout.widgetOrder.filter(
    (widgetType) => !hiddenWidgetsSet.has(widgetType),
  );
  const hiddenWidgets = DASHBOARD_WIDGET_TYPES.filter((widgetType) =>
    hiddenWidgetsSet.has(widgetType),
  );

  const widgetTitles: Record<BoardDashboardWidgetType, string> = {
    [BoardDashboardWidgetTypeEnum.TasksSummary]: t("board.dashboard.widget.summary"),
    [BoardDashboardWidgetTypeEnum.TaskStatusBreakdown]: t(
      "board.dashboard.widget.statuses",
    ),
    [BoardDashboardWidgetTypeEnum.ActivityHeatmap]: t(
      "board.dashboard.widget.activity",
    ),
    [BoardDashboardWidgetTypeEnum.WaitingTasks]: t(
      "board.dashboard.widget.waiting",
    ),
  };

  const widgetContentByType: Record<BoardDashboardWidgetType, ReactNode> = {
    [BoardDashboardWidgetTypeEnum.TasksSummary]: (
      <TasksSummaryWidget {...dashboardSummary} />
    ),
    [BoardDashboardWidgetTypeEnum.TaskStatusBreakdown]: (
      <TaskStatusBreakdownWidget statusCounts={dashboardTaskStatusCounts} />
    ),
    [BoardDashboardWidgetTypeEnum.WaitingTasks]: (
      <WaitingTasksWidget
        tasks={waitingTasks}
        onSetTaskStatus={onSetWaitingTaskStatus}
      />
    ),
    [BoardDashboardWidgetTypeEnum.ActivityHeatmap]: (
      <ActivityHeatmapWidget
        activityByDate={dashboardActivityByDate}
        sensitivity={heatmapSensitivity}
        onSensitivityChange={onUpdateHeatmapSensitivity}
      />
    ),
  };

  return (
    <aside className="grid min-h-0 content-start gap-2 overflow-y-auto pr-0.5">
      <header className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-500/35 bg-slate-950/30 px-3 py-2">
        <h2 className="m-0 text-sm font-semibold text-slate-100">
          {t("board.dashboard.title")}
        </h2>
        <button
          className="cursor-pointer rounded-lg border border-slate-500/50 bg-slate-900/40 px-2 py-1 text-xs text-slate-200 hover:border-slate-300/60"
          type="button"
          onClick={onResetLayout}
        >
          {t("board.dashboard.reset")}
        </button>
        {hiddenWidgets.map((widgetType) => (
          <button
            key={widgetType}
            className="cursor-pointer rounded-lg border border-sky-400/45 bg-sky-500/15 px-2 py-1 text-xs text-sky-100 hover:border-sky-300/70"
            type="button"
            onClick={() => onShowWidget(widgetType)}
          >
            + {widgetTitles[widgetType]}
          </button>
        ))}
      </header>

      {visibleWidgets.length === 0 ? (
        <p className="m-0 rounded-xl border border-slate-600/40 bg-slate-900/25 p-3 text-sm text-slate-300">
          {t("board.dashboard.empty")}
        </p>
      ) : (
        <DashboardWidgetGrid
          items={visibleWidgets.map((widgetType) => ({
            type: widgetType,
            title: widgetTitles[widgetType],
            content: widgetContentByType[widgetType],
          }))}
          onMoveWidget={onMoveWidget}
          onRemoveWidget={onHideWidget}
        />
      )}
    </aside>
  );
}
