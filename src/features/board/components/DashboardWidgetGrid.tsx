import type { ReactNode } from "react";
import type { BoardDashboardWidgetType } from "../../../types/enums";
import { DashboardWidgetCard } from "./DashboardWidgetCard";

interface DashboardWidgetGridItem {
  type: BoardDashboardWidgetType;
  title: string;
  content: ReactNode;
}

interface DashboardWidgetGridProps {
  items: DashboardWidgetGridItem[];
  onMoveWidget: (
    draggedWidgetType: BoardDashboardWidgetType,
    targetWidgetType: BoardDashboardWidgetType,
  ) => void;
  onRemoveWidget: (widgetType: BoardDashboardWidgetType) => void;
}

export function DashboardWidgetGrid({
  items,
  onMoveWidget,
  onRemoveWidget,
}: DashboardWidgetGridProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-2.5 md:grid-cols-3">
      {items.map((item) => (
        <DashboardWidgetCard
          key={item.type}
          widgetType={item.type}
          title={item.title}
          onMoveWidget={onMoveWidget}
          onRemoveWidget={onRemoveWidget}
        >
          {item.content}
        </DashboardWidgetCard>
      ))}
    </div>
  );
}
