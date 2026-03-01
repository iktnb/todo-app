import type { BoardDashboardWidgetType } from "../../enums/board-dashboard-widget-type";

export interface BoardDashboardLayout {
  widgetOrder: BoardDashboardWidgetType[];
  hiddenWidgets: BoardDashboardWidgetType[];
}
