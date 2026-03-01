import { useEffect, useRef, useState } from 'react'
import type { ClarifyDecisionState, ClarifyResult, Context, Item } from '../../types/gtd'

interface ClarifyWizardProps {
  targetItem: Item | null
  decisionState: ClarifyDecisionState
  contexts: Context[]
  clarifyResult: ClarifyResult | null
  onCancel: () => void
  onDone: () => void
  onSetStep: (step: ClarifyDecisionState['step']) => void
  onUpdateDecision: (partialDecision: Partial<ClarifyDecisionState>) => void
  onApplyNextAction: (payload: { title?: string; contextId: string }) => boolean
  onApplyProject: (payload: { title: string; notes?: string }) => boolean
  onApplySomeday: (payload: { notes?: string }) => boolean
  onApplyTrash: (payload: { reason?: 'irrelevant' | 'duplicate' | 'no_longer_needed' }) => boolean
}

const OUTCOME_LABEL: Record<ClarifyResult['outcome'], string> = {
  next_action: 'Next Action',
  project: 'Project',
  someday: 'Someday',
  trash: 'Trash',
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
  const [nextActionTitle, setNextActionTitle] = useState(() => targetItem?.title ?? '')
  const [nextActionContextId, setNextActionContextId] = useState(() => contexts[0]?.id ?? '')
  const [projectTitle, setProjectTitle] = useState(() => targetItem?.title ?? '')
  const [projectNotes, setProjectNotes] = useState(() => targetItem?.notes ?? '')
  const [somedayNotes, setSomedayNotes] = useState(() => targetItem?.notes ?? '')
  const [applyError, setApplyError] = useState<string | null>(null)
  const initialFocusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    initialFocusRef.current?.focus()
  }, [decisionState.step, targetItem, clarifyResult])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (decisionState.step === 'confirm') {
          onDone()
          return
        }

        onCancel()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [decisionState.step, onCancel, onDone])

  const isConfirmStep = decisionState.step === 'confirm'
  const shouldRender = targetItem !== null || (isConfirmStep && clarifyResult !== null)

  if (!shouldRender) {
    return null
  }

  function handleApplyNextAction() {
    const resolvedContextId = nextActionContextId || contexts[0]?.id
    if (!resolvedContextId) {
      setApplyError('Нужен хотя бы один context для Next Action.')
      return
    }

    const isApplied = onApplyNextAction({
      title: nextActionTitle.trim() || undefined,
      contextId: resolvedContextId,
    })
    if (!isApplied) {
      setApplyError('Не удалось создать Next Action. Проверьте данные и попробуйте снова.')
      return
    }

    setApplyError(null)
  }

  function handleApplyProject() {
    const normalizedProjectTitle = projectTitle.trim()
    if (!normalizedProjectTitle) {
      setApplyError('Укажите название проекта.')
      return
    }

    const isApplied = onApplyProject({
      title: normalizedProjectTitle,
      notes: projectNotes.trim() || undefined,
    })
    if (!isApplied) {
      setApplyError('Не удалось создать Project. Проверьте данные и попробуйте снова.')
      return
    }

    setApplyError(null)
  }

  function handleApplySomeday() {
    const isApplied = onApplySomeday({
      notes: somedayNotes.trim() || undefined,
    })
    if (!isApplied) {
      setApplyError('Не удалось переместить item в Someday.')
      return
    }

    setApplyError(null)
  }

  function handleApplyTrash() {
    const isApplied = onApplyTrash({ reason: 'irrelevant' })
    if (!isApplied) {
      setApplyError('Не удалось удалить item из Inbox.')
      return
    }

    setApplyError(null)
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
            Clarify Wizard
          </h2>
          <p className="mt-1 mb-0 text-sm text-slate-300">
            {targetItem ? `Item: ${targetItem.title}` : 'Результат уточнения'}
          </p>
        </header>

        {decisionState.step === 'actionable' && targetItem && (
          <div className="grid gap-3">
            <p className="m-0 text-slate-200">Это actionable?</p>
            <div className="flex flex-wrap gap-2">
              <button
                ref={initialFocusRef}
                className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: true, oneStep: undefined })
                  onSetStep('one_step')
                }}
              >
                Yes
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/14 px-3 py-2 text-sm font-semibold text-violet-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: false, oneStep: undefined })
                  onSetStep('non_actionable')
                }}
              >
                No
              </button>
            </div>
          </div>
        )}

        {decisionState.step === 'one_step' && targetItem && (
          <div className="grid gap-3">
            <p className="m-0 text-slate-200">Это one-step?</p>
            <div className="flex flex-wrap gap-2">
              <button
                ref={initialFocusRef}
                className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: true, oneStep: true })
                  onSetStep('next_action_details')
                }}
              >
                Yes
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/14 px-3 py-2 text-sm font-semibold text-violet-200"
                type="button"
                onClick={() => {
                  onUpdateDecision({ actionable: true, oneStep: false })
                  onSetStep('project_details')
                }}
              >
                No
              </button>
            </div>
            <button
              className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
              type="button"
              onClick={() => onSetStep('actionable')}
            >
              Back
            </button>
          </div>
        )}

        {decisionState.step === 'non_actionable' && targetItem && (
          <div className="grid gap-3">
            <p className="m-0 text-slate-200">Куда отправить не-actionable item?</p>
            <div className="grid gap-2">
              <label className="grid gap-1 text-sm text-slate-200" htmlFor="clarify-someday-notes">
                Notes for Someday (optional)
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
                Someday
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-rose-400/60 bg-rose-400/15 px-3 py-2 text-sm font-semibold text-rose-200"
                type="button"
                onClick={handleApplyTrash}
              >
                Trash
              </button>
            </div>
            <button
              className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
              type="button"
              onClick={() => onSetStep('actionable')}
            >
              Back
            </button>
          </div>
        )}

        {decisionState.step === 'next_action_details' && targetItem && (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-slate-200" htmlFor="clarify-next-action-title">
              Next Action title
              <input
                id="clarify-next-action-title"
                className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                type="text"
                value={nextActionTitle}
                onChange={(event) => setNextActionTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-200" htmlFor="clarify-next-action-context">
              Context
              <select
                id="clarify-next-action-context"
                className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                value={nextActionContextId}
                onChange={(event) => setNextActionContextId(event.target.value)}
              >
                {contexts.map((context) => (
                  <option key={context.id} value={context.id}>
                    {context.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                ref={initialFocusRef}
                className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
                type="button"
                onClick={handleApplyNextAction}
              >
                Create Next Action
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => onSetStep('one_step')}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {decisionState.step === 'project_details' && targetItem && (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-slate-200" htmlFor="clarify-project-title">
              Project title
              <input
                id="clarify-project-title"
                className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-400/90 focus:outline-none"
                type="text"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-200" htmlFor="clarify-project-notes">
              Notes (optional)
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
                Create Project
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => onSetStep('one_step')}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {decisionState.step === 'confirm' && clarifyResult && (
          <div className="grid gap-3">
            <p className="m-0 text-slate-200">
              Item "{clarifyResult.itemTitle}" обработан как {OUTCOME_LABEL[clarifyResult.outcome]}.
            </p>
            <button
              ref={initialFocusRef}
              className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
              type="button"
              onClick={onDone}
            >
              Close
            </button>
          </div>
        )}

        {applyError && <p className="mt-3 mb-0 text-sm text-rose-300">{applyError}</p>}

        {decisionState.step !== 'confirm' && (
          <div className="mt-3 border-t border-slate-700/80 pt-3">
            <button
              className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
