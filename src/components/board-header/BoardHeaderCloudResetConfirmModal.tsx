import { useI18n } from "../../i18n/useI18n";
import type { BoardHeaderCloudResetConfirmModalProps } from "../../types/interfaces";

export function BoardHeaderCloudResetConfirmModal({
  isOpen,
  cloudResetPhrase,
  cloudResetConfirmInput,
  onCloudResetConfirmInputChange,
  isCloudResetPhraseValid,
  isCloudResetPending,
  onCancel,
  onConfirm,
}: BoardHeaderCloudResetConfirmModalProps) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 px-4 py-6"
      role="presentation"
      onClick={onCancel}
    >
      <section
        className="w-full max-w-md rounded-2xl border border-amber-400/35 bg-[linear-gradient(180deg,rgba(27,18,10,0.96),rgba(15,10,5,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-reset-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3">
          <h2 id="cloud-reset-confirm-title" className="m-0 text-lg text-amber-100">
            {t("header.settings.cloudResetTitle")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-amber-100/90">
            {t("header.settings.cloudResetWarning")}
          </p>
        </header>
        <p className="m-0 text-xs text-amber-100/80">
          {t("header.settings.cloudResetInputHint")}
        </p>
        <p className="mt-2 mb-0 rounded-md border border-amber-300/40 bg-slate-900/55 px-2 py-1.5 text-xs text-amber-100">
          {cloudResetPhrase}
        </p>
        <input
          className="mt-2 w-full rounded-[10px] border border-amber-300/45 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-200/85 focus:outline-none"
          type="text"
          value={cloudResetConfirmInput}
          onChange={(event) => onCloudResetConfirmInputChange(event.target.value)}
          placeholder={t("header.settings.cloudResetInputPlaceholder")}
          aria-label={t("header.settings.cloudResetInputAria")}
        />
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
            type="button"
            onClick={onCancel}
            disabled={isCloudResetPending}
          >
            {t("header.settings.resetCancel")}
          </button>
          <button
            className="cursor-pointer rounded-[10px] border border-amber-300/55 bg-amber-300/15 px-3 py-2 text-sm font-semibold text-amber-100 shadow-[0_0_12px_rgba(252,211,77,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
            type="button"
            onClick={onConfirm}
            disabled={!isCloudResetPhraseValid || isCloudResetPending}
          >
            {t("header.settings.cloudResetConfirmAction")}
          </button>
        </div>
      </section>
    </div>
  );
}
