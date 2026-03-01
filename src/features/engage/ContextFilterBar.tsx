import type { Context } from '../../types/gtd'

interface ContextFilterBarProps {
  contexts: Context[]
  selectedContextId: string | null
  contextActiveNextActionCounts: Record<string, number>
  onSelectContext: (contextId: string | null) => void
  onCreateContext: (input: { name: string; description: string }) => boolean
  onUpdateContext: (contextId: string, input: { name: string; description: string }) => boolean
  onDeleteContext: (contextId: string) => boolean
}

export function ContextFilterBar({
  contexts,
  selectedContextId,
  contextActiveNextActionCounts,
  onSelectContext,
  onCreateContext,
  onUpdateContext,
  onDeleteContext,
}: ContextFilterBarProps) {
  const allContextsCount = Object.values(contextActiveNextActionCounts).reduce(
    (total, count) => total + count,
    0,
  )
  const selectedContext =
    selectedContextId === null
      ? null
      : contexts.find((context) => context.id === selectedContextId) ?? null

  function handleCreateContext() {
    const name = window.prompt('Название контекста (например, @office):')
    if (name === null) {
      return
    }

    const description = window.prompt('Описание контекста (опционально):') ?? ''
    const isCreated = onCreateContext({ name, description })
    if (!isCreated) {
      window.alert('Не удалось создать контекст. Проверьте название и уникальность.')
    }
  }

  function handleEditContext() {
    if (!selectedContext) {
      return
    }

    const name = window.prompt('Новое название контекста:', selectedContext.name)
    if (name === null) {
      return
    }

    const description =
      window.prompt('Описание контекста:', selectedContext.description) ??
      selectedContext.description
    const isUpdated = onUpdateContext(selectedContext.id, { name, description })
    if (!isUpdated) {
      window.alert('Не удалось обновить контекст. Проверьте название и уникальность.')
    }
  }

  function handleDeleteContext() {
    if (!selectedContext) {
      return
    }

    const shouldDelete = window.confirm(
      `Удалить контекст "${selectedContext.name}"? Связанные Next Actions будут перенесены в другой контекст.`,
    )
    if (!shouldDelete) {
      return
    }

    const isDeleted = onDeleteContext(selectedContext.id)
    if (!isDeleted) {
      window.alert('Нельзя удалить последний контекст.')
    }
  }

  return (
    <div
      className="grid min-h-0 content-start gap-3 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5"
      aria-label="Фильтр next actions по контексту"
    >
      <h3 className="m-0 text-sm font-semibold tracking-[0.02em] text-slate-200">Контексты</h3>
      <button
        className={`w-full cursor-pointer border px-3 py-2.5 text-left text-base font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px ${
          selectedContextId === null
            ? 'border-sky-400/60 bg-sky-400/18 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
            : 'border-slate-400/35 bg-slate-900/65 text-slate-300 hover:text-slate-100'
        }`}
        type="button"
        onClick={() => onSelectContext(null)}
      >
        All contexts ({allContextsCount})
      </button>

      <div className="grid min-h-0 content-start gap-2 overflow-y-auto pr-0.5">
        {contexts.map((context) => (
          <button
            key={context.id}
            className={`w-full cursor-pointer border px-3 py-2.5 text-left text-base font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px ${
              selectedContextId === context.id
                ? 'border-sky-400/60 bg-sky-400/18 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                : 'border-slate-400/35 bg-slate-900/65 text-slate-300 hover:text-slate-100'
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

      <div className="grid gap-2 border-t border-slate-700/80 pt-3">
        <button
          className="w-full cursor-pointer rounded-xl border border-emerald-400/55 bg-emerald-400/14 px-3 py-2 text-sm font-semibold text-emerald-200 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
          type="button"
          onClick={handleCreateContext}
        >
          + Контекст
        </button>
        <button
          className="w-full cursor-pointer rounded-xl border border-violet-400/55 bg-violet-400/14 px-3 py-2 text-sm font-semibold text-violet-200 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          onClick={handleEditContext}
          disabled={!selectedContext}
        >
          Изменить
        </button>
        <button
          className="w-full cursor-pointer rounded-xl border border-rose-400/60 bg-rose-400/14 px-3 py-2 text-sm font-semibold text-rose-200 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          onClick={handleDeleteContext}
          disabled={!selectedContext}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
