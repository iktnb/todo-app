import { useI18n } from "../../i18n/useI18n";
import { NeonSelect, type NeonSelectOption } from "../../../design-system/components";
import type { BoardHeaderSettingsModalProps } from "../../types/interfaces";
import { SUPPORTED_LOCALES, type SupportedLocale } from "../../i18n/translations";

export function BoardHeaderSettingsModal({
  isOpen,
  locale,
  onLocaleChange,
  isCloudSyncEnabled,
  cloudSyncStatusLabel,
  cloudSyncQueueLength,
  cloudSyncPendingUploads,
  onSignOut,
  isDangerZoneOpen,
  onToggleDangerZone,
  onResetLocalDataClick,
  canResetCloudData,
  isCloudResetPending,
  onResetCloudDataClick,
  backupStatus,
  onClose,
}: BoardHeaderSettingsModalProps) {
  const { t } = useI18n();
  const localeOptions: ReadonlyArray<NeonSelectOption<SupportedLocale>> =
    SUPPORTED_LOCALES.map((supportedLocale) => ({
      value: supportedLocale,
      label: t(`header.locale.${supportedLocale}`),
    }));

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
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
            {t("header.settings.heading")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-slate-300">
            {t("header.settings.description")}
          </p>
        </header>
        <div className="mb-3 rounded-xl border border-slate-500/45 bg-slate-900/55 p-2.5">
          <p className="m-0 text-xs text-slate-300">{t("header.locale.label")}</p>
          <NeonSelect<SupportedLocale>
            className="mt-2"
            ariaLabel={t("header.locale.label")}
            value={locale}
            options={localeOptions}
            onChange={onLocaleChange}
            buttonClassName="h-9 text-xs font-semibold"
          />
        </div>
        <div className="grid gap-2">
          <div className="rounded-xl border border-slate-500/45 bg-slate-900/55 p-2.5">
            <p className="m-0 text-xs text-slate-300">{t("header.auth.section")}</p>
            <p className="mt-1 mb-0 text-xs text-cyan-200/90">{cloudSyncStatusLabel}</p>
            <p className="mt-1 mb-0 text-[11px] text-slate-300">
              Queue: {cloudSyncQueueLength} · Pending: {cloudSyncPendingUploads}
            </p>
            <div className="mt-2">
              {isCloudSyncEnabled ? (
                <button
                  className="cursor-pointer rounded-[10px] border border-cyan-400/50 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                  type="button"
                  onClick={() => void onSignOut()}
                >
                  {t("header.auth.signOut")}
                </button>
              ) : (
                <p className="m-0 text-xs text-slate-400">{t("header.auth.disabled")}</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-rose-400/25 bg-rose-950/20 p-2.5">
            <button
              className="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-400/14"
              type="button"
              onClick={onToggleDangerZone}
              aria-expanded={isDangerZoneOpen}
            >
              <span>{t("header.settings.dangerZoneTitle")}</span>
              <span aria-hidden="true">
                {isDangerZoneOpen
                  ? t("header.settings.hide")
                  : t("header.settings.show")}
              </span>
            </button>
            {isDangerZoneOpen ? (
              <div className="mt-2 grid gap-2">
                <button
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-rose-400/50 bg-rose-400/14 px-3 py-2 text-sm font-semibold text-rose-200 shadow-[0_0_12px_rgba(251,113,133,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                  type="button"
                  onClick={onResetLocalDataClick}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m-9 0 1 14a1 1 0 0 0 1 .93h6a1 1 0 0 0 1-.93L17 6"
                    />
                  </svg>
                  {t("header.settings.resetData")}
                </button>
                {canResetCloudData ? (
                  <button
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-amber-300/50 bg-amber-300/12 px-3 py-2 text-sm font-semibold text-amber-100 shadow-[0_0_12px_rgba(252,211,77,0.18)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                    type="button"
                    onClick={onResetCloudDataClick}
                    disabled={isCloudResetPending}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12h18M12 3a9 9 0 0 1 0 18M12 3a14.6 14.6 0 0 0 0 18M12 3a14.6 14.6 0 0 1 0 18"
                      />
                    </svg>
                    {t("header.settings.resetCloudData")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {backupStatus ? (
          <p className="mt-3 mb-0 text-xs text-cyan-200/90">{backupStatus}</p>
        ) : null}
        <div className="mt-3 border-t border-slate-700/80 pt-3">
          <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
            type="button"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
            {t("header.settings.close")}
          </button>
        </div>
      </section>
    </div>
  );
}
