import { useI18n } from "../../../i18n/useI18n";

interface ProjectMetricsProps {
  activeProjectsCount: number;
  doneProjectsCount: number;
  projectsWithoutNextActionCount: number;
  totalActionsCount: number;
}

export function ProjectMetrics({
  activeProjectsCount,
  doneProjectsCount,
  projectsWithoutNextActionCount,
  totalActionsCount,
}: ProjectMetricsProps) {
  const { t } = useI18n();

  return (
    <div className="grid w-full gap-1 text-xs text-slate-300 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      <span>{t("project.metrics.active", { count: activeProjectsCount })}</span>
      <span>{t("project.metrics.done", { count: doneProjectsCount })}</span>
      <span>
        {t("project.metrics.missing", {
          count: projectsWithoutNextActionCount,
        })}
      </span>
      <span>{t("project.metrics.allActions", { count: totalActionsCount })}</span>
    </div>
  );
}
