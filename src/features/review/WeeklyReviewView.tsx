import { ReviewStepper } from '../../../design-system/components/ReviewStepper'
import type { Project, WeeklyReviewSnapshot } from '../../types/gtd'

type AppMode = 'board' | 'engage' | 'projects' | 'review'

interface ReviewCounters {
  inboxUnclarified: number
  projectsMissingActions: number
  waitingFollowUps: number
}

interface WeeklyReviewViewProps {
  currentStep: number
  reviewStartedAt: string | null
  reviewNote: string
  reviewCounters: ReviewCounters
  projectsWithoutNextAction: Project[]
  somedayItemsCount: number
  completedActionsCount: number
  completedProjectsCount: number
  isCompleteBlocked: boolean
  completionError: string | null
  lastCompletedReview: WeeklyReviewSnapshot | null
  onStartReview: () => void
  onNextStep: () => void
  onPreviousStep: () => void
  onSetStep: (nextStep: number) => void
  onCompleteReview: () => void
  onUpdateReviewNote: (note: string) => void
  onNavigate: (mode: AppMode) => void
}

const REVIEW_STEPS = [
  {
    id: 'empty-inbox',
    title: 'Empty Inbox',
    description: 'Clarify all captured items and get inbox to zero.',
  },
  {
    id: 'check-projects',
    title: 'Check all Projects',
    description: 'Review active outcomes and detect stale/problematic ones.',
  },
  {
    id: 'ensure-next-action',
    title: 'Ensure every Project has NextAction',
    description: 'Every active project must keep at least one active action.',
  },
  {
    id: 'review-waiting-for',
    title: 'Review WaitingFor',
    description: 'Track delegated commitments and follow-up points.',
  },
  {
    id: 'clean-someday',
    title: 'Clean Someday list',
    description: 'Keep your non-committed ideas intentional.',
  },
  {
    id: 'close-loops',
    title: 'Close completed loops',
    description: 'Close finished commitments and clear leftovers.',
  },
  {
    id: 'set-intention',
    title: 'Set intention for next week',
    description: 'Capture your focus note for the coming week.',
  },
]

export function WeeklyReviewView({
  currentStep,
  reviewStartedAt,
  reviewNote,
  reviewCounters,
  projectsWithoutNextAction,
  somedayItemsCount,
  completedActionsCount,
  completedProjectsCount,
  isCompleteBlocked,
  completionError,
  lastCompletedReview,
  onStartReview,
  onNextStep,
  onPreviousStep,
  onSetStep,
  onCompleteReview,
  onUpdateReviewNote,
  onNavigate,
}: WeeklyReviewViewProps) {
  const hasActiveReview = reviewStartedAt !== null
  const isFinalStep = currentStep === REVIEW_STEPS.length - 1

  function renderCurrentStepBody() {
    if (currentStep === 0) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            Unclarified inbox items:{' '}
            <span className="font-semibold text-slate-100">{reviewCounters.inboxUnclarified}</span>
          </p>
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
            type="button"
            onClick={() => onNavigate('board')}
          >
            Go to Inbox
          </button>
        </div>
      )
    }

    if (currentStep === 1) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            Projects requiring attention:{' '}
            <span className="font-semibold text-slate-100">
              {projectsWithoutNextAction.length}
            </span>
          </p>
          {projectsWithoutNextAction.length > 0 ? (
            <ul className="m-0 grid gap-1 pl-5 text-sm text-amber-200">
              {projectsWithoutNextAction.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-emerald-200">All active projects look healthy.</p>
          )}
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/15 px-3 py-1.5 text-sm font-semibold text-violet-200"
            type="button"
            onClick={() => onNavigate('projects')}
          >
            Open Project View
          </button>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            Active projects without next action:{' '}
            <span className="font-semibold text-amber-200">
              {reviewCounters.projectsMissingActions}
            </span>
          </p>
          {projectsWithoutNextAction.length > 0 ? (
            <div className="grid gap-1.5">
              {projectsWithoutNextAction.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-amber-400/40 bg-amber-400/12 px-2.5 py-2 text-sm text-amber-100"
                >
                  {project.title}
                </div>
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-emerald-200">
              Rule satisfied: every active project has at least one next action.
            </p>
          )}
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/15 px-3 py-1.5 text-sm font-semibold text-violet-200"
            type="button"
            onClick={() => onNavigate('projects')}
          >
            Fix in Projects
          </button>
        </div>
      )
    }

    if (currentStep === 3) {
      return (
        <p className="m-0 text-sm text-slate-300">
          Waiting follow-ups ready (future-ready counter):{' '}
          <span className="font-semibold text-slate-100">{reviewCounters.waitingFollowUps}</span>
        </p>
      )
    }

    if (currentStep === 4) {
      return (
        <p className="m-0 text-sm text-slate-300">
          Someday list size: <span className="font-semibold text-slate-100">{somedayItemsCount}</span>
        </p>
      )
    }

    if (currentStep === 5) {
      return (
        <p className="m-0 text-sm text-slate-300">
          Closed loops this cycle candidate: done actions{' '}
          <span className="font-semibold text-slate-100">{completedActionsCount}</span>, done
          projects <span className="font-semibold text-slate-100">{completedProjectsCount}</span>.
        </p>
      )
    }

    return (
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-200" htmlFor="weekly-review-note">
          Intention note for next week
        </label>
        <textarea
          id="weekly-review-note"
          className="min-h-[110px] w-full rounded-xl border border-slate-400/35 bg-slate-900/75 px-3 py-2 text-sm text-slate-100"
          value={reviewNote}
          onChange={(event) => onUpdateReviewNote(event.target.value)}
          placeholder="What should matter most next week?"
        />
      </div>
    )
  }

  return (
    <section
      className="mt-5 grid min-h-0 grid-rows-[auto_1fr] gap-3 overflow-y-auto pr-1"
      tabIndex={0}
      onKeyDown={(event) => {
        if (!hasActiveReview) {
          return
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          onNextStep()
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          onPreviousStep()
        }
      }}
      aria-label="Weekly Review"
    >
      <header className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-lg text-slate-100">Weekly Review</h2>
          {reviewStartedAt ? (
            <p className="m-0 text-xs text-slate-300">
              Started: {new Date(reviewStartedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        {!hasActiveReview ? (
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
            type="button"
            onClick={onStartReview}
          >
            Start Weekly Review
          </button>
        ) : null}
      </header>

      {!hasActiveReview && lastCompletedReview ? (
        <article className="grid gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-3.5">
          <h3 className="m-0 text-base text-emerald-100">Review Completed</h3>
          <p className="m-0 text-sm text-emerald-50">
            Completed at {new Date(lastCompletedReview.completedAt).toLocaleString()}
          </p>
          <p className="m-0 text-sm text-emerald-50">
            Snapshot: inbox {lastCompletedReview.counters.inboxUnclarified}, missing actions{' '}
            {lastCompletedReview.counters.projectsMissingActions}, waiting follow-ups{' '}
            {lastCompletedReview.counters.waitingFollowUps}
          </p>
          <p className="m-0 text-sm text-emerald-50">
            Note: {lastCompletedReview.note || 'No intention note provided.'}
          </p>
        </article>
      ) : hasActiveReview ? (
        <div className="grid min-h-0 gap-3 md:grid-cols-[minmax(260px,320px)_1fr]">
          <ReviewStepper
            steps={REVIEW_STEPS}
            currentStep={currentStep}
            onStepSelect={onSetStep}
            completedStepIndexes={Array.from({ length: currentStep }, (_, index) => index)}
          />
          <article className="grid content-start gap-3 rounded-2xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3.5">
            <header className="grid gap-1">
              <p className="m-0 text-xs font-semibold tracking-[0.02em] text-slate-300">
                Step {currentStep + 1} of {REVIEW_STEPS.length}
              </p>
              <h3 className="m-0 text-base text-slate-100">{REVIEW_STEPS[currentStep].title}</h3>
            </header>
            {renderCurrentStepBody()}
            {completionError ? (
              <p className="m-0 rounded-xl border border-rose-400/40 bg-rose-400/12 px-3 py-2 text-sm text-rose-100">
                {completionError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-1.5 text-sm text-slate-200"
                type="button"
                onClick={onPreviousStep}
                disabled={currentStep === 0}
              >
                Previous
              </button>
              {!isFinalStep ? (
                <button
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={onNextStep}
                >
                  Next step
                </button>
              ) : (
                <button
                  className="cursor-pointer rounded-[10px] border border-emerald-400/55 bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-55"
                  type="button"
                  onClick={onCompleteReview}
                  disabled={isCompleteBlocked}
                >
                  Complete Weekly Review
                </button>
              )}
            </div>
          </article>
        </div>
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-5 text-center">
          <p className="m-0 max-w-[560px] text-sm text-slate-300">
            Start review to walk through all 7 GTD steps and complete integrity checks before
            closing the week.
          </p>
        </div>
      )}
    </section>
  )
}
