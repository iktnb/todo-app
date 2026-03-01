import type { BoardDashboardLayout } from "./board-dashboard-layout";
import type { BoardHeatmapSettings } from "./board-heatmap-settings";

export interface BoardUiPreferences {
  dashboardLayout: BoardDashboardLayout;
  heatmapSettings: BoardHeatmapSettings;
}
