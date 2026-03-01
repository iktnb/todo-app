import { describe, expect, it, vi } from "vitest";
import type { BoardStateSnapshot } from "../../types/interfaces/board-state-snapshot";
import {
  BoardDashboardWidgetTypeEnum,
  HeatmapSensitivityEnum,
} from "../../types/enums";
import { createCloudSyncOperation } from "./create-cloud-sync-operation";

const baseSnapshot: BoardStateSnapshot = {
  version: 8,
  columns: [],
  tasks: [],
  items: [],
  nextActions: [],
  projects: [],
  somedayItems: [],
  contexts: [],
  selectedContextId: null,
  legacyTaskIds: [],
  isMigratedFromLegacy: false,
  currentReviewStep: 0,
  weeklyReviewStartedAt: null,
  weeklyReviewNote: "",
  reviewHistory: [],
  completionCountsByDate: {},
  uiPreferences: {
    dashboardLayout: {
      widgetOrder: [
        BoardDashboardWidgetTypeEnum.TasksSummary,
        BoardDashboardWidgetTypeEnum.TaskStatusBreakdown,
        BoardDashboardWidgetTypeEnum.ActivityHeatmap,
      ],
      hiddenWidgets: [],
    },
    heatmapSettings: {
      sensitivity: HeatmapSensitivityEnum.Balanced,
    },
  },
};

describe("createCloudSyncOperation", () => {
  it("creates deterministic sort key with device and sequence", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );

    const operation = createCloudSyncOperation({
      deviceId: "device-a",
      clientSeq: 42,
      snapshot: baseSnapshot,
    });

    expect(operation.opId).toBe("00000000-0000-4000-8000-000000000001");
    expect(operation.clientTime).toBe("2026-03-01T12:00:00.000Z");
    expect(operation.sortKey).toBe(
      "2026-03-01T12:00:00.000Z_device-a_000000000042",
    );
    expect(operation.payload).toEqual(baseSnapshot);
  });
});
