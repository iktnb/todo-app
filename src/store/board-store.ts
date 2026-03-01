import type { SetStateAction } from "react";
import { create } from "zustand";
import type { Column, Task } from "../types/board";
import type {
  Context,
  Item,
  NextAction,
  Project,
  SomedayItem,
  WeeklyReviewSnapshot,
} from "../types/gtd";
import {
  HeatmapSensitivityEnum,
  type HeatmapSensitivity,
} from "../types/enums";
import type { BoardDashboardLayout } from "../types/interfaces/ui";

export interface BoardCoreState {
  columns: Column[];
  tasks: Task[];
  items: Item[];
  nextActions: NextAction[];
  projects: Project[];
  somedayItems: SomedayItem[];
  contexts: Context[];
  selectedContextId: string | null;
  legacyTaskIds: string[];
  isMigratedFromLegacy: boolean;
  currentReviewStep: number;
  weeklyReviewStartedAt: string | null;
  weeklyReviewNote: string;
  reviewHistory: WeeklyReviewSnapshot[];
  completionCountsByDate: Record<string, number>;
  dashboardLayout: BoardDashboardLayout;
  heatmapSensitivity: HeatmapSensitivity;
}

interface BoardStoreActions {
  hydrate: (nextState: BoardCoreState) => void;
  setColumns: (next: SetStateAction<Column[]>) => void;
  setTasks: (next: SetStateAction<Task[]>) => void;
  setItems: (next: SetStateAction<Item[]>) => void;
  setNextActions: (next: SetStateAction<NextAction[]>) => void;
  setProjects: (next: SetStateAction<Project[]>) => void;
  setSomedayItems: (next: SetStateAction<SomedayItem[]>) => void;
  setContexts: (next: SetStateAction<Context[]>) => void;
  setSelectedContextId: (next: SetStateAction<string | null>) => void;
  setLegacyTaskIds: (next: SetStateAction<string[]>) => void;
  setIsMigratedFromLegacy: (next: SetStateAction<boolean>) => void;
  setCurrentReviewStep: (next: SetStateAction<number>) => void;
  setWeeklyReviewStartedAt: (next: SetStateAction<string | null>) => void;
  setWeeklyReviewNote: (next: SetStateAction<string>) => void;
  setReviewHistory: (next: SetStateAction<WeeklyReviewSnapshot[]>) => void;
  setCompletionCountsByDate: (
    next: SetStateAction<Record<string, number>>,
  ) => void;
  setDashboardLayout: (next: SetStateAction<BoardDashboardLayout>) => void;
  setHeatmapSensitivity: (next: SetStateAction<HeatmapSensitivity>) => void;
}

export type BoardStoreState = BoardCoreState & BoardStoreActions;

const EMPTY_CORE_STATE: BoardCoreState = {
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
  dashboardLayout: { widgetOrder: [], hiddenWidgets: [] },
  heatmapSensitivity: HeatmapSensitivityEnum.Balanced,
};

function resolveUpdater<T>(currentValue: T, next: SetStateAction<T>): T {
  if (typeof next === "function") {
    return (next as (value: T) => T)(currentValue);
  }
  return next;
}

export const useBoardStore = create<BoardStoreState>((set) => ({
  ...EMPTY_CORE_STATE,
  hydrate: (nextState) => set(() => ({ ...nextState })),
  setColumns: (next) =>
    set((currentState) => ({
      columns: resolveUpdater(currentState.columns, next),
    })),
  setTasks: (next) =>
    set((currentState) => ({
      tasks: resolveUpdater(currentState.tasks, next),
    })),
  setItems: (next) =>
    set((currentState) => ({
      items: resolveUpdater(currentState.items, next),
    })),
  setNextActions: (next) =>
    set((currentState) => ({
      nextActions: resolveUpdater(currentState.nextActions, next),
    })),
  setProjects: (next) =>
    set((currentState) => ({
      projects: resolveUpdater(currentState.projects, next),
    })),
  setSomedayItems: (next) =>
    set((currentState) => ({
      somedayItems: resolveUpdater(currentState.somedayItems, next),
    })),
  setContexts: (next) =>
    set((currentState) => ({
      contexts: resolveUpdater(currentState.contexts, next),
    })),
  setSelectedContextId: (next) =>
    set((currentState) => ({
      selectedContextId: resolveUpdater(currentState.selectedContextId, next),
    })),
  setLegacyTaskIds: (next) =>
    set((currentState) => ({
      legacyTaskIds: resolveUpdater(currentState.legacyTaskIds, next),
    })),
  setIsMigratedFromLegacy: (next) =>
    set((currentState) => ({
      isMigratedFromLegacy: resolveUpdater(currentState.isMigratedFromLegacy, next),
    })),
  setCurrentReviewStep: (next) =>
    set((currentState) => ({
      currentReviewStep: resolveUpdater(currentState.currentReviewStep, next),
    })),
  setWeeklyReviewStartedAt: (next) =>
    set((currentState) => ({
      weeklyReviewStartedAt: resolveUpdater(currentState.weeklyReviewStartedAt, next),
    })),
  setWeeklyReviewNote: (next) =>
    set((currentState) => ({
      weeklyReviewNote: resolveUpdater(currentState.weeklyReviewNote, next),
    })),
  setReviewHistory: (next) =>
    set((currentState) => ({
      reviewHistory: resolveUpdater(currentState.reviewHistory, next),
    })),
  setCompletionCountsByDate: (next) =>
    set((currentState) => ({
      completionCountsByDate: resolveUpdater(
        currentState.completionCountsByDate,
        next,
      ),
    })),
  setDashboardLayout: (next) =>
    set((currentState) => ({
      dashboardLayout: resolveUpdater(currentState.dashboardLayout, next),
    })),
  setHeatmapSensitivity: (next) =>
    set((currentState) => ({
      heatmapSensitivity: resolveUpdater(currentState.heatmapSensitivity, next),
    })),
}));
