import { useI18n } from "../../i18n/useI18n";
import type { BoardHeaderActionsProps } from "../../types/interfaces";

const headerIconButtonBaseClass =
  "grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-[color,transform,background-color] duration-200 ease-in-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-65";

export function BoardHeaderActions({
  onOpenSettings,
  onOpenGuide,
  onOpenArchive,
  onOpenSomeday,
  onOpenReview,
}: BoardHeaderActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        className={`${headerIconButtonBaseClass} text-violet-200/90 hover:bg-violet-400/14 hover:text-violet-100 focus-visible:ring-violet-300/70`}
        type="button"
        onClick={onOpenArchive}
        aria-label={t("header.openArchive")}
        title={t("header.openArchive")}
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
              d="M4 7.5h16M5.5 7.5V18A1.5 1.5 0 0 0 7 19.5h10a1.5 1.5 0 0 0 1.5-1.5V7.5M9.5 11.5h5M10 4.5h4"
            />
          </svg>
        </span>
      </button>
      <button
        className={`${headerIconButtonBaseClass} text-cyan-200/90 hover:bg-cyan-400/14 hover:text-cyan-100 focus-visible:ring-cyan-300/70`}
        type="button"
        onClick={onOpenSomeday}
        aria-label={t("header.openSomeday")}
        title={t("header.openSomeday")}
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
              d="M12 6v6l3.5 2m6.5-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
            />
          </svg>
        </span>
      </button>
      <button
        className={`${headerIconButtonBaseClass} text-emerald-200/90 hover:bg-emerald-400/14 hover:text-emerald-100 focus-visible:ring-emerald-300/70`}
        type="button"
        onClick={onOpenReview}
        aria-label={t("header.openReview")}
        title={t("header.openReview")}
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
              d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v12L16 17l-3.5 2-3.5-2-3.5 2V7A2.5 2.5 0 0 1 7 4.5Zm2.5 5h6m-6 3h4"
            />
          </svg>
        </span>
      </button>
      <button
        className={`${headerIconButtonBaseClass} text-cyan-200/90 hover:bg-cyan-400/14 hover:text-cyan-100 focus-visible:ring-cyan-300/70`}
        type="button"
        onClick={onOpenSettings}
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
        className={`${headerIconButtonBaseClass} text-violet-200/90 hover:bg-violet-400/14 hover:text-violet-100 focus-visible:ring-violet-300/70`}
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
  );
}
