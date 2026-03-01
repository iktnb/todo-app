import { beforeEach, describe, expect, it } from "vitest";
import type { BoardStateSnapshot } from "../../types/interfaces/board-state-snapshot";
import {
  BoardDashboardWidgetTypeEnum,
  HeatmapSensitivityEnum,
} from "../../types/enums";
import { createCloudSyncOperation } from "../op-protocol/create-cloud-sync-operation";
import { IndexedDbCloudSyncStore } from "./indexeddb-cloud-sync-store";

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

describe("IndexedDbCloudSyncStore", () => {
  beforeEach(() => {
    indexedDB.deleteDatabase("flowanchor-cloud-sync");
  });

  it("persists outbox operations and rehydrates queue length", async () => {
    const store = new IndexedDbCloudSyncStore();
    const firstOperation = createCloudSyncOperation({
      deviceId: "device-a",
      clientSeq: 1,
      snapshot: baseSnapshot,
    });
    const secondOperation = createCloudSyncOperation({
      deviceId: "device-a",
      clientSeq: 2,
      snapshot: baseSnapshot,
    });

    await store.enqueueOperation(firstOperation);
    await store.enqueueOperation(secondOperation);

    const nextStoreInstance = new IndexedDbCloudSyncStore();
    const queueLength = await nextStoreInstance.getQueueLength();
    const readyOperations = await nextStoreInstance.getReadyOperations(10);

    expect(queueLength).toBe(2);
    expect(readyOperations.map((operation) => operation.clientSeq)).toEqual([
      1, 2,
    ]);
  });

  it("stores and reads cursor and applied operations", async () => {
    const store = new IndexedDbCloudSyncStore();
    await store.writeCursor({
      sortKey: "2026-03-01T12:00:00.000Z_device-a_000000000001",
      opId: "op-1",
    });
    await store.markOpAsApplied("op-1");

    const cursor = await store.readCursor();
    const isApplied = await store.isOpApplied("op-1");
    const notApplied = await store.isOpApplied("op-2");

    expect(cursor).toEqual({
      sortKey: "2026-03-01T12:00:00.000Z_device-a_000000000001",
      opId: "op-1",
    });
    expect(isApplied).toBe(true);
    expect(notApplied).toBe(false);
  });
});
