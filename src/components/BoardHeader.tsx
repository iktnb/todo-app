import { useEffect, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { ITEM_TITLE_MAX_LENGTH } from '../constants/validation'

interface BackupActionResult {
  ok: boolean
  message: string
}

interface BoardHeaderProps {
  onResetLocalData: () => void
  onOpenGuide: () => void
  onCopyEncryptedBackup: () => Promise<BackupActionResult>
  onImportEncryptedBackup: (serialized: string) => Promise<BackupActionResult>
  taskInput: string
  setTaskInput: Dispatch<SetStateAction<string>>
  onCaptureItem: (event: FormEvent<HTMLFormElement>) => void
}

export function BoardHeader({
  onResetLocalData,
  onOpenGuide,
  onCopyEncryptedBackup,
  onImportEncryptedBackup,
  taskInput,
  setTaskInput,
  onCaptureItem,
}: BoardHeaderProps) {
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [isBackupPending, setIsBackupPending] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    if (!isSettingsOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isSettingsOpen])

  function handleResetClick() {
    const shouldReset = window.confirm(
      'Сбросить локальные данные доски? Это удалит все пользовательские столбики и задачи.',
    )

    if (!shouldReset) {
      return
    }

    onResetLocalData()
  }

  async function handleCopyBackupClick() {
    setIsBackupPending(true)
    const result = await onCopyEncryptedBackup()
    setBackupStatus(result.message)
    setIsBackupPending(false)
  }

  async function handlePasteBackupClick() {
    const backupText = window.prompt('Вставьте зашифрованный backup состояния:')
    if (backupText === null) {
      return
    }

    setIsBackupPending(true)
    const result = await onImportEncryptedBackup(backupText)
    setBackupStatus(result.message)
    setIsBackupPending(false)
  }

  return (
    <header className="mx-auto w-full max-w-6xl rounded-xl border border-sky-400/25 bg-[linear-gradient(155deg,rgba(17,24,39,0.95),rgba(15,23,42,0.92))] px-3 py-2.5 shadow-[0_0_16px_rgba(56,189,248,0.12),0_0_28px_rgba(56,189,248,0.06)] max-md:px-2.5 max-md:py-2">
      <div className="grid items-center gap-2 md:grid-cols-[1fr_minmax(360px,760px)_1fr]">
        <div className="hidden md:block" aria-hidden="true" />
        <form
          className="grid w-full grid-cols-[1fr_auto] gap-2 max-sm:grid-cols-1"
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
            className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/12 px-4 py-2.5 text-base font-semibold text-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px max-sm:w-full"
            type="submit"
          >
            + Inbox
          </button>
        </form>
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/14 px-3 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Открыть настройки"
            title="Настройки"
          >
            <span aria-hidden="true" className="block">
              <svg
                viewBox="0 0 24 24"
                className="h-[16px] w-[16px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.34 2.8a1 1 0 0 1 1.32-.16l.66.53a1 1 0 0 0 1.03.14l.79-.34a1 1 0 0 1 1.28.45l.44.75a1 1 0 0 0 .9.52h.85a1 1 0 0 1 1 .88l.1.87a1 1 0 0 0 .63.84l.8.31a1 1 0 0 1 .58 1.22l-.24.84a1 1 0 0 0 .24 1.01l.6.64a1 1 0 0 1 0 1.35l-.6.64a1 1 0 0 0-.24 1.01l.24.84a1 1 0 0 1-.58 1.22l-.8.31a1 1 0 0 0-.63.84l-.1.87a1 1 0 0 1-1 .88h-.85a1 1 0 0 0-.9.52l-.44.75a1 1 0 0 1-1.28.45l-.79-.34a1 1 0 0 0-1.03.14l-.66.53a1 1 0 0 1-1.32-.16l-.55-.68a1 1 0 0 0-.97-.35l-.85.17a1 1 0 0 1-1.15-.7l-.24-.84a1 1 0 0 0-.73-.74l-.84-.24a1 1 0 0 1-.7-1.15l.17-.85a1 1 0 0 0-.35-.97l-.68-.55a1 1 0 0 1-.16-1.32l.53-.66a1 1 0 0 0 .14-1.03l-.34-.79a1 1 0 0 1 .45-1.28l.75-.44a1 1 0 0 0 .52-.9v-.85a1 1 0 0 1 .88-1l.87-.1a1 1 0 0 0 .84-.63l.31-.8a1 1 0 0 1 1.22-.58l.84.24a1 1 0 0 0 1.01-.24l.64-.6ZM12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                />
              </svg>
            </span>
          </button>
          <button
            className="cursor-pointer rounded-[10px] border border-violet-400/50 bg-violet-400/14 px-3.5 py-2 text-sm font-semibold text-violet-200 shadow-[0_0_12px_rgba(167,139,250,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={onOpenGuide}
          >
            Руководство
          </button>
        </div>
      </div>
      {isSettingsOpen ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 px-4 py-6"
          role="presentation"
          onClick={() => setIsSettingsOpen(false)}
        >
          <section
            className="w-full max-w-md rounded-2xl border border-slate-400/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.6)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-3">
              <h2 id="settings-modal-title" className="m-0 text-lg text-slate-100">
                Настройки
              </h2>
              <p className="mt-1 mb-0 text-sm text-slate-300">
                Управление бэкапом и локальными данными.
              </p>
            </header>
            <div className="grid gap-2">
              <button
                className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/14 px-3 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
                type="button"
                onClick={() => void handleCopyBackupClick()}
                disabled={isBackupPending}
              >
                Скопировать backup
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.15)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
                type="button"
                onClick={() => void handlePasteBackupClick()}
                disabled={isBackupPending}
              >
                Вставить backup
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-rose-400/50 bg-rose-400/14 px-3 py-2 text-sm font-semibold text-rose-200 shadow-[0_0_12px_rgba(251,113,133,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                type="button"
                onClick={handleResetClick}
              >
                Сбросить локальные данные
              </button>
            </div>
            {backupStatus ? (
              <p className="mt-3 mb-0 text-xs text-cyan-200/90">{backupStatus}</p>
            ) : null}
            <div className="mt-3 border-t border-slate-700/80 pt-3">
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => setIsSettingsOpen(false)}
              >
                Закрыть
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  )
}
