import { useEffect, useRef, useState } from "react";
import type {
  ClarifyDecisionState,
  ClarifyResult,
  Context,
  Item,
  TrashReason,
} from "../../types/gtd";
import {
  ClarifyOutcomeEnum,
  ClarifyWizardStepEnum,
  TrashReasonEnum,
} from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";
import { NeonSelect } from "../../../design-system/components";

interface ClarifyWizardProps {
  targetItem: Item | null;
  decisionState: ClarifyDecisionState;
  contexts: Context[];
  clarifyResult: ClarifyResult | null;
  onCancel: () => void;
  onDone: () => void;
  onSetStep: (step: ClarifyDecisionState["step"]) => void;
  onUpdateDecision: (partialDecision: Partial<ClarifyDecisionState>) => void;
  onApplyNextAction: (payload: {
    title?: string;
    contextId: string;
  }) => boolean;
  onApplyProject: (payload: { title: string; notes?: string }) => boolean;
  onApplySomeday: (payload: { notes?: string }) => boolean;
  onApplyTrash: (payload: { reason?: TrashReason }) => boolean;
}

export function ClarifyWizard({
  targetItem,
  decisionState,
  contexts,
  clarifyResult,
  onCancel,
  onDone,
  onSetStep,
  onUpdateDecision,
  onApplyNextAction,
  onApplyProject,
  onApplySomeday,
  onApplyTrash,
}: ClarifyWizardProps) {
  const { t } = useI18n();
  const contextOptions = contexts.map((context) => ({
    value: context.id,
    label: context.name,
  }));
  const outcomeLabel: Record<ClarifyResult["outcome"], string> = {
    [ClarifyOutcomeEnum.NextAction]: t("clarify.outcome.next_action"),
    [ClarifyOutcomeEnum.Project]: t("clarify.outcome.project"),
    [ClarifyOutcomeEnum.Someday]: t("clarify.outcome.someday"),
    [ClarifyOutcomeEnum.Trash]: t("clarify.outcome.trash"),
  };
  const [nextActionTitle, setNextActionTitle] = useState(
    () => targetItem?.title ?? "",
  );
  const [nextActionContextId, setNextActionContextId] = useState(
    () => contexts[0]?.id ?? "",
  );
  const [projectTitle, setProjectTitle] = useState(
    () => targetItem?.title ?? "",
  );
  const [projectNotes, setProjectNotes] = useState(
    () => targetItem?.notes ?? "",
  );
  const [somedayNotes, setSomedayNotes] = useState(
    () => targetItem?.notes ?? "",
  );
  const [applyError, setApplyError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [decisionState.step, targetItem, clarifyResult]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (decisionState.step === ClarifyWizardStepEnum.Confirm) {
          onDone();
          return;
        }

        onCancel();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [decisionState.step, onCancel, onDone]);

  const isConfirmStep = decisionState.step === ClarifyWizardStepEnum.Confirm;
  const shouldRender =
    targetItem !== null || (isConfirmStep && clarifyResult !== null);

  if (!shouldRender) {
    return null;
  }

  function handleApplyNextAction() {
    const resolvedContextId = nextActionContextId || contexts[0]?.id;
    if (!resolvedContextId) {
      setApplyError(t("clarify.error.needContext"));
      return;
    }

    const isApplied = onApplyNextAction({
      title: nextActionTitle.trim() || undefined,
      contextId: resolvedContextId,
    });
    if (!isApplied) {
      setApplyError(t("clarify.error.createNextAction"));
      return;
    }

    setApplyError(null);
  }

  function handleApplyProject() {
    const normalizedProjectTitle = projectTitle.trim();
    if (!normalizedProjectTitle) {
      setApplyError(t("clarify.error.projectTitle"));
      return;
    }

    const isApplied = onApplyProject({
      title: normalizedProjectTitle,
      notes: projectNotes.trim() || undefined,
    });
    if (!isApplied) {
      setApplyError(t("clarify.error.createProject"));
      return;
    }

    setApplyError(null);
  }

  function handleApplySomeday() {
    const isApplied = onApplySomeday({
      notes: somedayNotes.trim() || undefined,
    });
    if (!isApplied) {
      setApplyError(t("clarify.error.moveSomeday"));
      return;
    }

    setApplyError(null);
  }

  function handleApplyTrash() {
    const isApplied = onApplyTrash({ reason: TrashReasonEnum.Irrelevant });
    if (!isApplied) {
      setApplyError(t("clarify.error.moveTrash"));
      return;
    }

    setApplyError(null);
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 px-4 py-6"
      role="presentation"
    >
      <section
        className="w-full max-w-xl rounded-2xl border border-slate-400/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.6)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clarify-wizard-title"
      >
        <header className="mb-3">
          <h2 id="clarify-wizard-title" className="m-0 text-lg text-slate-100">
            {t("clarify.title")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-slate-300">
            {targetItem
              ? t("clarify.item", { title: targetItem.title })
              : t("clarify.resultTitle")}
          </p>
        </header>

        {decisionState.step === ClarifyWizardStepEnum.Actionable &&
          targetItem && (
            <div className="grid gap-3">
              <p className="m-0 text-slate-200">{t("clarify.actionable")}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  ref={initialFocusRef}
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={() => {
                    onUpdateDecision({ actionable: true, oneStep: undefined });
                    onSetStep(ClarifyWizardStepEnum.OneStep);
                  }}
                >
                  {t("clarify.yes")}
                </button>
                <button
                  className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/14 px-3 py-2 text-sm font-semibold text-violet-200"
                  type="button"
                  onClick={() => {
                    onUpdateDecision({ actionable: false, oneStep: undefined });
                    onSetStep(ClarifyWizardStepEnum.NonActionable);
                  }}
                >
                  {t("clarify.no")}
                </button>
              </div>
            </div>
          )}

        {decisionState.step === ClarifyWizardStepEnum.OneStep && targetItem && (
          <div className="grid gap-3">
            <p className="m-0 text-slate-200">{t("clarify.oneStep")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                ref={initialFocusRef}
                className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: true, oneStep: true });
                  onSetStep(ClarifyWizardStepEnum.NextActionDetails);
                }}
              >
                {t("clarify.yes")}
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/14 px-3 py-2 text-sm font-semibold text-violet-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: true, oneStep: false });
                  onSetStep(ClarifyWizardStepEnum.ProjectDetails);
                }}
              >
                {t("clarify.no")}
              </button>
            </div>
            <button
              className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
              type="button"
              onClick={() => onSetStep(ClarifyWizardStepEnum.Actionable)}
            >
              {t("clarify.back")}
            </button>
          </div>
        )}

        {decisionState.step === ClarifyWizardStepEnum.NonActionable &&
          targetItem && (
            <div className="grid gap-3">
              <p className="m-0 text-slate-200">
                {t("clarify.nonActionableDestination")}
              </p>
              <div className="grid gap-2">
                <label
                  className="grid gap-1 text-sm text-slate-200"
                  htmlFor="clarify-someday-notes"
                >
                  {t("clarify.somedayNotes")}
                  <textarea
                    id="clarify-someday-notes"
                    className="min-h-20 w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                    value={somedayNotes}
                    onChange={(event) => setSomedayNotes(event.target.value)}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  ref={initialFocusRef}
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={handleApplySomeday}
                >
                  {t("clarify.someday")}
                </button>
                <button
                  className="cursor-pointer rounded-[10px] border border-rose-400/60 bg-rose-400/15 px-3 py-2 text-sm font-semibold text-rose-200"
                  type="button"
                  onClick={handleApplyTrash}
                >
                  {t("clarify.trash")}
                </button>
              </div>
              <button
                className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => onSetStep(ClarifyWizardStepEnum.Actionable)}
              >
                {t("clarify.back")}
              </button>
            </div>
          )}

        {decisionState.step === ClarifyWizardStepEnum.NextActionDetails &&
          targetItem && (
            <div className="grid gap-3">
              <label
                className="grid gap-1 text-sm text-slate-200"
                htmlFor="clarify-next-action-title"
              >
                {t("clarify.nextActionTitle")}
                <input
                  id="clarify-next-action-title"
                  className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                  type="text"
                  value={nextActionTitle}
                  onChange={(event) => setNextActionTitle(event.target.value)}
                />
              </label>
              <label
                className="grid gap-1 text-sm text-slate-200"
                htmlFor="clarify-next-action-context"
              >
                {t("clarify.context")}
                <NeonSelect<string>
                  id="clarify-next-action-context"
                  className="w-full"
                  buttonClassName="py-2 text-sm"
                  value={nextActionContextId}
                  onChange={setNextActionContextId}
                  options={contextOptions}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  ref={initialFocusRef}
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={handleApplyNextAction}
                >
                  {t("clarify.createNextAction")}
                </button>
                <button
                  className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                  type="button"
                  onClick={() => onSetStep(ClarifyWizardStepEnum.OneStep)}
                >
                  {t("clarify.back")}
                </button>
              </div>
            </div>
          )}

        {decisionState.step === ClarifyWizardStepEnum.ProjectDetails &&
          targetItem && (
            <div className="grid gap-3">
              <label
                className="grid gap-1 text-sm text-slate-200"
                htmlFor="clarify-project-title"
              >
                {t("clarify.projectTitle")}
                <input
                  id="clarify-project-title"
                  className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                  type="text"
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                />
              </label>
              <label
                className="grid gap-1 text-sm text-slate-200"
                htmlFor="clarify-project-notes"
              >
                {t("clarify.notesOptional")}
                <textarea
                  id="clarify-project-notes"
                  className="min-h-20 w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                  value={projectNotes}
                  onChange={(event) => setProjectNotes(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  ref={initialFocusRef}
                  className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                  type="button"
                  onClick={handleApplyProject}
                >
                  {t("clarify.createProject")}
                </button>
                <button
                  className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                  type="button"
                  onClick={() => onSetStep(ClarifyWizardStepEnum.OneStep)}
                >
                  {t("clarify.back")}
                </button>
              </div>
            </div>
          )}

        {decisionState.step === ClarifyWizardStepEnum.Confirm &&
          clarifyResult && (
            <div className="grid gap-3">
              <p className="m-0 text-slate-200">
                {t("clarify.confirm", {
                  itemTitle: clarifyResult.itemTitle,
                  outcomeLabel: outcomeLabel[clarifyResult.outcome],
                })}
              </p>
              <button
                ref={initialFocusRef}
                className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                type="button"
                onClick={onDone}
              >
                {t("clarify.close")}
              </button>
            </div>
          )}

        {applyError && (
          <p className="mt-3 mb-0 text-sm text-rose-300">{applyError}</p>
        )}

        {decisionState.step !== ClarifyWizardStepEnum.Confirm && (
          <div className="mt-3 border-t border-slate-700/80 pt-3">
            <button
              className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
              type="button"
              onClick={onCancel}
            >
              {t("clarify.cancel")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
