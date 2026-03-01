import type { Task, TaskStatus } from "../../../../types/board";
import { TaskStatusEnum } from "../../../../types/board";
import { useI18n } from "../../../../i18n/useI18n";

interface WaitingTasksWidgetProps {
  tasks: Task[];
  onSetTaskStatus: (taskId: string, nextStatus: TaskStatus) => void;
}

function toDeadlineTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function toStartOfLocalDayTimestamp(inputDate: Date): number {
  const start = new Date(inputDate);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

function getDeadlineBadgeKey(deadlineTimestamp: number | null): string | null {
  if (deadlineTimestamp === null) {
    return null;
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = toStartOfLocalDayTimestamp(new Date());
  const deadlineStart = toStartOfLocalDayTimestamp(new Date(deadlineTimestamp));
  const dayDiff = Math.round((deadlineStart - todayStart) / dayMs);

  if (dayDiff < 0) {
    return "board.dashboard.waiting.badge.overdue";
  }
  if (dayDiff === 0) {
    return "board.dashboard.waiting.badge.today";
  }
  if (dayDiff === 1) {
    return "board.dashboard.waiting.badge.tomorrow";
  }
  if (dayDiff <= 3) {
    return "board.dashboard.waiting.badge.soon";
  }
  return null;
}

export function WaitingTasksWidget({ tasks, onSetTaskStatus }: WaitingTasksWidgetProps) {
  const { t, locale } = useI18n();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (tasks.length === 0) {
    return (
      <p className="m-0 rounded-xl border border-slate-600/40 bg-slate-900/25 p-3 text-sm text-slate-300">
        {t("board.dashboard.waiting.empty")}
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-1.5 p-0">
      {tasks.map((task) => {
        const deadlineTimestamp = toDeadlineTimestamp(task.waitingDeadline);
        const deadlineBadgeKey = getDeadlineBadgeKey(deadlineTimestamp);

        return (
          <li
            key={task.id}
            className="group rounded-xl border border-amber-400/25 bg-amber-500/10 px-2.5 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-medium text-amber-100">
                  {task.title}
                </p>
                <p className="m-0 mt-1 text-xs text-amber-200/85">
                  {t("board.dashboard.waiting.meta", {
                    who: task.waitingFor ?? "-",
                    deadline:
                      deadlineTimestamp === null
                        ? t("board.dashboard.waiting.noDeadline")
                        : dateFormatter.format(new Date(deadlineTimestamp)),
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {deadlineBadgeKey ? (
                  <span className="rounded-md border border-amber-300/45 bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                    {t(deadlineBadgeKey)}
                  </span>
                ) : null}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    className="grid h-6 w-6 cursor-pointer place-items-center rounded-[7px] border border-emerald-400/45 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20"
                    type="button"
                    onClick={() => onSetTaskStatus(task.id, TaskStatusEnum.Done)}
                    aria-label={t("board.dashboard.waiting.action.done")}
                    title={t("board.dashboard.waiting.action.done")}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5 8 14l8-8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="grid h-6 w-6 cursor-pointer place-items-center rounded-[7px] border border-violet-400/45 bg-violet-500/12 text-violet-200 hover:bg-violet-500/20"
                    type="button"
                    onClick={() => {
                      const isConfirmed = window.confirm(
                        t("board.dashboard.waiting.action.obsoleteConfirm"),
                      );
                      if (!isConfirmed) {
                        return;
                      }
                      onSetTaskStatus(task.id, TaskStatusEnum.Obsolete);
                    }}
                    aria-label={t("board.dashboard.waiting.action.obsolete")}
                    title={t("board.dashboard.waiting.action.obsolete")}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.75 5.5h12.5M8 8.25v5M12 8.25v5M6.5 5.5l.5-1.25A1.5 1.5 0 0 1 8.39 3.25h3.22A1.5 1.5 0 0 1 13 4.25l.5 1.25m-8.25 0 .62 9A1.5 1.5 0 0 0 7.37 16h5.26a1.5 1.5 0 0 0 1.5-1.5l.62-9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
