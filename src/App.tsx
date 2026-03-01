import { useEffect, useMemo, useRef, useState } from "react";
import { BoardColumn } from "./components/BoardColumn";
import { BoardHeader } from "./components/BoardHeader";
import { ClarifyWizard } from "./features/clarify/ClarifyWizard";
import { BoardDashboardPanel } from "./features/board/components/BoardDashboardPanel";
import { ContextFilterBar } from "./features/engage/ContextFilterBar";
import { NextActionList } from "./features/engage/NextActionList";
import { GuideView } from "./features/guide/GuideView";
import { ProjectView } from "./features/projects/ProjectView";
import { WeeklyReviewView } from "./features/review/WeeklyReviewView";
import { INBOX_COLUMN } from "./constants/board";
import { useBoardState } from "./hooks/useBoardState";
import { useAuth } from "./hooks/useAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { useI18n } from "./i18n/useI18n";
import { clearCloudSyncData } from "./services/firebase-sync";
import { cloudSyncStore } from "./sync/op-queue/indexeddb-cloud-sync-store";
import { CloudSyncStatusEnum, TaskStatusEnum } from "./types/enums";
import {
  ClarifyOutcomeEnum,
  NextActionStatusEnum,
  ProjectStatusEnum,
  TrashReasonEnum,
} from "./types/gtd";

type AppMode = "board" | "engage" | "projects" | "review" | "guide";
interface CloudResetActionResult {
  ok: boolean;
  message: string;
}
const STARTUP_EXIT_ANIMATION_MS = 520;

function App() {
  const { t } = useI18n();
  const { user, isLoading, error, isEnabled, signInWithGoogle, signOutUser } =
    useAuth();
  const [isStartupOverlayVisible, setIsStartupOverlayVisible] = useState(true);
  const {
    legacyTaskIds,
    boardSnapshot,
    inboxItems,
    inboxTasks,
    tasks,
    contexts,
    selectedContextId,
    nextActions,
    projects,
    somedayItems,
    visibleNextActions,
    contextActiveNextActionCounts,
    projectInvariantWarning,
    projectHealthById,
    projectsWithoutNextAction,
    unboundActiveNextActions,
    projectActions,
    currentReviewStep,
    weeklyReviewStartedAt,
    weeklyReviewNote,
    weeklyReviewError,
    reviewCounters,
    isReviewCompleteBlocked,
    lastCompletedReview,
    dashboardLayout,
    heatmapSensitivity,
    dashboardSummary,
    dashboardTaskStatusCounts,
    waitingInboxTasks,
    dashboardActivityByDate,
    clarifyTargetItem,
    clarifyDecisionState,
    clarifyResult,
    taskInput,
    dragOverColumnId,
    setTaskInput,
    setSelectedContext,
    createContext,
    updateContext,
    deleteContext,
    clearProjectInvariantWarning,
    handleCaptureItem,
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
  } = useBoardState();
  const cloudSyncState = useCloudSync({
    localSnapshot: boardSnapshot,
    applySnapshot: applyBoardSnapshot,
    user,
    t,
  });
  const cloudSyncStatusLabel = useMemo(() => {
    if (cloudSyncState.status === CloudSyncStatusEnum.Disabled) {
      return t("header.sync.disabled");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.SignedOut) {
      return t("header.sync.signedOut");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.Syncing) {
      return t("header.sync.syncing");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.Reconnecting) {
      return t("header.sync.reconnecting");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.CatchingUp) {
      return t("header.sync.catchingUp");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.Recovered) {
      return t("header.sync.recovered");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.NeedsResync) {
      return t("header.sync.needsResync");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.Offline) {
      return t("header.sync.offline");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.Error) {
      return t("header.sync.error");
    }
    if (cloudSyncState.status === CloudSyncStatusEnum.NeedsAttention) {
      return t("header.sync.needsAttention");
    }
    return t("header.sync.synced");
  }, [cloudSyncState.status, t]);
  const clarifyTriggerRef = useRef<HTMLElement | null>(null);
  const [appMode, setAppMode] = useState<AppMode>("board");
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const rawInboxItemIds = useMemo(
    () => new Set(inboxItems.map((inboxItem) => inboxItem.id)),
    [inboxItems],
  );
  const contextsById = useMemo(
    () => new Map(contexts.map((context) => [context.id, context])),
    [contexts],
  );
  const selectedContextLabel = useMemo(() => {
    if (selectedContextId === null) {
      return t("app.contexts.all");
    }
    return (
      contextsById.get(selectedContextId)?.name ?? t("app.contexts.unknown")
    );
  }, [contextsById, selectedContextId, t]);
  const completedActionsCount = useMemo(
    () =>
      nextActions.filter(
        (nextAction) => nextAction.status === NextActionStatusEnum.Done,
      ).length,
    [nextActions],
  );
  const completedProjectsCount = useMemo(
    () =>
      projects.filter((project) => project.status === ProjectStatusEnum.Done)
        .length,
    [projects],
  );
  const archivedTasks = useMemo(
    () => tasks.filter((task) => task.status === TaskStatusEnum.Obsolete),
    [tasks],
  );

  function focusBackToInboxList() {
    if (
      clarifyTriggerRef.current &&
      document.contains(clarifyTriggerRef.current)
    ) {
      clarifyTriggerRef.current.focus();
      return;
    }

    const inboxRegion = document.querySelector('[data-inbox-list="true"]');
    if (inboxRegion instanceof HTMLElement) {
      inboxRegion.focus();
    }
  }

  function handleStartClarify(
    taskId: string,
    triggerElement: HTMLButtonElement,
  ) {
    const isStarted = startClarify(taskId);
    if (!isStarted) {
      return;
    }

    clarifyTriggerRef.current = triggerElement;
  }

  function handleCancelClarify() {
    cancelClarify();
    focusBackToInboxList();
  }

  function handleCloseClarifyConfirm() {
    cancelClarify();
    focusBackToInboxList();
  }

  function modeButtonClass(mode: AppMode) {
    return `w-full cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-in-out md:px-5 md:py-3 md:text-base ${
      appMode === mode
        ? "border-sky-400/70 bg-sky-400/18 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.24)]"
        : "border-slate-500/45 bg-slate-900/55 text-slate-300 hover:border-slate-400/70 hover:bg-slate-800/65 hover:text-slate-100"
    }`;
  }

  async function handleResetCloudData(): Promise<CloudResetActionResult> {
    if (!isEnabled || !user) {
      return {
        ok: false,
        message: t("state.cloudReset.noAuth"),
      };
    }

    try {
      await clearCloudSyncData(user.uid);
      await cloudSyncStore.clearSyncState();
      return {
        ok: true,
        message: t("state.cloudReset.success"),
      };
    } catch {
      return {
        ok: false,
        message: t("state.cloudReset.fail"),
      };
    }
  }

  useEffect(() => {
    if (!isEnabled || !isStartupOverlayVisible) {
      return;
    }

    if (isLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsStartupOverlayVisible(false);
    }, STARTUP_EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isEnabled, isLoading, isStartupOverlayVisible]);

  const shouldShowStartupOverlay = isEnabled && isStartupOverlayVisible;
  const isStartupOverlayExiting = shouldShowStartupOverlay && !isLoading;
  const startupOverlay = shouldShowStartupOverlay ? (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-[opacity,transform,filter] duration-500 ${
        isStartupOverlayExiting
          ? "pointer-events-none opacity-0 blur-sm"
          : "opacity-100"
      }`}
      aria-live="polite"
      role="status"
    >
      <section className="flex w-full max-w-md flex-col items-center gap-5 px-6 text-center">
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="absolute inset-0 animate-ping rounded-full border border-cyan-300/40" />
          <div className="absolute inset-2 rounded-full border border-cyan-200/35" />
          <div className="absolute inset-4 rounded-full border-2 border-cyan-300/80 border-t-transparent [animation:spin_1.9s_linear_infinite]" />
          <div className="absolute inset-[38%] rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
        </div>
        <p className="m-0 text-sm font-semibold tracking-[0.14em] text-cyan-200">
          {t("app.authGate.startupLoading")}
        </p>
      </section>
    </div>
  ) : null;

  if (isEnabled && isLoading) {
    return (
      <>
        <main className="flex h-full w-full items-center justify-center p-4" />
        {startupOverlay}
      </>
    );
  }

  if (isEnabled && !user) {
    return (
      <>
        <main className="flex h-full w-full items-center justify-center p-4">
          <section className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_42px_rgba(2,6,23,0.6)]">
            <h1 className="m-0 text-xl text-slate-100">
              {t("app.authGate.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {t("app.authGate.description")}
            </p>
            {error ? (
              <p className="mt-2 text-xs text-rose-200/90">
                {t("app.authGate.error")}
              </p>
            ) : null}
            <button
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-cyan-400/50 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
              type="button"
              onClick={() => void signInWithGoogle()}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M21.35 12.23c0-.77-.07-1.51-.2-2.23H12v4.22h5.24a4.48 4.48 0 0 1-1.95 2.94v2.44h3.15c1.84-1.7 2.91-4.2 2.91-7.37Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.15-2.44c-.87.58-1.99.92-3.3.92-2.54 0-4.69-1.71-5.46-4.02H3.29v2.52A9.75 9.75 0 0 0 12 21.75Z"
                  fill="#34A853"
                />
                <path
                  d="M6.54 13.85a5.85 5.85 0 0 1 0-3.7V7.63H3.29a9.75 9.75 0 0 0 0 8.74l3.25-2.52Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 6.13c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.2 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.38l3.25 2.52c.77-2.31 2.92-4.02 5.46-4.02Z"
                  fill="#EA4335"
                />
              </svg>
              <span>{t("app.authGate.signInGoogle")}</span>
            </button>
          </section>
        </main>
        {startupOverlay}
      </>
    );
  }

  return (
    <>
      <main className="flex h-full w-full flex-col overflow-hidden p-4 max-md:p-3">
        <BoardHeader
        onResetLocalData={handleResetLocalData}
        onOpenGuide={() => setAppMode("guide")}
        onOpenReview={() => setAppMode("review")}
        onResetCloudData={handleResetCloudData}
        taskInput={taskInput}
        setTaskInput={setTaskInput}
        onCaptureItem={handleCaptureItem}
        isCloudSyncEnabled={isEnabled}
        onSignOut={signOutUser}
        cloudSyncStatusLabel={cloudSyncState.message ?? cloudSyncStatusLabel}
        cloudSyncQueueLength={cloudSyncState.metrics.queueLength}
        cloudSyncPendingUploads={cloudSyncState.metrics.pendingUploads}
        cloudSyncLastAckSortKey={cloudSyncState.metrics.lastAckSortKey}
        archivedTasks={archivedTasks}
        somedayItems={somedayItems}
        onUnarchiveTask={handleUnarchiveTask}
        onMoveSomedayToInbox={handleMoveSomedayItemToInbox}
      />

      {!(appMode === "projects" && isProjectDetailOpen) ? (
        <section
          className="mt-3 w-full rounded-2xl border border-slate-500/40 bg-slate-950/35 p-2 md:p-1"
          aria-label={t("app.modes.aria")}
        >
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-2.5">
            <button
              className={modeButtonClass("board")}
              type="button"
              onClick={() => setAppMode("board")}
              aria-pressed={appMode === "board"}
            >
              {t("app.modes.board", { count: inboxItems.length })}
            </button>
            <button
              className={modeButtonClass("engage")}
              type="button"
              onClick={() => setAppMode("engage")}
              aria-pressed={appMode === "engage"}
            >
              {t("app.modes.engage")}
            </button>
            <button
              className={modeButtonClass("projects")}
              type="button"
              onClick={() => setAppMode("projects")}
              aria-pressed={appMode === "projects"}
            >
              {t("app.modes.projects")}
            </button>
          </div>
        </section>
      ) : null}
      {projectInvariantWarning ? (
        <section className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/45 bg-amber-400/12 px-3 py-2">
          <p className="m-0 text-sm text-amber-100">
            {projectInvariantWarning}
          </p>
          <button
            className="cursor-pointer rounded-[10px] border border-amber-300/55 bg-amber-300/20 px-2.5 py-1 text-xs font-semibold text-amber-100"
            type="button"
            onClick={clearProjectInvariantWarning}
          >
            {t("app.warning.dismiss")}
          </button>
        </section>
      ) : null}

      {appMode === "board" ? (
        <section
          className="mt-5 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 overflow-hidden px-1 pt-0.5 pb-2 md:grid-cols-[minmax(220px,1fr)_minmax(0,3fr)] max-md:mt-3.5"
          aria-label={t("app.inbox.label")}
        >
          <BoardColumn
            column={INBOX_COLUMN}
            columns={[INBOX_COLUMN]}
            tasks={inboxTasks}
            legacyTaskIds={legacyTaskIds}
            isInbox
            isFullWidth
            isDragOver={dragOverColumnId === INBOX_COLUMN.id}
            rawInboxItemIds={rawInboxItemIds}
            onSetTaskStatus={handleSetTaskStatus}
            onUpdateTaskTitle={handleUpdateTaskTitle}
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onStartClarify={handleStartClarify}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragLeave={handleColumnDragLeave}
          />
          <BoardDashboardPanel
            dashboardLayout={dashboardLayout}
            dashboardSummary={dashboardSummary}
            dashboardTaskStatusCounts={dashboardTaskStatusCounts}
            waitingTasks={waitingInboxTasks}
            onSetWaitingTaskStatus={handleSetTaskStatus}
            dashboardActivityByDate={dashboardActivityByDate}
            heatmapSensitivity={heatmapSensitivity}
            onMoveWidget={moveDashboardWidget}
            onHideWidget={hideDashboardWidget}
            onShowWidget={showDashboardWidget}
            onResetLayout={resetDashboardLayout}
            onUpdateHeatmapSensitivity={updateHeatmapSensitivity}
          />
        </section>
      ) : appMode === "engage" ? (
        <section className="mt-5 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden pr-1 md:grid-cols-[minmax(230px,1fr)_minmax(0,3fr)] max-md:pr-0">
          <ContextFilterBar
            contexts={contexts}
            selectedContextId={selectedContextId}
            contextActiveNextActionCounts={contextActiveNextActionCounts}
            onSelectContext={setSelectedContext}
            onCreateContext={createContext}
            onUpdateContext={updateContext}
            onDeleteContext={deleteContext}
          />
          <div className="min-h-0 overflow-y-auto rounded-2xl border border-slate-500/25 bg-slate-950/20 p-2.5 md:p-3">
            <NextActionList
              nextActions={visibleNextActions}
              contexts={contexts}
              contextsById={contextsById}
              selectedContextLabel={selectedContextLabel}
              onSetStatus={setNextActionStatus}
              onUpdateNextAction={updateNextAction}
              onDeleteNextAction={deleteNextAction}
            />
          </div>
        </section>
      ) : appMode === "projects" ? (
        <ProjectView
          projects={projects}
          contexts={contexts}
          nextActions={nextActions}
          projectHealthById={projectHealthById}
          projectsWithoutNextActionCount={projectsWithoutNextAction.length}
          unboundActiveNextActions={unboundActiveNextActions}
          projectActions={projectActions}
          onCreateProject={createProject}
          onUpdateProjectTitle={updateProjectTitle}
          onUpdateProjectStatus={updateProjectStatus}
          onQuickAddLinkedAction={(input) =>
            createNextAction({
              title: input.title,
              contextId: input.contextId,
              projectId: input.projectId,
            })
          }
          onBindNextAction={bindNextActionToProject}
          onUnbindNextAction={unbindNextActionFromProject}
          onProjectDetailOpenChange={setIsProjectDetailOpen}
        />
      ) : appMode === "review" ? (
        <WeeklyReviewView
          currentStep={currentReviewStep}
          reviewStartedAt={weeklyReviewStartedAt}
          reviewNote={weeklyReviewNote}
          reviewCounters={reviewCounters}
          projectsWithoutNextAction={projectsWithoutNextAction}
          somedayItemsCount={somedayItems.length}
          completedActionsCount={completedActionsCount}
          completedProjectsCount={completedProjectsCount}
          isCompleteBlocked={isReviewCompleteBlocked}
          completionError={weeklyReviewError}
          lastCompletedReview={lastCompletedReview}
          onStartReview={startWeeklyReview}
          onNextStep={goToNextReviewStep}
          onPreviousStep={goToPreviousReviewStep}
          onSetStep={setReviewStep}
          onCompleteReview={completeWeeklyReview}
          onUpdateReviewNote={updateWeeklyReviewNote}
          onNavigate={setAppMode}
        />
      ) : (
        <GuideView onNavigate={setAppMode} />
      )}

        <ClarifyWizard
        key={
          clarifyTargetItem?.id ??
          (clarifyResult
            ? `${clarifyResult.outcome}-${clarifyResult.itemTitle}`
            : "clarify-idle")
        }
        targetItem={clarifyTargetItem}
        decisionState={clarifyDecisionState}
        contexts={contexts}
        clarifyResult={clarifyResult}
        onCancel={handleCancelClarify}
        onDone={handleCloseClarifyConfirm}
        onSetStep={setClarifyStep}
        onUpdateDecision={updateClarifyDecision}
        onApplyNextAction={(payload) =>
          applyClarifyOutcome({
            outcome: ClarifyOutcomeEnum.NextAction,
            contextId: payload.contextId,
            title: payload.title,
          })
        }
        onApplyProject={(payload) =>
          applyClarifyOutcome({
            outcome: ClarifyOutcomeEnum.Project,
            title: payload.title,
            notes: payload.notes,
          })
        }
        onApplySomeday={(payload) =>
          applyClarifyOutcome({
            outcome: ClarifyOutcomeEnum.Someday,
            notes: payload.notes,
          })
        }
        onApplyTrash={(payload) =>
          applyClarifyOutcome({
            outcome: ClarifyOutcomeEnum.Trash,
            reason: payload.reason ?? TrashReasonEnum.Irrelevant,
          })
        }
        />
      </main>
      {startupOverlay}
    </>
  );
}

export default App;
