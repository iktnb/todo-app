import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import { INBOX_COLUMN } from "../constants/board";
import { createDefaultContexts } from "../constants/contexts";
import {
  BOARD_SNAPSHOT_VERSION,
  BOARD_STORAGE_KEY,
} from "../constants/storage";
import { ITEM_TITLE_MAX_LENGTH } from "../constants/validation";
import { useI18n } from "../i18n/useI18n";
import {
  decryptBackupPayload,
  encryptBackupPayload,
} from "../utils/board-backup-crypto";
import { TaskStatusEnum } from "../types/board";
import type { Column, Task, TaskStatus } from "../types/board";
import {
  BoardDashboardWidgetTypeEnum,
  HeatmapSensitivityEnum,
  type BoardDashboardWidgetType,
  type HeatmapSensitivity,
} from "../types/enums";
import type {
  ClarifyDecisionState,
  ClarifyOutcomeInput,
  ClarifyResult,
  ClarifyWizardStep,
  Context,
  Item,
  NextAction,
  NextActionEnergy,
  NextActionStatus,
  Project,
  ProjectHealth,
  ProjectStatus,
  SomedayItem,
  WeeklyReviewSnapshot,
} from "../types/gtd";
import {
  ClarifyOutcomeEnum,
  ClarifyWizardStepEnum,
  ItemSourceEnum,
  NextActionEnergyEnum,
  NextActionStatusEnum,
  ProjectHealthEnum,
  ProjectStatusEnum,
  TrashReasonEnum,
} from "../types/gtd";
import type {
  BoardStateSnapshot,
  LegacyBoardStateSnapshot,
} from "../types/storage";
import type { BoardDashboardLayout } from "../types/interfaces/ui";

interface BoardState {
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

interface BackupActionResult {
  ok: boolean;
  message: string;
}

const TASK_STATUSES: TaskStatus[] = [
  TaskStatusEnum.Todo,
  TaskStatusEnum.InProgress,
  TaskStatusEnum.Waiting,
  TaskStatusEnum.Done,
  TaskStatusEnum.Obsolete,
];
const NEXT_ACTION_STATUSES: NextActionStatus[] = [
  NextActionStatusEnum.Active,
  NextActionStatusEnum.Done,
];
const NEXT_ACTION_ENERGY_LEVELS: NextActionEnergy[] = [
  NextActionEnergyEnum.Low,
  NextActionEnergyEnum.Medium,
  NextActionEnergyEnum.High,
];
const PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatusEnum.Active,
  ProjectStatusEnum.OnHold,
  ProjectStatusEnum.Done,
];
const REVIEW_STEPS_COUNT = 7;
const DASHBOARD_WIDGET_ORDER_DEFAULT: BoardDashboardWidgetType[] = [
  BoardDashboardWidgetTypeEnum.TasksSummary,
  BoardDashboardWidgetTypeEnum.TaskStatusBreakdown,
  BoardDashboardWidgetTypeEnum.WaitingTasks,
  BoardDashboardWidgetTypeEnum.ActivityHeatmap,
];
const HEATMAP_SENSITIVITIES: HeatmapSensitivity[] = [
  HeatmapSensitivityEnum.Low,
  HeatmapSensitivityEnum.Balanced,
  HeatmapSensitivityEnum.High,
];

function createDefaultDashboardLayout(): BoardDashboardLayout {
  return {
    widgetOrder: [...DASHBOARD_WIDGET_ORDER_DEFAULT],
    hiddenWidgets: [],
  };
}

function createDefaultHeatmapSensitivity(): HeatmapSensitivity {
  return HeatmapSensitivityEnum.Balanced;
}

function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countActiveProjectActions(
  nextActions: NextAction[],
  projectId: string,
): number {
  return nextActions.filter(
    (nextAction) =>
      nextAction.projectId === projectId &&
      nextAction.status === NextActionStatusEnum.Active,
  ).length;
}

function isColumn(value: unknown): value is Column {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string"
  );
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus)
  );
}

function isTask(value: unknown): value is Task {
  const waitingFor =
    typeof value === "object" && value !== null
      ? (value as { waitingFor?: unknown }).waitingFor
      : undefined;
  const waitingDeadline =
    typeof value === "object" && value !== null
      ? (value as { waitingDeadline?: unknown }).waitingDeadline
      : undefined;
  const completedAt =
    typeof value === "object" && value !== null
      ? (value as { completedAt?: unknown }).completedAt
      : undefined;

  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "columnId" in value &&
    typeof value.columnId === "string" &&
    "status" in value &&
    isTaskStatus(value.status) &&
    (!("waitingFor" in value) ||
      waitingFor === undefined ||
      (typeof waitingFor === "string" && waitingFor.trim().length > 0)) &&
    (!("waitingDeadline" in value) ||
      waitingDeadline === undefined ||
      (typeof waitingDeadline === "string" &&
        waitingDeadline.trim().length > 0)) &&
    (value.status !== TaskStatusEnum.Waiting ||
      (typeof waitingFor === "string" &&
        waitingFor.trim().length > 0 &&
        typeof waitingDeadline === "string" &&
        waitingDeadline.trim().length > 0)) &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    (!("completedAt" in value) ||
      completedAt === undefined ||
      typeof completedAt === "string")
  );
}

function isItemSource(value: unknown): value is Item["source"] {
  return (
    value === ItemSourceEnum.Manual ||
    value === ItemSourceEnum.Email ||
    value === ItemSourceEnum.Import ||
    value === ItemSourceEnum.Legacy
  );
}

function isItem(value: unknown): value is Item {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "notes" in value &&
    typeof value.notes === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    "source" in value &&
    isItemSource(value.source) &&
    "clarified" in value &&
    typeof value.clarified === "boolean" &&
    (!("clarifiedAt" in value) ||
      value.clarifiedAt === undefined ||
      typeof value.clarifiedAt === "string")
  );
}

function isNextActionStatus(value: unknown): value is NextActionStatus {
  return (
    typeof value === "string" &&
    NEXT_ACTION_STATUSES.includes(value as NextActionStatus)
  );
}

function isNextActionEnergy(value: unknown): value is NextActionEnergy {
  return (
    typeof value === "string" &&
    NEXT_ACTION_ENERGY_LEVELS.includes(value as NextActionEnergy)
  );
}

function isNextAction(value: unknown): value is NextAction {
  const completedAt =
    typeof value === "object" && value !== null
      ? (value as { completedAt?: unknown }).completedAt
      : undefined;

  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    (!("notes" in value) ||
      value.notes === undefined ||
      typeof value.notes === "string") &&
    "contextId" in value &&
    typeof value.contextId === "string" &&
    (!("timeEstimate" in value) ||
      value.timeEstimate === undefined ||
      (typeof value.timeEstimate === "number" &&
        Number.isFinite(value.timeEstimate) &&
        value.timeEstimate >= 0)) &&
    (!("energy" in value) ||
      value.energy === undefined ||
      isNextActionEnergy(value.energy)) &&
    "status" in value &&
    isNextActionStatus(value.status) &&
    (!("projectId" in value) ||
      value.projectId === undefined ||
      value.projectId === null ||
      typeof value.projectId === "string") &&
    (!("completedAt" in value) ||
      completedAt === undefined ||
      typeof completedAt === "string")
  );
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === "string" &&
    PROJECT_STATUSES.includes(value as ProjectStatus)
  );
}

function isProject(value: unknown): value is Project {
  const completedAt =
    typeof value === "object" && value !== null
      ? (value as { completedAt?: unknown }).completedAt
      : undefined;

  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    (!("notes" in value) ||
      value.notes === undefined ||
      typeof value.notes === "string") &&
    "status" in value &&
    isProjectStatus(value.status) &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    "reviewAt" in value &&
    typeof value.reviewAt === "string" &&
    (!("lastReviewedAt" in value) ||
      value.lastReviewedAt === undefined ||
      typeof value.lastReviewedAt === "string") &&
    (!("completedAt" in value) ||
      completedAt === undefined ||
      typeof completedAt === "string")
  );
}

function isSomedayItem(value: unknown): value is SomedayItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "notes" in value &&
    typeof value.notes === "string" &&
    "reviewAt" in value &&
    typeof value.reviewAt === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string"
  );
}

function isContext(value: unknown): value is Context {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "description" in value &&
    typeof value.description === "string"
  );
}

function isWeeklyReviewSnapshot(value: unknown): value is WeeklyReviewSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    "startedAt" in value &&
    typeof value.startedAt === "string" &&
    "completedAt" in value &&
    typeof value.completedAt === "string" &&
    "completed" in value &&
    typeof value.completed === "boolean" &&
    "step" in value &&
    typeof value.step === "number" &&
    Number.isInteger(value.step) &&
    value.step >= 0 &&
    value.step < REVIEW_STEPS_COUNT &&
    "note" in value &&
    typeof value.note === "string" &&
    "counters" in value &&
    typeof value.counters === "object" &&
    value.counters !== null &&
    "inboxUnclarified" in value.counters &&
    typeof value.counters.inboxUnclarified === "number" &&
    "projectsMissingActions" in value.counters &&
    typeof value.counters.projectsMissingActions === "number" &&
    "waitingFollowUps" in value.counters &&
    typeof value.counters.waitingFollowUps === "number"
  );
}

function isBoardDashboardWidgetType(
  value: unknown,
): value is BoardDashboardWidgetType {
  return (
    typeof value === "string" &&
    DASHBOARD_WIDGET_ORDER_DEFAULT.includes(value as BoardDashboardWidgetType)
  );
}

function isHeatmapSensitivity(value: unknown): value is HeatmapSensitivity {
  return (
    typeof value === "string" &&
    HEATMAP_SENSITIVITIES.includes(value as HeatmapSensitivity)
  );
}

function isBoardDashboardLayout(value: unknown): value is BoardDashboardLayout {
  return (
    typeof value === "object" &&
    value !== null &&
    "widgetOrder" in value &&
    Array.isArray(value.widgetOrder) &&
    value.widgetOrder.every((widgetType) =>
      isBoardDashboardWidgetType(widgetType),
    ) &&
    "hiddenWidgets" in value &&
    Array.isArray(value.hiddenWidgets) &&
    value.hiddenWidgets.every((widgetType) =>
      isBoardDashboardWidgetType(widgetType),
    )
  );
}

function isCompletionCountsByDate(
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

function normalizeDashboardLayout(layout: BoardDashboardLayout): BoardDashboardLayout {
  const hiddenSet = new Set(layout.hiddenWidgets);
  const orderWithoutUnknowns = layout.widgetOrder.filter((widgetType) =>
    DASHBOARD_WIDGET_ORDER_DEFAULT.includes(widgetType),
  );
  const completedOrder = [
    ...orderWithoutUnknowns,
    ...DASHBOARD_WIDGET_ORDER_DEFAULT.filter(
      (widgetType) => !orderWithoutUnknowns.includes(widgetType),
    ),
  ];

  return {
    widgetOrder: completedOrder,
    hiddenWidgets: completedOrder.filter((widgetType) =>
      hiddenSet.has(widgetType),
    ),
  };
}

function isLegacyBoardStateSnapshot(
  value: unknown,
): value is LegacyBoardStateSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task))
  );
}

function isBoardStateSnapshot(value: unknown): value is BoardStateSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === BOARD_SNAPSHOT_VERSION &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "selectedContextId" in value &&
    (value.selectedContextId === null ||
      typeof value.selectedContextId === "string") &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean" &&
    "currentReviewStep" in value &&
    typeof value.currentReviewStep === "number" &&
    Number.isInteger(value.currentReviewStep) &&
    value.currentReviewStep >= 0 &&
    value.currentReviewStep < REVIEW_STEPS_COUNT &&
    "weeklyReviewStartedAt" in value &&
    (value.weeklyReviewStartedAt === null ||
      typeof value.weeklyReviewStartedAt === "string") &&
    "weeklyReviewNote" in value &&
    typeof value.weeklyReviewNote === "string" &&
    "reviewHistory" in value &&
    Array.isArray(value.reviewHistory) &&
    value.reviewHistory.every((snapshot) => isWeeklyReviewSnapshot(snapshot)) &&
    "completionCountsByDate" in value &&
    isCompletionCountsByDate(value.completionCountsByDate) &&
    "uiPreferences" in value &&
    typeof value.uiPreferences === "object" &&
    value.uiPreferences !== null &&
    "dashboardLayout" in value.uiPreferences &&
    isBoardDashboardLayout(value.uiPreferences.dashboardLayout) &&
    "heatmapSettings" in value.uiPreferences &&
    typeof value.uiPreferences.heatmapSettings === "object" &&
    value.uiPreferences.heatmapSettings !== null &&
    "sensitivity" in value.uiPreferences.heatmapSettings &&
    isHeatmapSensitivity(value.uiPreferences.heatmapSettings.sensitivity)
  );
}

function isBoardStateSnapshotV7(
  value: unknown,
): value is Omit<BoardStateSnapshot, "version" | "completionCountsByDate"> & {
  version: 7;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 7 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "selectedContextId" in value &&
    (value.selectedContextId === null ||
      typeof value.selectedContextId === "string") &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean" &&
    "currentReviewStep" in value &&
    typeof value.currentReviewStep === "number" &&
    Number.isInteger(value.currentReviewStep) &&
    value.currentReviewStep >= 0 &&
    value.currentReviewStep < REVIEW_STEPS_COUNT &&
    "weeklyReviewStartedAt" in value &&
    (value.weeklyReviewStartedAt === null ||
      typeof value.weeklyReviewStartedAt === "string") &&
    "weeklyReviewNote" in value &&
    typeof value.weeklyReviewNote === "string" &&
    "reviewHistory" in value &&
    Array.isArray(value.reviewHistory) &&
    value.reviewHistory.every((snapshot) => isWeeklyReviewSnapshot(snapshot)) &&
    "uiPreferences" in value &&
    typeof value.uiPreferences === "object" &&
    value.uiPreferences !== null &&
    "dashboardLayout" in value.uiPreferences &&
    isBoardDashboardLayout(value.uiPreferences.dashboardLayout) &&
    "heatmapSettings" in value.uiPreferences &&
    typeof value.uiPreferences.heatmapSettings === "object" &&
    value.uiPreferences.heatmapSettings !== null &&
    "sensitivity" in value.uiPreferences.heatmapSettings &&
    isHeatmapSensitivity(value.uiPreferences.heatmapSettings.sensitivity)
  );
}

function isBoardStateSnapshotV6(
  value: unknown,
): value is Omit<
  BoardStateSnapshot,
  "version" | "uiPreferences" | "completionCountsByDate"
> & {
  version: 6;
  uiPreferences: { dashboardLayout: BoardDashboardLayout };
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 6 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "selectedContextId" in value &&
    (value.selectedContextId === null ||
      typeof value.selectedContextId === "string") &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean" &&
    "currentReviewStep" in value &&
    typeof value.currentReviewStep === "number" &&
    Number.isInteger(value.currentReviewStep) &&
    value.currentReviewStep >= 0 &&
    value.currentReviewStep < REVIEW_STEPS_COUNT &&
    "weeklyReviewStartedAt" in value &&
    (value.weeklyReviewStartedAt === null ||
      typeof value.weeklyReviewStartedAt === "string") &&
    "weeklyReviewNote" in value &&
    typeof value.weeklyReviewNote === "string" &&
    "reviewHistory" in value &&
    Array.isArray(value.reviewHistory) &&
    value.reviewHistory.every((snapshot) => isWeeklyReviewSnapshot(snapshot)) &&
    "uiPreferences" in value &&
    typeof value.uiPreferences === "object" &&
    value.uiPreferences !== null &&
    "dashboardLayout" in value.uiPreferences &&
    isBoardDashboardLayout(value.uiPreferences.dashboardLayout)
  );
}

function isBoardStateSnapshotV5(
  value: unknown,
): value is Omit<
  BoardStateSnapshot,
  "version" | "uiPreferences" | "completionCountsByDate"
> & {
  version: 5;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 5 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "selectedContextId" in value &&
    (value.selectedContextId === null ||
      typeof value.selectedContextId === "string") &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean" &&
    "currentReviewStep" in value &&
    typeof value.currentReviewStep === "number" &&
    Number.isInteger(value.currentReviewStep) &&
    value.currentReviewStep >= 0 &&
    value.currentReviewStep < REVIEW_STEPS_COUNT &&
    "weeklyReviewStartedAt" in value &&
    (value.weeklyReviewStartedAt === null ||
      typeof value.weeklyReviewStartedAt === "string") &&
    "weeklyReviewNote" in value &&
    typeof value.weeklyReviewNote === "string" &&
    "reviewHistory" in value &&
    Array.isArray(value.reviewHistory) &&
    value.reviewHistory.every((snapshot) => isWeeklyReviewSnapshot(snapshot))
  );
}

function isBoardStateSnapshotV4(
  value: unknown,
): value is Omit<
  BoardStateSnapshot,
  | "version"
  | "currentReviewStep"
  | "weeklyReviewStartedAt"
  | "weeklyReviewNote"
  | "reviewHistory"
  | "uiPreferences"
  | "completionCountsByDate"
> & { version: 4 } {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 4 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "selectedContextId" in value &&
    (value.selectedContextId === null ||
      typeof value.selectedContextId === "string") &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean"
  );
}

function isBoardStateSnapshotV3(
  value: unknown,
): value is Omit<
  BoardStateSnapshot,
  | "version"
  | "selectedContextId"
  | "currentReviewStep"
  | "weeklyReviewStartedAt"
  | "weeklyReviewNote"
  | "reviewHistory"
  | "uiPreferences"
  | "completionCountsByDate"
> & { version: 3 } {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 3 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "somedayItems" in value &&
    Array.isArray(value.somedayItems) &&
    value.somedayItems.every((somedayItem) => isSomedayItem(somedayItem)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean"
  );
}

function isBoardStateSnapshotV2(
  value: unknown,
): value is Omit<
  BoardStateSnapshot,
  | "version"
  | "somedayItems"
  | "selectedContextId"
  | "currentReviewStep"
  | "weeklyReviewStartedAt"
  | "weeklyReviewNote"
  | "reviewHistory"
  | "uiPreferences"
  | "completionCountsByDate"
> & { version: 2 } {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 2 &&
    "columns" in value &&
    Array.isArray(value.columns) &&
    value.columns.every((column) => isColumn(column)) &&
    "tasks" in value &&
    Array.isArray(value.tasks) &&
    value.tasks.every((task) => isTask(task)) &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every((item) => isItem(item)) &&
    "nextActions" in value &&
    Array.isArray(value.nextActions) &&
    value.nextActions.every((nextAction) => isNextAction(nextAction)) &&
    "projects" in value &&
    Array.isArray(value.projects) &&
    value.projects.every((project) => isProject(project)) &&
    "contexts" in value &&
    Array.isArray(value.contexts) &&
    value.contexts.every((context) => isContext(context)) &&
    "legacyTaskIds" in value &&
    Array.isArray(value.legacyTaskIds) &&
    value.legacyTaskIds.every((taskId) => typeof taskId === "string") &&
    "isMigratedFromLegacy" in value &&
    typeof value.isMigratedFromLegacy === "boolean"
  );
}

function createDefaultBoardState(defaultContexts: Context[]): BoardState {
  return {
    columns: [INBOX_COLUMN],
    tasks: [],
    items: [],
    nextActions: [],
    projects: [],
    somedayItems: [],
    contexts: defaultContexts.map((context) => ({ ...context })),
    selectedContextId: null,
    legacyTaskIds: [],
    isMigratedFromLegacy: false,
    currentReviewStep: 0,
    weeklyReviewStartedAt: null,
    weeklyReviewNote: "",
    reviewHistory: [],
    completionCountsByDate: {},
    dashboardLayout: createDefaultDashboardLayout(),
    heatmapSensitivity: createDefaultHeatmapSensitivity(),
  };
}

function normalizeColumnsAndTasks(columns: Column[], tasks: Task[]) {
  const inboxColumn =
    columns.find((column) => column.id === INBOX_COLUMN.id) ?? INBOX_COLUMN;
  const customColumns = columns.filter(
    (column) => column.id !== INBOX_COLUMN.id,
  );
  const normalizedColumns = [inboxColumn, ...customColumns];
  const existingColumnIds = new Set(
    normalizedColumns.map((column) => column.id),
  );
  const normalizedTasks = tasks.filter((task) =>
    existingColumnIds.has(task.columnId),
  );

  return {
    columns: normalizedColumns,
    tasks: normalizedTasks,
  };
}

function mapLegacyTasksToItems(tasks: Task[]): Item[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    notes: "",
    createdAt: task.createdAt,
    source: "legacy",
    clarified: false,
  }));
}

function loadBoardStateFromStorage(defaultContexts: Context[]): BoardState {
  try {
    const snapshotValue = localStorage.getItem(BOARD_STORAGE_KEY);

    if (!snapshotValue) {
      return createDefaultBoardState(defaultContexts);
    }

    const parsedSnapshot: unknown = JSON.parse(snapshotValue);

    if (isLegacyBoardStateSnapshot(parsedSnapshot)) {
      const normalizedLegacyState = normalizeColumnsAndTasks(
        parsedSnapshot.columns,
        parsedSnapshot.tasks,
      );
      const migratedItems = mapLegacyTasksToItems(normalizedLegacyState.tasks);

      return {
        ...createDefaultBoardState(defaultContexts),
        ...normalizedLegacyState,
        items: migratedItems,
        somedayItems: [],
        selectedContextId: null,
        legacyTaskIds: normalizedLegacyState.tasks.map((task) => task.id),
        isMigratedFromLegacy: true,
      };
    }

    if (
      !isBoardStateSnapshot(parsedSnapshot) &&
      !isBoardStateSnapshotV7(parsedSnapshot) &&
      !isBoardStateSnapshotV6(parsedSnapshot) &&
      !isBoardStateSnapshotV5(parsedSnapshot) &&
      !isBoardStateSnapshotV4(parsedSnapshot) &&
      !isBoardStateSnapshotV3(parsedSnapshot) &&
      !isBoardStateSnapshotV2(parsedSnapshot)
    ) {
      return createDefaultBoardState(defaultContexts);
    }

    const snapshot = parsedSnapshot;

    const normalizedState = normalizeColumnsAndTasks(
      snapshot.columns,
      snapshot.tasks,
    );
    const hasItems = snapshot.items.length > 0;
    const shouldRunFallbackMigration =
      !snapshot.isMigratedFromLegacy &&
      !hasItems &&
      normalizedState.tasks.length > 0;
    const migratedItems = shouldRunFallbackMigration
      ? mapLegacyTasksToItems(normalizedState.tasks)
      : snapshot.items;
    const migratedSomedayItems =
      "somedayItems" in snapshot && Array.isArray(snapshot.somedayItems)
        ? snapshot.somedayItems
        : [];
    const migratedProjects = snapshot.projects.map((project) => ({
      ...project,
      lastReviewedAt:
        "lastReviewedAt" in project &&
        typeof project.lastReviewedAt === "string"
          ? project.lastReviewedAt
          : undefined,
    }));
    const migratedCurrentReviewStep =
      "currentReviewStep" in snapshot &&
      typeof snapshot.currentReviewStep === "number" &&
      Number.isInteger(snapshot.currentReviewStep) &&
      snapshot.currentReviewStep >= 0 &&
      snapshot.currentReviewStep < REVIEW_STEPS_COUNT
        ? snapshot.currentReviewStep
        : 0;
    const migratedReviewStartedAt =
      "weeklyReviewStartedAt" in snapshot &&
      (snapshot.weeklyReviewStartedAt === null ||
        typeof snapshot.weeklyReviewStartedAt === "string")
        ? snapshot.weeklyReviewStartedAt
        : null;
    const migratedWeeklyReviewNote =
      "weeklyReviewNote" in snapshot &&
      typeof snapshot.weeklyReviewNote === "string"
        ? snapshot.weeklyReviewNote
        : "";
    const migratedReviewHistory =
      "reviewHistory" in snapshot && Array.isArray(snapshot.reviewHistory)
        ? snapshot.reviewHistory.filter((entry) =>
            isWeeklyReviewSnapshot(entry),
          )
        : [];
    const migratedDashboardLayout =
      "uiPreferences" in snapshot &&
      typeof snapshot.uiPreferences === "object" &&
      snapshot.uiPreferences !== null &&
      "dashboardLayout" in snapshot.uiPreferences &&
      isBoardDashboardLayout(snapshot.uiPreferences.dashboardLayout)
        ? normalizeDashboardLayout(snapshot.uiPreferences.dashboardLayout)
        : createDefaultDashboardLayout();
    const migratedHeatmapSensitivity =
      "uiPreferences" in snapshot &&
      typeof snapshot.uiPreferences === "object" &&
      snapshot.uiPreferences !== null &&
      "heatmapSettings" in snapshot.uiPreferences &&
      typeof snapshot.uiPreferences.heatmapSettings === "object" &&
      snapshot.uiPreferences.heatmapSettings !== null &&
      "sensitivity" in snapshot.uiPreferences.heatmapSettings &&
      isHeatmapSensitivity(snapshot.uiPreferences.heatmapSettings.sensitivity)
        ? snapshot.uiPreferences.heatmapSettings.sensitivity
        : createDefaultHeatmapSensitivity();
    const migratedCompletionCountsByDate =
      "completionCountsByDate" in snapshot &&
      isCompletionCountsByDate(snapshot.completionCountsByDate)
        ? snapshot.completionCountsByDate
        : {};

    return {
      ...createDefaultBoardState(defaultContexts),
      ...normalizedState,
      items: migratedItems,
      nextActions: snapshot.nextActions,
      projects: migratedProjects,
      somedayItems: migratedSomedayItems,
      contexts:
        snapshot.contexts.length > 0
          ? snapshot.contexts
          : defaultContexts.map((context) => ({ ...context })),
      selectedContextId:
        "selectedContextId" in snapshot &&
        typeof snapshot.selectedContextId === "string" &&
        snapshot.contexts.some(
          (context) => context.id === snapshot.selectedContextId,
        )
          ? snapshot.selectedContextId
          : null,
      legacyTaskIds: shouldRunFallbackMigration
        ? normalizedState.tasks.map((task) => task.id)
        : snapshot.legacyTaskIds,
      isMigratedFromLegacy:
        snapshot.isMigratedFromLegacy || shouldRunFallbackMigration,
      currentReviewStep: migratedCurrentReviewStep,
      weeklyReviewStartedAt: migratedReviewStartedAt,
      weeklyReviewNote: migratedWeeklyReviewNote,
      reviewHistory: migratedReviewHistory,
      completionCountsByDate: migratedCompletionCountsByDate,
      dashboardLayout: migratedDashboardLayout,
      heatmapSensitivity: migratedHeatmapSensitivity,
    };
  } catch {
    return createDefaultBoardState(defaultContexts);
  }
}

export function useBoardState() {
  const { t } = useI18n();
  const defaultContexts = useMemo(() => createDefaultContexts(t), [t]);
  const initialBoardState = useMemo(
    () => loadBoardStateFromStorage(defaultContexts),
    [defaultContexts],
  );
  const [columns, setColumns] = useState<Column[]>(initialBoardState.columns);
  const [tasks, setTasks] = useState<Task[]>(initialBoardState.tasks);
  const [items, setItems] = useState<Item[]>(initialBoardState.items);
  const [nextActions, setNextActions] = useState<NextAction[]>(
    initialBoardState.nextActions,
  );
  const [projects, setProjects] = useState<Project[]>(
    initialBoardState.projects,
  );
  const [somedayItems, setSomedayItems] = useState<SomedayItem[]>(
    initialBoardState.somedayItems,
  );
  const [contexts, setContexts] = useState<Context[]>(
    initialBoardState.contexts,
  );
  const [selectedContextId, setSelectedContextId] = useState<string | null>(
    initialBoardState.selectedContextId,
  );
  const [legacyTaskIds, setLegacyTaskIds] = useState<string[]>(
    initialBoardState.legacyTaskIds,
  );
  const [isMigratedFromLegacy, setIsMigratedFromLegacy] = useState<boolean>(
    initialBoardState.isMigratedFromLegacy,
  );
  const [currentReviewStep, setCurrentReviewStep] = useState<number>(
    initialBoardState.currentReviewStep,
  );
  const [weeklyReviewStartedAt, setWeeklyReviewStartedAt] = useState<
    string | null
  >(initialBoardState.weeklyReviewStartedAt);
  const [weeklyReviewNote, setWeeklyReviewNote] = useState<string>(
    initialBoardState.weeklyReviewNote,
  );
  const [reviewHistory, setReviewHistory] = useState<WeeklyReviewSnapshot[]>(
    initialBoardState.reviewHistory,
  );
  const [completionCountsByDate, setCompletionCountsByDate] = useState<
    Record<string, number>
  >(initialBoardState.completionCountsByDate);
  const [dashboardLayout, setDashboardLayout] = useState<BoardDashboardLayout>(
    initialBoardState.dashboardLayout,
  );
  const [heatmapSensitivity, setHeatmapSensitivity] =
    useState<HeatmapSensitivity>(initialBoardState.heatmapSensitivity);
  const [weeklyReviewError, setWeeklyReviewError] = useState<string | null>(
    null,
  );
  const [taskInput, setTaskInput] = useState("");
  const [columnInput, setColumnInput] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [clarifyTargetItemId, setClarifyTargetItemId] = useState<string | null>(
    null,
  );
  const [clarifyDecisionState, setClarifyDecisionState] =
    useState<ClarifyDecisionState>({
      step: ClarifyWizardStepEnum.Actionable,
    });
  const [clarifyResult, setClarifyResult] = useState<ClarifyResult | null>(
    null,
  );
  const [clarifyHistory, setClarifyHistory] = useState<string[]>([]);
  const [projectInvariantWarning, setProjectInvariantWarning] = useState<
    string | null
  >(null);
  const lastCaptureRef = useRef<{ title: string; timestamp: number } | null>(
    null,
  );

  const boardSnapshot = useMemo<BoardStateSnapshot>(
    () => ({
      version: BOARD_SNAPSHOT_VERSION,
      columns,
      tasks,
      items,
      nextActions,
      projects,
      somedayItems,
      contexts,
      selectedContextId,
      legacyTaskIds,
      isMigratedFromLegacy,
      currentReviewStep,
      weeklyReviewStartedAt,
      weeklyReviewNote,
      reviewHistory,
      completionCountsByDate,
      uiPreferences: {
        dashboardLayout,
        heatmapSettings: {
          sensitivity: heatmapSensitivity,
        },
      },
    }),
    [
      columns,
      tasks,
      items,
      nextActions,
      projects,
      somedayItems,
      contexts,
      selectedContextId,
      legacyTaskIds,
      isMigratedFromLegacy,
      currentReviewStep,
      weeklyReviewStartedAt,
      weeklyReviewNote,
      reviewHistory,
      completionCountsByDate,
      dashboardLayout,
      heatmapSensitivity,
    ],
  );

  const applyBoardSnapshot = useCallback(
    (snapshot: BoardStateSnapshot) => {
      try {
        localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore write errors and still try to apply in-memory state.
      }

      const nextState = loadBoardStateFromStorage(defaultContexts);
      setColumns(nextState.columns);
      setTasks(nextState.tasks);
      setItems(nextState.items);
      setNextActions(nextState.nextActions);
      setProjects(nextState.projects);
      setSomedayItems(nextState.somedayItems);
      setContexts(nextState.contexts);
      setSelectedContextId(nextState.selectedContextId);
      setLegacyTaskIds(nextState.legacyTaskIds);
      setIsMigratedFromLegacy(nextState.isMigratedFromLegacy);
      setCurrentReviewStep(nextState.currentReviewStep);
      setWeeklyReviewStartedAt(nextState.weeklyReviewStartedAt);
      setWeeklyReviewNote(nextState.weeklyReviewNote);
      setReviewHistory(nextState.reviewHistory);
      setCompletionCountsByDate(nextState.completionCountsByDate);
      setDashboardLayout(nextState.dashboardLayout);
      setHeatmapSensitivity(nextState.heatmapSensitivity);
      setWeeklyReviewError(null);
      setProjectInvariantWarning(null);
    },
    [defaultContexts],
  );

  useEffect(() => {
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(boardSnapshot));
    } catch {
      // Ignore write errors so board interactions remain responsive.
    }
  }, [boardSnapshot]);

  function clearProjectInvariantWarning() {
    setProjectInvariantWarning(null);
  }

  function warnActiveProjectInvariant(projectTitle: string) {
    setProjectInvariantWarning(t("state.projectInvariant", { projectTitle }));
  }

  function incrementCompletionCount(forDate: Date = new Date()) {
    const dayKey = toLocalDayKey(forDate);
    setCompletionCountsByDate((currentCounts) => ({
      ...currentCounts,
      [dayKey]: (currentCounts[dayKey] ?? 0) + 1,
    }));
  }

  function findBlockingProjectByNextAction(
    nextActionId: string,
    sourceNextActions: NextAction[],
  ): Project | null {
    const nextAction = sourceNextActions.find(
      (currentAction) => currentAction.id === nextActionId,
    );
    if (
      !nextAction ||
      nextAction.status !== NextActionStatusEnum.Active ||
      !nextAction.projectId
    ) {
      return null;
    }

    const relatedProject = projects.find(
      (project) => project.id === nextAction.projectId,
    );
    if (!relatedProject || relatedProject.status !== ProjectStatusEnum.Active) {
      return null;
    }

    const activeProjectActionsCount = countActiveProjectActions(
      sourceNextActions,
      relatedProject.id,
    );

    if (activeProjectActionsCount > 1) {
      return null;
    }

    return relatedProject;
  }

  function handleCaptureItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskInput.trim();

    if (!title || title.length > ITEM_TITLE_MAX_LENGTH) {
      return;
    }

    const now = Date.now();
    const lastCapture = lastCaptureRef.current;
    if (
      lastCapture &&
      lastCapture.title === title &&
      now - lastCapture.timestamp < 500
    ) {
      return;
    }
    lastCaptureRef.current = { title, timestamp: now };

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newTask: Task = {
      id,
      title,
      columnId: INBOX_COLUMN.id,
      status: TaskStatusEnum.Todo,
      createdAt,
    };
    const newItem: Item = {
      id,
      title,
      notes: "",
      createdAt,
      source: ItemSourceEnum.Manual,
      clarified: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setItems((currentItems) => [...currentItems, newItem]);
    incrementCompletionCount();
    setTaskInput("");
  }

  function handleAddColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = columnInput.trim();

    if (!title) {
      return;
    }

    setColumns((currentColumns) => {
      const hasSameTitle = currentColumns.some(
        (column) => column.title.toLowerCase() === title.toLowerCase(),
      );

      if (hasSameTitle) {
        return currentColumns;
      }

      return [
        ...currentColumns,
        {
          id: crypto.randomUUID(),
          title,
        },
      ];
    });

    setColumnInput("");
  }

  function handleSetTaskStatus(
    taskId: string,
    nextStatus: TaskStatus,
    waitingDetails?: { waitingFor: string; waitingDeadline: string },
  ) {
    const previousTask = tasks.find((task) => task.id === taskId);
    const nextWaitingFor = waitingDetails?.waitingFor.trim() ?? "";
    const nextWaitingDeadline = waitingDetails?.waitingDeadline.trim() ?? "";
    const isWaitingPayloadValid =
      nextWaitingFor.length > 0 && nextWaitingDeadline.length > 0;
    const shouldIncrementTodayCounter =
      previousTask !== undefined &&
      (nextStatus === TaskStatusEnum.Waiting
        ? isWaitingPayloadValid &&
          (previousTask.status !== nextStatus ||
            previousTask.waitingFor !== nextWaitingFor ||
            previousTask.waitingDeadline !== nextWaitingDeadline)
        : previousTask.status !== nextStatus ||
          previousTask.waitingFor !== undefined ||
          previousTask.waitingDeadline !== undefined);
    const nowIso = new Date().toISOString();
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id !== taskId
          ? task
          : nextStatus === TaskStatusEnum.Waiting
            ? waitingDetails?.waitingFor.trim() &&
              waitingDetails.waitingDeadline.trim()
              ? {
                  ...task,
                  status: nextStatus,
                  waitingFor: waitingDetails.waitingFor.trim(),
                  waitingDeadline: waitingDetails.waitingDeadline.trim(),
                  completedAt: undefined,
                }
              : task
            : {
                ...task,
                status: nextStatus,
                waitingFor: undefined,
                waitingDeadline: undefined,
                completedAt:
                  nextStatus === TaskStatusEnum.Done
                    ? task.completedAt ?? nowIso
                    : undefined,
              },
      ),
    );
    if (shouldIncrementTodayCounter) {
      incrementCompletionCount();
    }
  }

  function handleUpdateTaskTitle(taskId: string, nextTitle: string) {
    const normalizedTitle = nextTitle.trim();
    if (
      normalizedTitle.length === 0 ||
      normalizedTitle.length > ITEM_TITLE_MAX_LENGTH
    ) {
      return false;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, title: normalizedTitle } : task,
      ),
    );
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === taskId ? { ...item, title: normalizedTitle } : item,
      ),
    );
    incrementCompletionCount();
    return true;
  }

  function handleMoveTask(taskId: string, nextColumnId: string) {
    const shouldIncrementTodayCounter = tasks.some(
      (task) => task.id === taskId && task.columnId !== nextColumnId,
    );
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: nextColumnId } : task,
      ),
    );
    if (shouldIncrementTodayCounter) {
      incrementCompletionCount();
    }
  }

  function handleDeleteTask(taskId: string) {
    const blockingProject = findBlockingProjectByNextAction(
      taskId,
      nextActions,
    );
    if (blockingProject) {
      warnActiveProjectInvariant(blockingProject.title);
      return false;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== taskId),
    );
    setNextActions((currentNextActions) =>
      currentNextActions.filter((nextAction) => nextAction.id !== taskId),
    );
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== taskId),
    );
    setSomedayItems((currentSomedayItems) =>
      currentSomedayItems.filter((somedayItem) => somedayItem.id !== taskId),
    );
    setLegacyTaskIds((currentLegacyTaskIds) =>
      currentLegacyTaskIds.filter((legacyTaskId) => legacyTaskId !== taskId),
    );
    setClarifyTargetItemId((currentTargetItemId) =>
      currentTargetItemId === taskId ? null : currentTargetItemId,
    );
    incrementCompletionCount();
    clearProjectInvariantWarning();
    return true;
  }

  function handleUnarchiveTask(taskId: string) {
    const isArchivedTask = tasks.some(
      (task) => task.id === taskId && task.status === TaskStatusEnum.Obsolete,
    );
    if (!isArchivedTask) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          columnId: INBOX_COLUMN.id,
          status: TaskStatusEnum.Todo,
          waitingFor: undefined,
          waitingDeadline: undefined,
          completedAt: undefined,
        };
      }),
    );
    incrementCompletionCount();
  }

  function handleMoveSomedayItemToInbox(itemId: string) {
    const somedayItemToRestore = somedayItems.find((item) => item.id === itemId);
    if (!somedayItemToRestore) {
      return;
    }

    setSomedayItems((currentSomedayItems) =>
      currentSomedayItems.filter((item) => item.id !== itemId),
    );
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, clarified: false, clarifiedAt: undefined }
          : item,
      ),
    );
    setTasks((currentTasks) => {
      const existingTask = currentTasks.find((task) => task.id === itemId);
      if (!existingTask) {
        const restoredTask: Task = {
          id: itemId,
          title: somedayItemToRestore.title,
          columnId: INBOX_COLUMN.id,
          status: TaskStatusEnum.Todo,
          createdAt: new Date().toISOString(),
        };
        return [...currentTasks, restoredTask];
      }

      return currentTasks.map((task) =>
        task.id === itemId
          ? {
              ...task,
              title: somedayItemToRestore.title,
              columnId: INBOX_COLUMN.id,
              status: TaskStatusEnum.Todo,
              waitingFor: undefined,
              waitingDeadline: undefined,
              completedAt: undefined,
            }
          : task,
      );
    });
    incrementCompletionCount();
  }

  function handleResetLocalData() {
    try {
      localStorage.removeItem(BOARD_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors and still reset in-memory state.
    }

    const defaultState = createDefaultBoardState(defaultContexts);

    setColumns(defaultState.columns);
    setTasks(defaultState.tasks);
    setItems(defaultState.items);
    setNextActions(defaultState.nextActions);
    setProjects(defaultState.projects);
    setSomedayItems(defaultState.somedayItems);
    setContexts(defaultState.contexts);
    setSelectedContextId(defaultState.selectedContextId);
    setLegacyTaskIds(defaultState.legacyTaskIds);
    setIsMigratedFromLegacy(defaultState.isMigratedFromLegacy);
    setCurrentReviewStep(defaultState.currentReviewStep);
    setWeeklyReviewStartedAt(defaultState.weeklyReviewStartedAt);
    setWeeklyReviewNote(defaultState.weeklyReviewNote);
    setReviewHistory(defaultState.reviewHistory);
    setCompletionCountsByDate(defaultState.completionCountsByDate);
    setDashboardLayout(defaultState.dashboardLayout);
    setHeatmapSensitivity(defaultState.heatmapSensitivity);
    setWeeklyReviewError(null);
    setTaskInput("");
    setColumnInput("");
    setDraggedTaskId(null);
    setDragOverColumnId(null);
    setClarifyTargetItemId(null);
    setClarifyDecisionState({ step: ClarifyWizardStepEnum.Actionable });
    setClarifyResult(null);
    setClarifyHistory([]);
    setProjectInvariantWarning(null);
  }

  async function handleCopyEncryptedBackup(): Promise<BackupActionResult> {
    try {
      const encrypted = await encryptBackupPayload(boardSnapshot);
      await navigator.clipboard.writeText(encrypted);
      return {
        ok: true,
        message: t("state.backup.copySuccess"),
      };
    } catch {
      return {
        ok: false,
        message: t("state.backup.copyFail"),
      };
    }
  }

  async function handleImportEncryptedBackup(
    serialized: string,
  ): Promise<BackupActionResult> {
    const normalized = serialized.trim();
    if (!normalized) {
      return {
        ok: false,
        message: t("state.backup.emptyInput"),
      };
    }

    try {
      const parsedSnapshot = await decryptBackupPayload(normalized);
      const isKnownSnapshotShape =
        isBoardStateSnapshot(parsedSnapshot) ||
        isBoardStateSnapshotV7(parsedSnapshot) ||
        isBoardStateSnapshotV6(parsedSnapshot) ||
        isBoardStateSnapshotV5(parsedSnapshot) ||
        isBoardStateSnapshotV4(parsedSnapshot) ||
        isBoardStateSnapshotV3(parsedSnapshot) ||
        isBoardStateSnapshotV2(parsedSnapshot) ||
        isLegacyBoardStateSnapshot(parsedSnapshot);

      if (!isKnownSnapshotShape) {
        return {
          ok: false,
          message: t("state.backup.invalid"),
        };
      }

      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(parsedSnapshot));
      window.location.reload();
      return {
        ok: true,
        message: t("state.backup.importSuccess"),
      };
    } catch {
      return {
        ok: false,
        message: t("state.backup.decryptFail"),
      };
    }
  }

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDragOver(
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) {
    event.preventDefault();
    setDragOverColumnId(columnId);
  }

  function handleColumnDrop(
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) {
    event.preventDefault();

    if (!draggedTaskId) {
      return;
    }

    handleMoveTask(draggedTaskId, columnId);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    setDragOverColumnId(null);
  }

  function moveDashboardWidget(
    draggedWidgetType: BoardDashboardWidgetType,
    targetWidgetType: BoardDashboardWidgetType,
  ) {
    if (draggedWidgetType === targetWidgetType) {
      return;
    }
    setDashboardLayout((currentLayout) => {
      const nextOrder = [...currentLayout.widgetOrder];
      const sourceIndex = nextOrder.indexOf(draggedWidgetType);
      const targetIndex = nextOrder.indexOf(targetWidgetType);
      if (sourceIndex === -1 || targetIndex === -1) {
        return currentLayout;
      }

      nextOrder.splice(sourceIndex, 1);
      nextOrder.splice(targetIndex, 0, draggedWidgetType);
      return {
        ...currentLayout,
        widgetOrder: nextOrder,
      };
    });
  }

  function hideDashboardWidget(widgetType: BoardDashboardWidgetType) {
    setDashboardLayout((currentLayout) => {
      if (currentLayout.hiddenWidgets.includes(widgetType)) {
        return currentLayout;
      }
      return {
        ...currentLayout,
        hiddenWidgets: [...currentLayout.hiddenWidgets, widgetType],
      };
    });
  }

  function showDashboardWidget(widgetType: BoardDashboardWidgetType) {
    setDashboardLayout((currentLayout) => ({
      ...currentLayout,
      hiddenWidgets: currentLayout.hiddenWidgets.filter(
        (hiddenWidgetType) => hiddenWidgetType !== widgetType,
      ),
    }));
  }

  function resetDashboardLayout() {
    setDashboardLayout(createDefaultDashboardLayout());
  }

  function updateHeatmapSensitivity(nextSensitivity: HeatmapSensitivity) {
    if (!isHeatmapSensitivity(nextSensitivity)) {
      return;
    }
    setHeatmapSensitivity(nextSensitivity);
  }

  function startClarify(itemId: string) {
    const itemToClarify = items.find((item) => item.id === itemId);

    if (!itemToClarify || itemToClarify.clarified) {
      return false;
    }

    const alreadyProcessed =
      nextActions.some((nextAction) => nextAction.id === itemId) ||
      projects.some((project) => project.id === itemId) ||
      somedayItems.some((somedayItem) => somedayItem.id === itemId);

    if (alreadyProcessed) {
      return false;
    }

    setClarifyTargetItemId(itemId);
    setClarifyDecisionState({ step: ClarifyWizardStepEnum.Actionable });
    setClarifyResult(null);
    return true;
  }

  function cancelClarify() {
    setClarifyTargetItemId(null);
    setClarifyDecisionState({ step: ClarifyWizardStepEnum.Actionable });
    setClarifyResult(null);
  }

  function setClarifyStep(step: ClarifyWizardStep) {
    setClarifyDecisionState((currentDecision) => ({
      ...currentDecision,
      step,
    }));
  }

  function updateClarifyDecision(
    partialDecision: Partial<ClarifyDecisionState>,
  ) {
    setClarifyDecisionState((currentDecision) => ({
      ...currentDecision,
      ...partialDecision,
    }));
  }

  function applyClarifyOutcome(outcomeInput: ClarifyOutcomeInput) {
    if (!clarifyTargetItemId) {
      return false;
    }

    const itemToClarify = items.find((item) => item.id === clarifyTargetItemId);

    if (!itemToClarify || itemToClarify.clarified) {
      return false;
    }

    const alreadyProcessed =
      nextActions.some((nextAction) => nextAction.id === clarifyTargetItemId) ||
      projects.some((project) => project.id === clarifyTargetItemId) ||
      somedayItems.some(
        (somedayItem) => somedayItem.id === clarifyTargetItemId,
      );

    if (alreadyProcessed) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const cleanItemTitle = itemToClarify.title.trim() || "Untitled item";

    if (outcomeInput.outcome === ClarifyOutcomeEnum.NextAction) {
      const preferredContextId =
        contexts.find((context) => context.id === outcomeInput.contextId)?.id ??
        contexts[0]?.id;

      if (!preferredContextId) {
        return false;
      }

      setNextActions((currentNextActions) => [
        ...currentNextActions,
        {
          id: clarifyTargetItemId,
          title: outcomeInput.title?.trim() || cleanItemTitle,
          notes: itemToClarify.notes,
          contextId: preferredContextId,
          status: NextActionStatusEnum.Active,
          projectId: null,
        },
      ]);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === clarifyTargetItemId
            ? { ...item, clarified: true, clarifiedAt: nowIso }
            : item,
        ),
      );
      setClarifyResult({
        outcome: ClarifyOutcomeEnum.NextAction,
        itemTitle: cleanItemTitle,
      });
      setClarifyDecisionState({ step: ClarifyWizardStepEnum.Confirm });
      incrementCompletionCount();
      return true;
    }

    if (outcomeInput.outcome === ClarifyOutcomeEnum.Project) {
      const normalizedProjectTitle = outcomeInput.title.trim();
      if (!normalizedProjectTitle) {
        return false;
      }

      setProjects((currentProjects) => [
        ...currentProjects,
        {
          id: clarifyTargetItemId,
          title: normalizedProjectTitle,
          notes: outcomeInput.notes?.trim() || undefined,
          status: ProjectStatusEnum.Active,
          createdAt: nowIso,
          reviewAt: nowIso,
        },
      ]);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === clarifyTargetItemId
            ? { ...item, clarified: true, clarifiedAt: nowIso }
            : item,
        ),
      );
      setClarifyResult({
        outcome: ClarifyOutcomeEnum.Project,
        itemTitle: cleanItemTitle,
      });
      setClarifyDecisionState({ step: ClarifyWizardStepEnum.Confirm });
      incrementCompletionCount();
      return true;
    }

    if (outcomeInput.outcome === ClarifyOutcomeEnum.Someday) {
      setSomedayItems((currentSomedayItems) => [
        ...currentSomedayItems,
        {
          id: clarifyTargetItemId,
          title: cleanItemTitle,
          notes: outcomeInput.notes?.trim() || itemToClarify.notes,
          reviewAt: outcomeInput.reviewAt ?? nowIso,
          createdAt: nowIso,
        },
      ]);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === clarifyTargetItemId
            ? { ...item, clarified: true, clarifiedAt: nowIso }
            : item,
        ),
      );
      setClarifyResult({
        outcome: ClarifyOutcomeEnum.Someday,
        itemTitle: cleanItemTitle,
      });
      setClarifyDecisionState({ step: ClarifyWizardStepEnum.Confirm });
      incrementCompletionCount();
      return true;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== clarifyTargetItemId),
    );
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== clarifyTargetItemId),
    );
    setLegacyTaskIds((currentLegacyTaskIds) =>
      currentLegacyTaskIds.filter(
        (legacyTaskId) => legacyTaskId !== clarifyTargetItemId,
      ),
    );
    const historyEntry = `Trashed item "${cleanItemTitle}" (${clarifyTargetItemId}) with reason "${outcomeInput.reason ?? TrashReasonEnum.Irrelevant}" at ${nowIso}`;
    console.info(historyEntry);
    setClarifyHistory((currentHistory) => [...currentHistory, historyEntry]);
    setClarifyResult({
      outcome: ClarifyOutcomeEnum.Trash,
      itemTitle: cleanItemTitle,
    });
    setClarifyDecisionState({ step: ClarifyWizardStepEnum.Confirm });
    incrementCompletionCount();
    return true;
  }

  function setSelectedContext(nextContextId: string | null) {
    if (nextContextId === null) {
      setSelectedContextId(null);
      return;
    }

    setSelectedContextId(
      contexts.some((context) => context.id === nextContextId)
        ? nextContextId
        : null,
    );
  }

  function normalizeContextName(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "";
    }
    return trimmedName.startsWith("@") ? trimmedName : `@${trimmedName}`;
  }

  function createContext(input: { name: string; description: string }) {
    const normalizedName = normalizeContextName(input.name);
    const normalizedDescription = input.description.trim();
    if (!normalizedName) {
      return false;
    }

    const hasDuplicate = contexts.some(
      (context) => context.name.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (hasDuplicate) {
      return false;
    }

    setContexts((currentContexts) => [
      ...currentContexts,
      {
        id: crypto.randomUUID(),
        name: normalizedName,
        description:
          normalizedDescription || t("state.context.customDescription"),
      },
    ]);
    incrementCompletionCount();
    return true;
  }

  function updateContext(
    contextId: string,
    input: { name: string; description: string },
  ) {
    const normalizedName = normalizeContextName(input.name);
    const normalizedDescription = input.description.trim();
    if (!normalizedName) {
      return false;
    }

    const hasDuplicate = contexts.some(
      (context) =>
        context.id !== contextId &&
        context.name.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (hasDuplicate) {
      return false;
    }

    let isUpdated = false;
    setContexts((currentContexts) =>
      currentContexts.map((context) => {
        if (context.id !== contextId) {
          return context;
        }
        isUpdated = true;
        return {
          ...context,
          name: normalizedName,
          description: normalizedDescription || context.description,
        };
      }),
    );
    if (isUpdated) {
      incrementCompletionCount();
    }
    return isUpdated;
  }

  function deleteContext(contextId: string) {
    if (contexts.length <= 1) {
      return false;
    }

    const fallbackContext = contexts.find(
      (context) => context.id !== contextId,
    );
    if (!fallbackContext) {
      return false;
    }

    setContexts((currentContexts) =>
      currentContexts.filter((context) => context.id !== contextId),
    );
    setNextActions((currentNextActions) =>
      currentNextActions.map((nextAction) =>
        nextAction.contextId === contextId
          ? { ...nextAction, contextId: fallbackContext.id }
          : nextAction,
      ),
    );
    setSelectedContextId((currentSelectedContextId) =>
      currentSelectedContextId === contextId ? null : currentSelectedContextId,
    );
    incrementCompletionCount();
    return true;
  }

  function createProject(title: string) {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return false;
    }

    const nowIso = new Date().toISOString();
    setProjects((currentProjects) => [
      ...currentProjects,
      {
        id: crypto.randomUUID(),
        title: normalizedTitle,
        status: ProjectStatusEnum.Active,
        createdAt: nowIso,
        reviewAt: nowIso,
      },
    ]);
    incrementCompletionCount();
    clearProjectInvariantWarning();
    return true;
  }

  function updateProjectTitle(projectId: string, title: string) {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return false;
    }

    let isUpdated = false;
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }
        isUpdated = true;
        return {
          ...project,
          title: normalizedTitle,
        };
      }),
    );

    if (isUpdated) {
      incrementCompletionCount();
      clearProjectInvariantWarning();
    }

    return isUpdated;
  }

  function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const targetProject = projects.find((project) => project.id === projectId);
    if (!targetProject) {
      return false;
    }

    if (status === ProjectStatusEnum.Active) {
      const activeActionsCount = countActiveProjectActions(
        nextActions,
        projectId,
      );
      if (activeActionsCount === 0) {
        warnActiveProjectInvariant(targetProject.title);
        return false;
      }
    }

    const nowIso = new Date().toISOString();
    const shouldIncrementTodayCounter = targetProject.status !== status;
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status,
              completedAt:
                status === ProjectStatusEnum.Done
                  ? project.completedAt ?? nowIso
                  : undefined,
            }
          : project,
      ),
    );
    if (shouldIncrementTodayCounter) {
      incrementCompletionCount();
    }
    clearProjectInvariantWarning();
    return true;
  }

  function createNextAction(input: {
    title: string;
    contextId: string;
    notes?: string;
    projectId?: string | null;
  }) {
    const normalizedTitle = input.title.trim();
    if (!normalizedTitle) {
      return false;
    }

    const preferredContextId =
      contexts.find((context) => context.id === input.contextId)?.id ??
      contexts[0]?.id;
    if (!preferredContextId) {
      return false;
    }

    if (
      input.projectId &&
      !projects.some((project) => project.id === input.projectId)
    ) {
      return false;
    }

    setNextActions((currentNextActions) => [
      ...currentNextActions,
      {
        id: crypto.randomUUID(),
        title: normalizedTitle,
        notes: input.notes?.trim() || undefined,
        contextId: preferredContextId,
        status: NextActionStatusEnum.Active,
        projectId: input.projectId ?? null,
      },
    ]);
    incrementCompletionCount();
    clearProjectInvariantWarning();
    return true;
  }

  function bindNextActionToProject(nextActionId: string, projectId: string) {
    const targetProject = projects.find((project) => project.id === projectId);
    if (!targetProject) {
      return false;
    }

    let isUpdated = false;
    setNextActions((currentNextActions) =>
      currentNextActions.map((nextAction) => {
        if (nextAction.id !== nextActionId) {
          return nextAction;
        }
        isUpdated = true;
        return {
          ...nextAction,
          projectId,
        };
      }),
    );

    if (isUpdated) {
      incrementCompletionCount();
      clearProjectInvariantWarning();
    }

    return isUpdated;
  }

  function unbindNextActionFromProject(nextActionId: string) {
    const blockingProject = findBlockingProjectByNextAction(
      nextActionId,
      nextActions,
    );
    if (blockingProject) {
      warnActiveProjectInvariant(blockingProject.title);
      return false;
    }

    let isUpdated = false;
    setNextActions((currentNextActions) =>
      currentNextActions.map((nextAction) => {
        if (nextAction.id !== nextActionId) {
          return nextAction;
        }
        if (!nextAction.projectId) {
          return nextAction;
        }
        isUpdated = true;
        return {
          ...nextAction,
          projectId: null,
        };
      }),
    );

    if (isUpdated) {
      incrementCompletionCount();
      clearProjectInvariantWarning();
    }

    return isUpdated;
  }

  function setNextActionStatus(nextActionId: string, status: NextActionStatus) {
    const targetNextAction = nextActions.find(
      (nextAction) => nextAction.id === nextActionId,
    );
    if (!targetNextAction) {
      return false;
    }

    if (status === NextActionStatusEnum.Done) {
      const blockingProject = findBlockingProjectByNextAction(
        nextActionId,
        nextActions,
      );
      if (blockingProject) {
        warnActiveProjectInvariant(blockingProject.title);
        return false;
      }
    }

    const nowIso = new Date().toISOString();
    const shouldIncrementTodayCounter = targetNextAction.status !== status;
    setNextActions((currentNextActions) =>
      currentNextActions.map((nextAction) =>
        nextAction.id === nextActionId
          ? {
              ...nextAction,
              status,
              completedAt:
                status === NextActionStatusEnum.Done
                  ? nextAction.completedAt ?? nowIso
                  : undefined,
            }
          : nextAction,
      ),
    );

    if (shouldIncrementTodayCounter) {
      incrementCompletionCount();
    }
    clearProjectInvariantWarning();
    return true;
  }

  function updateNextAction(
    nextActionId: string,
    input: {
      title: string;
      notes?: string;
      contextId: string;
    },
  ) {
    const normalizedTitle = input.title.trim();
    if (!normalizedTitle) {
      return false;
    }

    const preferredContextId =
      contexts.find((context) => context.id === input.contextId)?.id ?? null;
    if (!preferredContextId) {
      return false;
    }

    const normalizedNotes = input.notes?.trim() || undefined;
    let isUpdated = false;
    setNextActions((currentNextActions) =>
      currentNextActions.map((nextAction) => {
        if (nextAction.id !== nextActionId) {
          return nextAction;
        }

        const hasChanges =
          nextAction.title !== normalizedTitle ||
          (nextAction.notes ?? undefined) !== normalizedNotes ||
          nextAction.contextId !== preferredContextId;
        if (!hasChanges) {
          return nextAction;
        }

        isUpdated = true;
        return {
          ...nextAction,
          title: normalizedTitle,
          notes: normalizedNotes,
          contextId: preferredContextId,
        };
      }),
    );

    if (isUpdated) {
      incrementCompletionCount();
      clearProjectInvariantWarning();
    }
    return isUpdated;
  }

  function deleteNextAction(nextActionId: string) {
    const blockingProject = findBlockingProjectByNextAction(
      nextActionId,
      nextActions,
    );
    if (blockingProject) {
      warnActiveProjectInvariant(blockingProject.title);
      return false;
    }

    const hasTarget = nextActions.some((nextAction) => nextAction.id === nextActionId);
    if (!hasTarget) {
      return false;
    }

    setNextActions((currentNextActions) =>
      currentNextActions.filter((nextAction) => nextAction.id !== nextActionId),
    );
    incrementCompletionCount();
    clearProjectInvariantWarning();
    return true;
  }

  const orderedColumns = useMemo(
    () => [
      ...columns.filter((column) => column.id === INBOX_COLUMN.id),
      ...columns.filter((column) => column.id !== INBOX_COLUMN.id),
    ],
    [columns],
  );

  const itemById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const clarifyTargetItem = useMemo(
    () =>
      clarifyTargetItemId
        ? (items.find((item) => item.id === clarifyTargetItemId) ?? null)
        : null,
    [clarifyTargetItemId, items],
  );
  const inboxItems = useMemo(
    () =>
      items
        .filter((item) => !item.clarified)
        .sort((firstItem, secondItem) => {
          const firstCreatedAt = new Date(firstItem.createdAt).getTime();
          const secondCreatedAt = new Date(secondItem.createdAt).getTime();

          return secondCreatedAt - firstCreatedAt;
        }),
    [items],
  );
  const inboxTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (task.columnId !== INBOX_COLUMN.id) {
            return false;
          }
          if (task.status === TaskStatusEnum.Waiting) {
            return false;
          }

          const relatedItem = itemById.get(task.id);
          return relatedItem === undefined || !relatedItem.clarified;
        })
        .sort((firstTask, secondTask) => {
          const firstCreatedAt = new Date(firstTask.createdAt).getTime();
          const secondCreatedAt = new Date(secondTask.createdAt).getTime();

          return secondCreatedAt - firstCreatedAt;
        }),
    [tasks, itemById],
  );
  const waitingInboxTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (task.columnId !== INBOX_COLUMN.id) {
            return false;
          }
          if (task.status !== TaskStatusEnum.Waiting) {
            return false;
          }

          const relatedItem = itemById.get(task.id);
          return relatedItem === undefined || !relatedItem.clarified;
        })
        .sort((firstTask, secondTask) => {
          const firstDeadline = new Date(firstTask.waitingDeadline ?? "").getTime();
          const secondDeadline = new Date(secondTask.waitingDeadline ?? "").getTime();
          const firstIsInvalid = Number.isNaN(firstDeadline);
          const secondIsInvalid = Number.isNaN(secondDeadline);

          if (firstIsInvalid && secondIsInvalid) {
            return (
              new Date(secondTask.createdAt).getTime() -
              new Date(firstTask.createdAt).getTime()
            );
          }
          if (firstIsInvalid) {
            return 1;
          }
          if (secondIsInvalid) {
            return -1;
          }
          return firstDeadline - secondDeadline;
        }),
    [tasks, itemById],
  );
  const activeNextActions = useMemo(
    () =>
      nextActions.filter(
        (nextAction) => nextAction.status === NextActionStatusEnum.Active,
      ),
    [nextActions],
  );
  const visibleNextActions = useMemo(
    () =>
      activeNextActions.filter((nextAction) =>
        selectedContextId === null
          ? true
          : nextAction.contextId === selectedContextId,
      ),
    [activeNextActions, selectedContextId],
  );
  const contextActiveNextActionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const nextAction of activeNextActions) {
      counts[nextAction.contextId] = (counts[nextAction.contextId] ?? 0) + 1;
    }
    return counts;
  }, [activeNextActions]);
  const activeProjects = useMemo(
    () =>
      projects.filter((project) => project.status === ProjectStatusEnum.Active),
    [projects],
  );
  const projectHealthById = useMemo(() => {
    const healthById: Record<string, ProjectHealth> = {};
    for (const project of projects) {
      if (project.status !== ProjectStatusEnum.Active) {
        healthById[project.id] = ProjectHealthEnum.Healthy;
        continue;
      }

      const activeProjectActionsCount = countActiveProjectActions(
        nextActions,
        project.id,
      );
      healthById[project.id] =
        activeProjectActionsCount > 0
          ? ProjectHealthEnum.Healthy
          : ProjectHealthEnum.MissingNextAction;
    }
    return healthById;
  }, [projects, nextActions]);
  const projectsWithoutNextAction = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.status === ProjectStatusEnum.Active &&
          projectHealthById[project.id] === ProjectHealthEnum.MissingNextAction,
      ),
    [projectHealthById, projects],
  );
  const unboundActiveNextActions = useMemo(
    () =>
      nextActions.filter(
        (nextAction) =>
          nextAction.status === NextActionStatusEnum.Active &&
          nextAction.projectId == null,
      ),
    [nextActions],
  );
  const reviewCounters = useMemo(
    () => ({
      inboxUnclarified: inboxItems.length,
      projectsMissingActions: projectsWithoutNextAction.length,
      waitingFollowUps: waitingInboxTasks.length,
    }),
    [inboxItems.length, projectsWithoutNextAction.length, waitingInboxTasks.length],
  );
  const dashboardTaskStatusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      [TaskStatusEnum.Todo]: 0,
      [TaskStatusEnum.InProgress]: 0,
      [TaskStatusEnum.Waiting]: 0,
      [TaskStatusEnum.Done]: 0,
      [TaskStatusEnum.Obsolete]: 0,
    };
    for (const task of inboxTasks) {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
    }
    return counts;
  }, [inboxTasks]);
  const dashboardSummary = useMemo(
    () => ({
      inboxTasksTotal: inboxTasks.length,
      inboxDoneTasks: dashboardTaskStatusCounts[TaskStatusEnum.Done],
      inboxWaitingTasks: waitingInboxTasks.length,
      nextActionsDone: nextActions.filter(
        (nextAction) => nextAction.status === NextActionStatusEnum.Done,
      ).length,
      projectsDone: projects.filter(
        (project) => project.status === ProjectStatusEnum.Done,
      ).length,
    }),
    [
      dashboardTaskStatusCounts,
      inboxTasks.length,
      nextActions,
      projects,
      waitingInboxTasks.length,
    ],
  );
  const dashboardActivityByDate = useMemo(() => {
    if (Object.keys(completionCountsByDate).length > 0) {
      return completionCountsByDate;
    }

    const byDate: Record<string, number> = {};
    const allCompletedAtValues = [
      ...tasks
        .filter((task) => task.status === TaskStatusEnum.Done)
        .map((task) => task.completedAt)
        .filter((completedAt): completedAt is string => !!completedAt),
      ...nextActions
        .filter((nextAction) => nextAction.status === NextActionStatusEnum.Done)
        .map((nextAction) => nextAction.completedAt)
        .filter((completedAt): completedAt is string => !!completedAt),
      ...projects
        .filter((project) => project.status === ProjectStatusEnum.Done)
        .map((project) => project.completedAt)
        .filter((completedAt): completedAt is string => !!completedAt),
    ];
    for (const completedAt of allCompletedAtValues) {
      const dayKey = completedAt.slice(0, 10);
      byDate[dayKey] = (byDate[dayKey] ?? 0) + 1;
    }
    return byDate;
  }, [completionCountsByDate, nextActions, projects, tasks]);
  const isReviewCompleteBlocked =
    reviewCounters.inboxUnclarified > 0 ||
    reviewCounters.projectsMissingActions > 0;
  const activeWeeklyReviewSnapshot =
    useMemo<WeeklyReviewSnapshot | null>(() => {
      if (!weeklyReviewStartedAt) {
        return null;
      }

      return {
        startedAt: weeklyReviewStartedAt,
        completedAt: "",
        completed: false,
        step: currentReviewStep,
        note: weeklyReviewNote,
        counters: reviewCounters,
      };
    }, [
      currentReviewStep,
      reviewCounters,
      weeklyReviewNote,
      weeklyReviewStartedAt,
    ]);
  const lastCompletedReview = reviewHistory[0] ?? null;

  function startWeeklyReview() {
    const nowIso = new Date().toISOString();
    setWeeklyReviewStartedAt(nowIso);
    setCurrentReviewStep(0);
    setWeeklyReviewError(null);
  }

  function goToNextReviewStep() {
    setCurrentReviewStep((currentStep) =>
      Math.min(currentStep + 1, REVIEW_STEPS_COUNT - 1),
    );
    setWeeklyReviewError(null);
  }

  function goToPreviousReviewStep() {
    setCurrentReviewStep((currentStep) => Math.max(currentStep - 1, 0));
    setWeeklyReviewError(null);
  }

  function setReviewStep(nextStep: number) {
    if (
      !Number.isInteger(nextStep) ||
      nextStep < 0 ||
      nextStep >= REVIEW_STEPS_COUNT
    ) {
      return;
    }
    setCurrentReviewStep(nextStep);
    setWeeklyReviewError(null);
  }

  function updateWeeklyReviewNote(note: string) {
    setWeeklyReviewNote(note);
  }

  function completeWeeklyReview() {
    if (reviewCounters.inboxUnclarified > 0) {
      setWeeklyReviewError(t("state.review.error.inbox"));
      return false;
    }
    if (reviewCounters.projectsMissingActions > 0) {
      setWeeklyReviewError(t("state.review.error.projects"));
      return false;
    }

    const startedAt = weeklyReviewStartedAt ?? new Date().toISOString();
    const completedAt = new Date().toISOString();
    const completedSnapshot: WeeklyReviewSnapshot = {
      startedAt,
      completedAt,
      completed: true,
      step: REVIEW_STEPS_COUNT - 1,
      note: weeklyReviewNote.trim(),
      counters: reviewCounters,
    };

    setProjects((currentProjects) =>
      currentProjects.map((project) => ({
        ...project,
        reviewAt: completedAt,
        lastReviewedAt: completedAt,
      })),
    );
    setReviewHistory((currentHistory) =>
      [completedSnapshot, ...currentHistory].slice(0, 10),
    );
    setCurrentReviewStep(0);
    setWeeklyReviewStartedAt(null);
    setWeeklyReviewError(null);
    return true;
  }

  function projectActions(projectId: string) {
    return nextActions.filter(
      (nextAction) => nextAction.projectId === projectId,
    );
  }

  return {
    columns,
    orderedColumns,
    tasks,
    items,
    nextActions,
    projects,
    somedayItems,
    contexts,
    selectedContextId,
    legacyTaskIds,
    boardSnapshot,
    isMigratedFromLegacy,
    currentReviewStep,
    weeklyReviewStartedAt,
    weeklyReviewNote,
    reviewHistory,
    completionCountsByDate,
    dashboardLayout,
    heatmapSensitivity,
    weeklyReviewError,
    clarifyTargetItemId,
    clarifyTargetItem,
    clarifyDecisionState,
    clarifyResult,
    clarifyHistory,
    inboxItems,
    inboxTasks,
    waitingInboxTasks,
    activeNextActions,
    visibleNextActions,
    contextActiveNextActionCounts,
    activeProjects,
    projectInvariantWarning,
    projectHealthById,
    projectsWithoutNextAction,
    unboundActiveNextActions,
    reviewCounters,
    dashboardSummary,
    dashboardTaskStatusCounts,
    dashboardActivityByDate,
    isReviewCompleteBlocked,
    activeWeeklyReviewSnapshot,
    lastCompletedReview,
    projectActions,
    taskInput,
    columnInput,
    dragOverColumnId,
    setTaskInput,
    setColumnInput,
    setSelectedContext,
    createContext,
    updateContext,
    deleteContext,
    clearProjectInvariantWarning,
    handleCaptureItem,
    handleAddColumn,
    handleSetTaskStatus,
    handleUpdateTaskTitle,
    handleMoveTask,
    handleDeleteTask,
    handleUnarchiveTask,
    handleMoveSomedayItemToInbox,
    startClarify,
    cancelClarify,
    applyClarifyOutcome,
    createProject,
    updateProjectTitle,
    updateProjectStatus,
    createNextAction,
    bindNextActionToProject,
    unbindNextActionFromProject,
    setNextActionStatus,
    updateNextAction,
    deleteNextAction,
    setClarifyStep,
    updateClarifyDecision,
    startWeeklyReview,
    goToNextReviewStep,
    goToPreviousReviewStep,
    setReviewStep,
    updateWeeklyReviewNote,
    completeWeeklyReview,
    handleResetLocalData,
    handleCopyEncryptedBackup,
    handleImportEncryptedBackup,
    applyBoardSnapshot,
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragLeave,
    moveDashboardWidget,
    hideDashboardWidget,
    showDashboardWidget,
    resetDashboardLayout,
    updateHeatmapSensitivity,
  };
}
