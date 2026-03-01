import { TaskStatusEnum, type TaskStatus } from "../../../../types/board";
import { useI18n } from "../../../../i18n/useI18n";

interface TaskStatusBreakdownWidgetProps {
  statusCounts: Record<TaskStatus, number>;
}

const STATUS_ORDER: TaskStatus[] = [
  TaskStatusEnum.Todo,
  TaskStatusEnum.InProgress,
  TaskStatusEnum.Waiting,
  TaskStatusEnum.Done,
  TaskStatusEnum.Obsolete,
];

export function TaskStatusBreakdownWidget({
  statusCounts,
}: TaskStatusBreakdownWidgetProps) {
  const { t } = useI18n();
  const total = STATUS_ORDER.reduce(
    (sum, status) => sum + (statusCounts[status] ?? 0),
    0,
  );

  return (
    <div className="space-y-2">
      {STATUS_ORDER.map((status) => {
        const count = statusCounts[status] ?? 0;
        const ratio = total === 0 ? 0 : Math.max(6, Math.round((count / total) * 100));
        return (
          <div key={status}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-300">{t(`task.status.${status}`)}</span>
              <span className="text-xs font-medium text-slate-100">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-sky-400/75 transition-all"
                style={{ width: `${count === 0 ? 0 : ratio}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
