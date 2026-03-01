import { ReviewStepper } from "../../../design-system/components/ReviewStepper";
import type { Project, WeeklyReviewSnapshot } from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";

type AppMode = "board" | "engage" | "projects" | "review";

interface ReviewCounters {
  inboxUnclarified: number;
  projectsMissingActions: number;
  waitingFollowUps: number;
}

interface WeeklyReviewViewProps {
  currentStep: number;
  reviewStartedAt: string | null;
  reviewNote: string;
  reviewCounters: ReviewCounters;
  projectsWithoutNextAction: Project[];
  somedayItemsCount: number;
  completedActionsCount: number;
  completedProjectsCount: number;
  isCompleteBlocked: boolean;
  completionError: string | null;
  lastCompletedReview: WeeklyReviewSnapshot | null;
  onStartReview: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSetStep: (nextStep: number) => void;
  onCompleteReview: () => void;
  onUpdateReviewNote: (note: string) => void;
  onNavigate: (mode: AppMode) => void;
}

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
  const { t } = useI18n();
  const reviewSteps = [
    {
      id: "empty-inbox",
      title: t("review.steps.emptyInbox.title"),
      description: t("review.steps.emptyInbox.description"),
    },
    {
      id: "check-projects",
      title: t("review.steps.checkProjects.title"),
      description: t("review.steps.checkProjects.description"),
    },
    {
      id: "ensure-next-action",
      title: t("review.steps.ensureNextAction.title"),
      description: t("review.steps.ensureNextAction.description"),
    },
    {
      id: "review-waiting-for",
      title: t("review.steps.waitingFor.title"),
      description: t("review.steps.waitingFor.description"),
    },
    {
      id: "clean-someday",
      title: t("review.steps.cleanSomeday.title"),
      description: t("review.steps.cleanSomeday.description"),
    },
    {
      id: "close-loops",
      title: t("review.steps.closeLoops.title"),
      description: t("review.steps.closeLoops.description"),
    },
    {
      id: "set-intention",
      title: t("review.steps.setIntention.title"),
      description: t("review.steps.setIntention.description"),
    },
  ];
  const hasActiveReview = reviewStartedAt !== null;
  const isFinalStep = currentStep === reviewSteps.length - 1;

  function renderCurrentStepBody() {
    if (currentStep === 0) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            {t("review.inboxUnclarified", {
              count: reviewCounters.inboxUnclarified,
            })}
          </p>
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
            type="button"
            onClick={() => onNavigate("board")}
          >
            {t("review.goInbox")}
          </button>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            {t("review.projectsNeedAttention", {
              count: projectsWithoutNextAction.length,
            })}
          </p>
          {projectsWithoutNextAction.length > 0 ? (
            <ul className="m-0 grid gap-1 pl-5 text-sm text-amber-200">
              {projectsWithoutNextAction.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-emerald-200">
              {t("review.allProjectsHealthy")}
            </p>
          )}
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/15 px-3 py-1.5 text-sm font-semibold text-violet-200"
            type="button"
            onClick={() => onNavigate("projects")}
          >
            {t("review.openProjectView")}
          </button>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-slate-300">
            {t("review.projectsWithoutAction", {
              count: reviewCounters.projectsMissingActions,
            })}
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
              {t("review.ruleSatisfied")}
            </p>
          )}
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/15 px-3 py-1.5 text-sm font-semibold text-violet-200"
            type="button"
            onClick={() => onNavigate("projects")}
          >
            {t("review.fixInProjects")}
          </button>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <p className="m-0 text-sm text-slate-300">
          {t("review.waitingFollowUps", {
            count: reviewCounters.waitingFollowUps,
          })}
        </p>
      );
    }

    if (currentStep === 4) {
      return (
        <p className="m-0 text-sm text-slate-300">
          {t("review.somedaySize", { count: somedayItemsCount })}
        </p>
      );
    }

    if (currentStep === 5) {
      return (
        <p className="m-0 text-sm text-slate-300">
          {t("review.closedLoops", {
            actions: completedActionsCount,
            projects: completedProjectsCount,
          })}
        </p>
      );
    }

    return (
      <div className="grid gap-2">
        <label
          className="text-sm font-semibold text-slate-200"
          htmlFor="weekly-review-note"
        >
          {t("review.intentionLabel")}
        </label>
        <textarea
          id="weekly-review-note"
          className="min-h-[110px] w-full rounded-xl border border-slate-400/35 bg-slate-900/75 px-3 py-2 text-sm text-slate-100"
          value={reviewNote}
          onChange={(event) => onUpdateReviewNote(event.target.value)}
          placeholder={t("review.intentionPlaceholder")}
        />
      </div>
    );
  }

  return (
    <section
      className="mt-5 grid min-h-0 grid-rows-[auto_1fr] gap-3 overflow-y-auto pr-1 max-md:pr-0"
      tabIndex={0}
      onKeyDown={(event) => {
        if (!hasActiveReview) {
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onNextStep();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onPreviousStep();
        }
      }}
      aria-label={t("review.aria")}
    >
      <header className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-lg text-slate-100">{t("review.title")}</h2>
          {reviewStartedAt ? (
            <p className="m-0 text-xs text-slate-300">
              {t("review.startedAt", {
                date: new Date(reviewStartedAt).toLocaleString(),
              })}
            </p>
          ) : null}
        </div>
        {!hasActiveReview ? (
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
            type="button"
            onClick={onStartReview}
          >
            {t("review.startButton")}
          </button>
        ) : null}
      </header>

      {!hasActiveReview && lastCompletedReview ? (
        <article className="grid gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-3.5">
          <h3 className="m-0 text-base text-emerald-100">
            {t("review.completedTitle")}
          </h3>
          <p className="m-0 text-sm text-emerald-50">
            {t("review.completedAt", {
              date: new Date(lastCompletedReview.completedAt).toLocaleString(),
            })}
          </p>
          <p className="m-0 text-sm text-emerald-50">
            {t("review.snapshot", {
              inbox: lastCompletedReview.counters.inboxUnclarified,
              missing: lastCompletedReview.counters.projectsMissingActions,
              waiting: lastCompletedReview.counters.waitingFollowUps,
            })}
          </p>
          <p className="m-0 text-sm text-emerald-50">
            {t("review.note", {
              note: lastCompletedReview.note || t("review.noteFallback"),
            })}
          </p>
        </article>
      ) : hasActiveReview ? (
        <div className="grid min-h-0 gap-3 md:grid-cols-[minmax(260px,320px)_1fr]">
          <ReviewStepper
            steps={reviewSteps}
            currentStep={currentStep}
            onStepSelect={onSetStep}
            completedStepIndexes={Array.from(
              { length: currentStep },
              (_, index) => index,
            )}
            labels={{
              listAria: t("stepper.aria"),
              stepAria: (index, title) =>
                t("stepper.stepAria", { step: index + 1, title }),
            }}
          />
          <article className="grid content-start gap-3 rounded-2xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3.5">
            <header className="grid gap-1">
              <p className="m-0 text-xs font-semibold tracking-[0.02em] text-slate-300">
                {t("review.stepIndicator", {
                  current: currentStep + 1,
                  total: reviewSteps.length,
                })}
              </p>
              <h3 className="m-0 text-base text-slate-100">
                {reviewSteps[currentStep].title}
              </h3>
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
                {t("review.previous")}
              </button>
              {!isFinalStep ? (
                <button
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={onNextStep}
                >
                  {t("review.next")}
                </button>
              ) : (
                <button
                  className="cursor-pointer rounded-[10px] border border-emerald-400/55 bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-55"
                  type="button"
                  onClick={onCompleteReview}
                  disabled={isCompleteBlocked}
                >
                  {t("review.complete")}
                </button>
              )}
            </div>
          </article>
        </div>
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-5 text-center">
          <p className="m-0 max-w-[560px] text-sm text-slate-300">
            {t("review.startHint")}
          </p>
        </div>
      )}
    </section>
  );
}
