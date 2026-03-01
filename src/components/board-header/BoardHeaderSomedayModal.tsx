import { useI18n } from "../../i18n/useI18n";
import type { BoardHeaderSomedayModalProps } from "../../types/interfaces";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export function BoardHeaderSomedayModal({
  isOpen,
  somedayItems,
  onMoveToInbox,
  onClose,
}: BoardHeaderSomedayModalProps) {
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="w-full max-w-2xl rounded-2xl border border-cyan-400/35 bg-[linear-gradient(180deg,rgba(5,20,39,0.96),rgba(2,10,20,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="someday-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3">
          <h2 id="someday-modal-title" className="m-0 text-lg text-cyan-100">
            {t("header.someday.title")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-cyan-200/85">
            {t("header.someday.description")}
          </p>
        </header>
        {somedayItems.length === 0 ? (
          <p className="m-0 rounded-xl border border-cyan-300/25 bg-cyan-400/8 p-3 text-sm text-cyan-100/85">
            {t("header.someday.empty")}
          </p>
        ) : (
          <ul className="m-0 grid max-h-[52vh] list-none gap-2 overflow-y-auto p-0 pr-1">
            {somedayItems.map((item) => (
              <li
                key={item.id}
                className="grid gap-2 rounded-xl border border-cyan-300/30 bg-slate-950/45 p-2.5 md:grid-cols-[1fr_auto]"
              >
                <div className="grid gap-0.5">
                  <p className="m-0 text-sm font-medium text-slate-100">
                    {item.title}
                  </p>
                  <p className="m-0 text-xs text-slate-300">
                    {t("header.someday.reviewAt", {
                      date: formatDisplayDate(item.reviewAt),
                    })}
                  </p>
                </div>
                <button
                  className="cursor-pointer rounded-[10px] border border-cyan-300/55 bg-cyan-300/14 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                  type="button"
                  onClick={() => onMoveToInbox(item.id)}
                >
                  {t("header.someday.moveToInbox")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 border-t border-cyan-400/25 pt-3">
          <button
            className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
            type="button"
            onClick={onClose}
          >
            {t("header.settings.close")}
          </button>
        </div>
      </section>
    </div>
  );
}
