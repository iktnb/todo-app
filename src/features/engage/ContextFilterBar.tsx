import type { Context } from '../../types/gtd'

interface ContextFilterBarProps {
  contexts: Context[]
  selectedContextId: string | null
  contextActiveNextActionCounts: Record<string, number>
  onSelectContext: (contextId: string | null) => void
}

export function ContextFilterBar({
  contexts,
  selectedContextId,
  contextActiveNextActionCounts,
  onSelectContext,
}: ContextFilterBarProps) {
  const allContextsCount = Object.values(contextActiveNextActionCounts).reduce(
    (total, count) => total + count,
    0,
  )

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5"
      aria-label="Фильтр next actions по контексту"
    >
      <button
        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px ${
          selectedContextId === null
            ? 'border-sky-400/60 bg-sky-400/18 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
            : 'border-slate-400/35 bg-slate-900/65 text-slate-300'
        }`}
        type="button"
        onClick={() => onSelectContext(null)}
      >
        All contexts ({allContextsCount})
      </button>

      {contexts.map((context) => (
        <button
          key={context.id}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px ${
            selectedContextId === context.id
              ? 'border-sky-400/60 bg-sky-400/18 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
              : 'border-slate-400/35 bg-slate-900/65 text-slate-300'
          }`}
          type="button"
          onClick={() => onSelectContext(context.id)}
          aria-pressed={selectedContextId === context.id}
          title={context.description}
        >
          {context.name} ({contextActiveNextActionCounts[context.id] ?? 0})
        </button>
      ))}
    </div>
  )
}
