import { useMemo, useRef, useState } from 'react'
import { BoardColumn } from './components/BoardColumn'
import { BoardHeader } from './components/BoardHeader'
import { ClarifyWizard } from './features/clarify/ClarifyWizard'
import { ContextFilterBar } from './features/engage/ContextFilterBar'
import { NextActionList } from './features/engage/NextActionList'
import { GuideView } from './features/guide/GuideView'
import { ProjectView } from './features/projects/ProjectView'
import { WeeklyReviewView } from './features/review/WeeklyReviewView'
import { INBOX_COLUMN } from './constants/board'
import { useBoardState } from './hooks/useBoardState'

  type AppMode = 'board' | 'engage' | 'projects' | 'review' | 'guide'

function App() {
  const {
    legacyTaskIds,
    inboxItems,
    inboxTasks,
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
    handleMoveTask,
    handleDeleteTask,
    startClarify,
    cancelClarify,
    applyClarifyOutcome,
    createProject,
    updateProjectTitle,
    updateProjectStatus,
    createNextAction,
    bindNextActionToProject,
    unbindNextActionFromProject,
    markNextActionDone,
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
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragLeave,
  } = useBoardState()
  const clarifyTriggerRef = useRef<HTMLElement | null>(null)
  const [appMode, setAppMode] = useState<AppMode>('board')
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false)
  const rawInboxItemIds = useMemo(
    () => new Set(inboxItems.map((inboxItem) => inboxItem.id)),
    [inboxItems],
  )
  const contextsById = useMemo(
    () => new Map(contexts.map((context) => [context.id, context])),
    [contexts],
  )
  const selectedContextLabel = useMemo(() => {
    if (selectedContextId === null) {
      return 'All contexts'
    }
    return contextsById.get(selectedContextId)?.name ?? 'Unknown context'
  }, [contextsById, selectedContextId])
  const completedActionsCount = useMemo(
    () => nextActions.filter((nextAction) => nextAction.status === 'done').length,
    [nextActions],
  )
  const completedProjectsCount = useMemo(
    () => projects.filter((project) => project.status === 'done').length,
    [projects],
  )

  function focusBackToInboxList() {
    if (clarifyTriggerRef.current && document.contains(clarifyTriggerRef.current)) {
      clarifyTriggerRef.current.focus()
      return
    }

    const inboxRegion = document.querySelector('[data-inbox-list="true"]')
    if (inboxRegion instanceof HTMLElement) {
      inboxRegion.focus()
    }
  }

  function handleStartClarify(taskId: string, triggerElement: HTMLButtonElement) {
    const isStarted = startClarify(taskId)
    if (!isStarted) {
      return
    }

    clarifyTriggerRef.current = triggerElement
  }

  function handleCancelClarify() {
    cancelClarify()
    focusBackToInboxList()
  }

  function handleCloseClarifyConfirm() {
    cancelClarify()
    focusBackToInboxList()
  }

  function modeButtonClass(mode: AppMode) {
    return `w-full cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-in-out md:px-5 md:py-3 md:text-base ${
      appMode === mode
        ? 'border-sky-400/70 bg-sky-400/18 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.24)]'
        : 'border-slate-500/45 bg-slate-900/55 text-slate-300 hover:border-slate-400/70 hover:bg-slate-800/65 hover:text-slate-100'
    }`
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden p-4 max-md:p-3">
      <BoardHeader
        onResetLocalData={handleResetLocalData}
        onOpenGuide={() => setAppMode('guide')}
        onCopyEncryptedBackup={handleCopyEncryptedBackup}
        onImportEncryptedBackup={handleImportEncryptedBackup}
        taskInput={taskInput}
        setTaskInput={setTaskInput}
        onCaptureItem={handleCaptureItem}
      />

      {!(appMode === 'projects' && isProjectDetailOpen) ? (
        <section
          className="mt-3 w-full rounded-2xl border border-slate-500/40 bg-slate-950/35 p-2 md:p-2.5"
          aria-label="Переключение режима работы"
        >
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-2.5">
            <button
              className={modeButtonClass('board')}
              type="button"
              onClick={() => setAppMode('board')}
              aria-pressed={appMode === 'board'}
            >
              Inbox ({inboxItems.length})
            </button>
            <button
              className={modeButtonClass('engage')}
              type="button"
              onClick={() => setAppMode('engage')}
              aria-pressed={appMode === 'engage'}
            >
              Engage
            </button>
            <button
              className={modeButtonClass('projects')}
              type="button"
              onClick={() => setAppMode('projects')}
              aria-pressed={appMode === 'projects'}
            >
              Projects
            </button>
            <button
              className={modeButtonClass('review')}
              type="button"
              onClick={() => setAppMode('review')}
              aria-pressed={appMode === 'review'}
            >
              Weekly Review
            </button>
          </div>
        </section>
      ) : null}
      {projectInvariantWarning ? (
        <section className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/45 bg-amber-400/12 px-3 py-2">
          <p className="m-0 text-sm text-amber-100">{projectInvariantWarning}</p>
          <button
            className="cursor-pointer rounded-[10px] border border-amber-300/55 bg-amber-300/20 px-2.5 py-1 text-xs font-semibold text-amber-100"
            type="button"
            onClick={clearProjectInvariantWarning}
          >
            Dismiss
          </button>
        </section>
      ) : null}

      {appMode === 'board' ? (
        <section
          className="mt-5 flex min-h-0 flex-1 items-stretch overflow-hidden px-1 pt-0.5 pb-2 max-md:mt-3.5"
          aria-label="Inbox"
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
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onStartClarify={handleStartClarify}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragLeave={handleColumnDragLeave}
          />
        </section>
      ) : appMode === 'engage' ? (
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
              contextsById={contextsById}
              selectedContextLabel={selectedContextLabel}
              onMarkDone={markNextActionDone}
            />
          </div>
        </section>
      ) : appMode === 'projects' ? (
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
      ) : appMode === 'review' ? (
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
            : 'clarify-idle')
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
            outcome: 'next_action',
            contextId: payload.contextId,
            title: payload.title,
          })
        }
        onApplyProject={(payload) =>
          applyClarifyOutcome({
            outcome: 'project',
            title: payload.title,
            notes: payload.notes,
          })
        }
        onApplySomeday={(payload) =>
          applyClarifyOutcome({
            outcome: 'someday',
            notes: payload.notes,
          })
        }
        onApplyTrash={(payload) =>
          applyClarifyOutcome({
            outcome: 'trash',
            reason: payload.reason,
          })
        }
      />
    </main>
  )
}

export default App
