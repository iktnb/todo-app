import { useI18n } from "../../../../i18n/useI18n";

interface TasksSummaryWidgetProps {
  inboxTasksTotal: number;
  inboxDoneTasks: number;
  inboxWaitingTasks: number;
  nextActionsDone: number;
  projectsDone: number;
}

export function TasksSummaryWidget({
  inboxTasksTotal,
  inboxDoneTasks,
  inboxWaitingTasks,
  nextActionsDone,
  projectsDone,
}: TasksSummaryWidgetProps) {
  const { t } = useI18n();
  console.log(import.meta.env.DEV);
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-slate-500/30 bg-slate-900/30 p-2">
        <p className="m-0 text-[0.72rem] uppercase tracking-wide text-slate-400">
          {t("board.dashboard.summary.inbox")}
        </p>
        <p className="m-0 mt-1 text-lg font-semibold text-slate-100">
          {inboxTasksTotal}
        </p>
      </div>
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-2">
        <p className="m-0 text-[0.72rem] uppercase tracking-wide text-emerald-200/80">
          {t("board.dashboard.summary.doneTasks")}
        </p>
        <p className="m-0 mt-1 text-lg font-semibold text-emerald-100">
          {inboxDoneTasks}
        </p>
      </div>
      <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-2">
        <p className="m-0 text-[0.72rem] uppercase tracking-wide text-amber-200/80">
          {t("board.dashboard.summary.waitingTasks")}
        </p>
        <p className="m-0 mt-1 text-lg font-semibold text-amber-100">
          {inboxWaitingTasks}
        </p>
      </div>
      <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2">
        <p className="m-0 text-[0.72rem] uppercase tracking-wide text-sky-200/80">
          {t("board.dashboard.summary.doneActions")}
        </p>
        <p className="m-0 mt-1 text-lg font-semibold text-sky-100">
          {nextActionsDone}
        </p>
      </div>
      <div className="col-span-2 rounded-xl border border-violet-400/25 bg-violet-500/10 p-2">
        <p className="m-0 text-[0.72rem] uppercase tracking-wide text-violet-200/80">
          {t("board.dashboard.summary.doneProjects")}
        </p>
        <p className="m-0 mt-1 text-lg font-semibold text-violet-100">
          {projectsDone}
        </p>
      </div>
    </div>
  );
}
