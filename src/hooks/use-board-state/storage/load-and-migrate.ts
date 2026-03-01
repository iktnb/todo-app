import { INBOX_COLUMN } from "../../../constants/board";
import { ItemSourceEnum } from "../../../types/gtd";
import type { Item } from "../../../types/gtd";
import type { Column, Task } from "../../../types/board";
import type { BoardDashboardLayout } from "../../../types/interfaces/ui";
import type { BoardDashboardWidgetType } from "../../../types/enums";

export function normalizeColumnsAndTasks(columns: Column[], tasks: Task[]) {
  const inboxColumn =
    columns.find((column) => column.id === INBOX_COLUMN.id) ?? INBOX_COLUMN;
  const customColumns = columns.filter((column) => column.id !== INBOX_COLUMN.id);
  const normalizedColumns = [inboxColumn, ...customColumns];
  const existingColumnIds = new Set(normalizedColumns.map((column) => column.id));
  const normalizedTasks = tasks.filter((task) => existingColumnIds.has(task.columnId));

  return {
    columns: normalizedColumns,
    tasks: normalizedTasks,
  };
}

export function mapLegacyTasksToItems(tasks: Task[]): Item[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    notes: "",
    createdAt: task.createdAt,
    source: ItemSourceEnum.Legacy,
    clarified: false,
  }));
}

export function normalizeDashboardLayout(params: {
  layout: BoardDashboardLayout;
  defaultOrder: BoardDashboardWidgetType[];
}): BoardDashboardLayout {
  const { layout, defaultOrder } = params;
  const hiddenSet = new Set(layout.hiddenWidgets);
  const orderWithoutUnknowns = layout.widgetOrder.filter((widgetType) =>
    defaultOrder.includes(widgetType),
  );
  const completedOrder = [
    ...orderWithoutUnknowns,
    ...defaultOrder.filter((widgetType) => !orderWithoutUnknowns.includes(widgetType)),
  ];

  return {
    widgetOrder: completedOrder,
    hiddenWidgets: completedOrder.filter((widgetType) => hiddenSet.has(widgetType)),
  };
}
