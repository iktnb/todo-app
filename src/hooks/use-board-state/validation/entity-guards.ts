import type { BoardDashboardLayout } from "../../../types/interfaces/ui";
import type {
  BoardDashboardWidgetType,
  HeatmapSensitivity,
} from "../../../types/enums";

export function isBoardDashboardWidgetType(
  value: unknown,
  allowedValues: BoardDashboardWidgetType[],
): value is BoardDashboardWidgetType {
  return (
    typeof value === "string" &&
    allowedValues.includes(value as BoardDashboardWidgetType)
  );
}

export function isHeatmapSensitivity(
  value: unknown,
  allowedValues: HeatmapSensitivity[],
): value is HeatmapSensitivity {
  return (
    typeof value === "string" &&
    allowedValues.includes(value as HeatmapSensitivity)
  );
}

export function isBoardDashboardLayout(
  value: unknown,
  allowedValues: BoardDashboardWidgetType[],
): value is BoardDashboardLayout {
  return (
    typeof value === "object" &&
    value !== null &&
    "widgetOrder" in value &&
    Array.isArray(value.widgetOrder) &&
    value.widgetOrder.every((widgetType) =>
      isBoardDashboardWidgetType(widgetType, allowedValues),
    ) &&
    "hiddenWidgets" in value &&
    Array.isArray(value.hiddenWidgets) &&
    value.hiddenWidgets.every((widgetType) =>
      isBoardDashboardWidgetType(widgetType, allowedValues),
    )
  );
}

export function isCompletionCountsByDate(
  value: unknown,
): value is Record<string, number> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.entries(value).every(
    ([key, dayCount]) =>
      typeof key === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(key) &&
      typeof dayCount === "number" &&
      Number.isFinite(dayCount) &&
      dayCount >= 0,
  );
}
