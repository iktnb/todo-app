import type { Project, ProjectHealth, NextAction } from "../../../types/gtd";
import { NextActionStatusEnum, ProjectHealthEnum } from "../../../types/gtd";
import { useI18n } from "../../../i18n/useI18n";

interface ProjectListProps {
  projects: Project[];
  projectActions: (projectId: string) => NextAction[];
  projectHealthById: Record<string, ProjectHealth>;
  onSelectProject: (projectId: string) => void;
  resolveStatusLabel: (status: Project["status"]) => string;
  resolveHealthLabel: (health: ProjectHealth) => string;
}

export function ProjectList({
  projects,
  projectActions,
  projectHealthById,
  onSelectProject,
  resolveStatusLabel,
  resolveHealthLabel,
}: ProjectListProps) {
  const { t } = useI18n();

  return (
    <div className="grid content-start gap-2.5">
      {projects.map((project) => {
        const linkedActions = projectActions(project.id);
        const linkedDoneCount = linkedActions.filter(
          (nextAction) => nextAction.status === NextActionStatusEnum.Done,
        ).length;
        const linkedActiveCount = linkedActions.filter(
          (nextAction) => nextAction.status === NextActionStatusEnum.Active,
        ).length;
        const projectHealth =
          projectHealthById[project.id] ?? ProjectHealthEnum.Healthy;

        return (
          <button
            id={`project-list-item-${project.id}`}
            key={project.id}
            className="grid w-full cursor-pointer gap-2 rounded-xl border border-slate-400/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3 text-left transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px hover:border-sky-400/45 hover:shadow-[0_0_18px_rgba(56,189,248,0.15)]"
            type="button"
            onClick={() => onSelectProject(project.id)}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 text-base text-slate-100">{project.title}</h3>
              <span className="rounded-full border border-slate-400/40 bg-slate-900/75 px-2 py-0.5 text-xs font-semibold text-slate-200">
                {resolveStatusLabel(project.status)}
              </span>
            </div>
            <div className="grid gap-1 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              <span>
                {t("project.stats.totalTasks", {
                  count: linkedActions.length,
                })}
              </span>
              <span>{t("project.stats.completed", { count: linkedDoneCount })}</span>
              <span>{t("project.stats.active", { count: linkedActiveCount })}</span>
              <span>
                {t("project.stats.health", {
                  health: resolveHealthLabel(projectHealth),
                })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
