import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ITEM_TITLE_MAX_LENGTH } from "../constants/validation";
import { useI18n } from "../i18n/useI18n";

interface BackupActionResult {
  ok: boolean;
  message: string;
}

interface BoardHeaderProps {
  onResetLocalData: () => void;
  onOpenGuide: () => void;
  onCopyEncryptedBackup: () => Promise<BackupActionResult>;
  onImportEncryptedBackup: (serialized: string) => Promise<BackupActionResult>;
  taskInput: string;
  setTaskInput: Dispatch<SetStateAction<string>>;
  onCaptureItem: (event: FormEvent<HTMLFormElement>) => void;
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
  const { locale, setLocale, t } = useI18n();
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isBackupPending, setIsBackupPending] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSettingsOpen]);

  function handleResetClick() {
    const shouldReset = window.confirm(t("header.settings.resetConfirm"));

    if (!shouldReset) {
      return;
    }

    onResetLocalData();
  }

  async function handleCopyBackupClick() {
    setIsBackupPending(true);
    const result = await onCopyEncryptedBackup();
    setBackupStatus(result.message);
    setIsBackupPending(false);
  }

  async function handlePasteBackupClick() {
    const backupText = window.prompt(t("header.settings.backupPrompt"));
    if (backupText === null) {
      return;
    }

    setIsBackupPending(true);
    const result = await onImportEncryptedBackup(backupText);
    setBackupStatus(result.message);
    setIsBackupPending(false);
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
            placeholder={t("header.quickCapturePlaceholder")}
            aria-label={t("header.quickCaptureAria")}
          />
          <button
            className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/12 px-4 py-2.5 text-base font-semibold text-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px max-sm:w-full"
            type="submit"
          >
            {t("header.quickCaptureSubmit")}
          </button>
        </form>
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-cyan-200/90 transition-[color,transform,background-color] duration-200 ease-in-out hover:-translate-y-px hover:bg-cyan-400/14 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-65"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label={t("header.openSettings")}
            title={t("header.settingsTitle")}
          >
            <span aria-hidden="true" className="block">
              <svg
                viewBox="0 0 24 24"
                className="h-[22px] w-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 3.34c.48-1.44 2.52-1.44 3 0a1.58 1.58 0 0 0 2.37.88c1.29-.77 2.73.67 1.96 1.96a1.58 1.58 0 0 0 .88 2.37c1.44.48 1.44 2.52 0 3a1.58 1.58 0 0 0-.88 2.37c.77 1.29-.67 2.73-1.96 1.96a1.58 1.58 0 0 0-2.37.88c-.48 1.44-2.52 1.44-3 0a1.58 1.58 0 0 0-2.37-.88c-1.29.77-2.73-.67-1.96-1.96a1.58 1.58 0 0 0-.88-2.37c-1.44-.48-1.44-2.52 0-3a1.58 1.58 0 0 0 .88-2.37c-.77-1.29.67-2.73 1.96-1.96a1.58 1.58 0 0 0 2.37-.88ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3.47 1.61a4.5 4.5 0 1 0-7.5-3.22 4.5 4.5 0 0 0 7.5 3.22Z"
                />
              </svg>
            </span>
          </button>
          <button
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-violet-200/90 transition-[color,transform,background-color] duration-200 ease-in-out hover:-translate-y-px hover:bg-violet-400/14 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
            type="button"
            onClick={onOpenGuide}
            aria-label={t("header.openGuide")}
            title={t("header.openGuide")}
          >
            <span aria-hidden="true" className="block">
              <svg
                viewBox="0 0 24 24"
                className="h-[20px] w-[20px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2.5-3 4M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
                />
              </svg>
            </span>
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
              <h2
                id="settings-modal-title"
                className="m-0 text-lg text-slate-100"
              >
                {t("header.settings.heading")}
              </h2>
              <p className="mt-1 mb-0 text-sm text-slate-300">
                {t("header.settings.description")}
              </p>
            </header>
            <div className="mb-3 rounded-xl border border-slate-500/45 bg-slate-900/55 p-2.5">
              <p className="m-0 text-xs text-slate-300">
                {t("header.locale.label")}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <button
                  className={`rounded-[8px] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    locale === "en"
                      ? "bg-sky-400/20 text-sky-200"
                      : "text-slate-300 hover:bg-slate-700/40"
                  }`}
                  type="button"
                  onClick={() => setLocale("en")}
                  aria-pressed={locale === "en"}
                >
                  {t("header.locale.en")}
                </button>
                <button
                  className={`rounded-[8px] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    locale === "uk"
                      ? "bg-sky-400/20 text-sky-200"
                      : "text-slate-300 hover:bg-slate-700/40"
                  }`}
                  type="button"
                  onClick={() => setLocale("uk")}
                  aria-pressed={locale === "uk"}
                >
                  {t("header.locale.uk")}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <button
                className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/14 px-3 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
                type="button"
                onClick={() => void handleCopyBackupClick()}
                disabled={isBackupPending}
              >
                {t("header.settings.copyBackup")}
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.15)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
                type="button"
                onClick={() => void handlePasteBackupClick()}
                disabled={isBackupPending}
              >
                {t("header.settings.pasteBackup")}
              </button>
              <button
                className="cursor-pointer rounded-[10px] border border-rose-400/50 bg-rose-400/14 px-3 py-2 text-sm font-semibold text-rose-200 shadow-[0_0_12px_rgba(251,113,133,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                type="button"
                onClick={handleResetClick}
              >
                {t("header.settings.resetData")}
              </button>
            </div>
            {backupStatus ? (
              <p className="mt-3 mb-0 text-xs text-cyan-200/90">
                {backupStatus}
              </p>
            ) : null}
            <div className="mt-3 border-t border-slate-700/80 pt-3">
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => setIsSettingsOpen(false)}
              >
                {t("header.settings.close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}
