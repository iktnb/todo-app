import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { ITEM_TITLE_MAX_LENGTH } from '../constants/validation'

interface BoardHeaderProps {
  onResetLocalData: () => void
  onOpenGuide: () => void
  taskInput: string
  setTaskInput: Dispatch<SetStateAction<string>>
  onCaptureItem: (event: FormEvent<HTMLFormElement>) => void
  inboxItemsCount: number
}

export function BoardHeader({
  onResetLocalData,
  onOpenGuide,
  taskInput,
  setTaskInput,
  onCaptureItem,
  inboxItemsCount,
}: BoardHeaderProps) {
  function handleResetClick() {
    const shouldReset = window.confirm(
      'Сбросить локальные данные доски? Это удалит все пользовательские столбики и задачи.',
    )

    if (!shouldReset) {
      return
    }

    onResetLocalData()
  }

  return (
    <header className="rounded-xl border border-sky-400/25 bg-[linear-gradient(155deg,rgba(17,24,39,0.95),rgba(15,23,42,0.92))] p-3.5 shadow-[0_0_16px_rgba(56,189,248,0.12),0_0_28px_rgba(56,189,248,0.06)] max-md:p-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h1 className="m-0 text-[clamp(1.15rem,1.7vw,1.4rem)] tracking-[0.02em] text-slate-100">
          Task Board
        </h1>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-sky-400/45 bg-sky-400/15 px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-sky-300">
            Inbox items: {inboxItemsCount}
          </span>
          <span className="rounded-full border border-emerald-400/45 bg-emerald-400/15 px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-emerald-300">
            MVP Foundation
          </span>
          <button
            className="cursor-pointer rounded-[9px] border border-violet-400/50 bg-violet-400/14 px-2.5 py-1 text-[11px] font-semibold text-violet-200 shadow-[0_0_12px_rgba(167,139,250,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={onOpenGuide}
          >
            Руководство
          </button>
          <button
            className="cursor-pointer rounded-[9px] border border-rose-400/50 bg-rose-400/14 px-2.5 py-1 text-[11px] font-semibold text-rose-200 shadow-[0_0_12px_rgba(251,113,133,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={handleResetClick}
          >
            Сбросить локальные данные
          </button>
        </div>
      </div>
      <form
        className="mt-2 grid w-full max-w-2xl grid-cols-[1fr_auto] gap-2 mx-auto"
        onSubmit={onCaptureItem}
      >
        <input
          className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-3 py-2 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out placeholder:text-slate-400 focus:border-sky-400/90 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.22)] focus:outline-none"
          type="text"
          value={taskInput}
          onChange={(event) => setTaskInput(event.target.value)}
          maxLength={ITEM_TITLE_MAX_LENGTH}
          placeholder="Быстрый capture в Inbox из любого режима..."
          aria-label="Быстрый capture item в Inbox"
        />
        <button
          className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/12 px-3 py-2 text-sm font-semibold text-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
          type="submit"
        >
          + Inbox
        </button>
      </form>
    </header>
  )
}
