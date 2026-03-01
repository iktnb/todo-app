import type { Context, NextAction } from '../../types/gtd'

interface NextActionListProps {
  nextActions: NextAction[]
  contextsById: Map<string, Context>
  selectedContextLabel: string
  onMarkDone: (nextActionId: string) => void
}

export function NextActionList({
  nextActions,
  contextsById,
  selectedContextLabel,
  onMarkDone,
}: NextActionListProps) {
  if (nextActions.length === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-5 text-center">
        <div className="max-w-[420px]">
          <h2 className="mt-0 mb-2 text-lg text-slate-100">Нет активных действий</h2>
          <p className="m-0 text-sm text-slate-300">
            В контексте <span className="font-semibold text-sky-200">{selectedContextLabel}</span>{' '}
            пока нет активных next actions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-2.5">
      {nextActions.map((nextAction) => {
        const context = contextsById.get(nextAction.contextId)

        return (
          <article
            key={nextAction.id}
            className="grid gap-2 rounded-xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border border-sky-400/45 bg-sky-400/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] text-sky-200">
                {context?.name ?? 'Unknown context'}
              </span>
              <button
                className="cursor-pointer rounded-[10px] border border-emerald-400/50 bg-emerald-400/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                type="button"
                onClick={() => onMarkDone(nextAction.id)}
              >
                Done
              </button>
            </div>
            <p className="m-0 text-[0.98rem] text-slate-100">{nextAction.title}</p>
            {nextAction.notes ? (
              <p className="m-0 text-sm leading-[1.35] text-slate-300">{nextAction.notes}</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
