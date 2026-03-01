import { useI18n } from "../../i18n/useI18n";
import type { BoardHeaderResetConfirmModalProps } from "../../types/interfaces";

export function BoardHeaderResetConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: BoardHeaderResetConfirmModalProps) {
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
        className="w-full max-w-sm rounded-2xl border border-rose-400/35 bg-[linear-gradient(180deg,rgba(30,10,20,0.96),rgba(15,5,10,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3">
          <h2 id="reset-confirm-title" className="m-0 text-lg text-rose-100">
            {t("header.settings.resetConfirmTitle")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-rose-200/90">
            {t("header.settings.resetConfirm")}
          </p>
        </header>
        <p className="m-0 text-xs text-rose-200/80">
          {t("header.settings.resetWarning")}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
            type="button"
            onClick={onCancel}
          >
            {t("header.settings.resetCancel")}
          </button>
          <button
            className="cursor-pointer rounded-[10px] border border-rose-400/50 bg-rose-400/14 px-3 py-2 text-sm font-semibold text-rose-200 shadow-[0_0_12px_rgba(251,113,133,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={onConfirm}
          >
            {t("header.settings.resetConfirmAction")}
          </button>
        </div>
      </section>
    </div>
  );
}
