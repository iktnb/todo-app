import type { DragEvent, ReactNode } from "react";
import {
  BoardDashboardWidgetTypeEnum,
  type BoardDashboardWidgetType,
} from "../../../types/enums";
import { DashboardWidgetFrame } from "../../../../design-system/components";

interface DashboardWidgetCardProps {
  widgetType: BoardDashboardWidgetType;
  title: string;
  children: ReactNode;
  onMoveWidget: (
    draggedWidgetType: BoardDashboardWidgetType,
    targetWidgetType: BoardDashboardWidgetType,
  ) => void;
  onRemoveWidget: (widgetType: BoardDashboardWidgetType) => void;
}

const DRAG_WIDGET_MIME = "application/x-board-dashboard-widget-type";
const WIDGET_TYPES = [
  BoardDashboardWidgetTypeEnum.TasksSummary,
  BoardDashboardWidgetTypeEnum.TaskStatusBreakdown,
  BoardDashboardWidgetTypeEnum.WaitingTasks,
  BoardDashboardWidgetTypeEnum.ActivityHeatmap,
];

function isBoardDashboardWidgetType(
  value: string,
): value is BoardDashboardWidgetType {
  return WIDGET_TYPES.includes(value as BoardDashboardWidgetType);
}

export function DashboardWidgetCard({
  widgetType,
  title,
  children,
  onMoveWidget,
  onRemoveWidget,
}: DashboardWidgetCardProps) {
  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_WIDGET_MIME, widgetType);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const draggedWidgetType = event.dataTransfer.getData(DRAG_WIDGET_MIME);
    if (!isBoardDashboardWidgetType(draggedWidgetType)) {
      return;
    }
    onMoveWidget(draggedWidgetType, widgetType);
  }

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="h-full cursor-grab active:cursor-grabbing"
    >
      <DashboardWidgetFrame
        className="h-full"
        title={title}
        actions={
          <button
            className="cursor-pointer rounded-md border border-slate-500/40 bg-slate-900/35 px-1.5 py-0.5 text-xs text-slate-200 hover:border-slate-300/60"
            type="button"
            onClick={() => onRemoveWidget(widgetType)}
            aria-label={title}
          >
            -
          </button>
        }
      >
        {children}
      </DashboardWidgetFrame>
    </article>
  );
}
