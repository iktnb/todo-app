import { useI18n } from "../../i18n/useI18n";
import type { BoardHeaderArchiveModalProps } from "../../types/interfaces";

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export function BoardHeaderArchiveModal({
  isOpen,
  archivedTasks,
  onUnarchiveTask,
  onClose,
}: BoardHeaderArchiveModalProps) {
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
        className="w-full max-w-2xl rounded-2xl border border-violet-400/35 bg-[linear-gradient(180deg,rgba(21,13,39,0.96),rgba(8,6,20,0.98))] p-4 shadow-[0_24px_42px_rgba(2,6,23,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3">
          <h2 id="archive-modal-title" className="m-0 text-lg text-violet-100">
            {t("header.archive.title")}
          </h2>
          <p className="mt-1 mb-0 text-sm text-violet-200/85">
            {t("header.archive.description")}
          </p>
        </header>
        {archivedTasks.length === 0 ? (
          <p className="m-0 rounded-xl border border-violet-300/25 bg-violet-400/8 p-3 text-sm text-violet-100/85">
            {t("header.archive.empty")}
          </p>
        ) : (
          <ul className="m-0 grid max-h-[52vh] list-none gap-2 overflow-y-auto p-0 pr-1">
            {archivedTasks.map((task) => (
              <li
                key={task.id}
                className="grid gap-2 rounded-xl border border-violet-300/30 bg-slate-950/45 p-2.5 md:grid-cols-[1fr_auto]"
              >
                <div className="grid gap-0.5">
                  <p className="m-0 text-sm font-medium text-slate-100">
                    {task.title}
                  </p>
                  <p className="m-0 text-xs text-slate-300">
                    {t("header.archive.createdAt", {
                      date: formatDisplayDate(task.createdAt),
                    })}
                  </p>
                </div>
                <button
                  className="cursor-pointer rounded-[10px] border border-violet-300/55 bg-violet-300/14 px-3 py-1.5 text-xs font-semibold text-violet-100 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
                  type="button"
                  onClick={() => onUnarchiveTask(task.id)}
                >
                  {t("header.archive.unarchive")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 border-t border-violet-400/25 pt-3">
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
