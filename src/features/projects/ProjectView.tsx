import { useEffect, useMemo, useState } from "react";
import type {
  Context,
  NextAction,
  Project,
  ProjectHealth,
} from "../../types/gtd";
import {
  NextActionStatusEnum,
  ProjectHealthEnum,
  ProjectStatusEnum,
} from "../../types/gtd";
import { ProjectCard } from "./ProjectCard";
import { useI18n } from "../../i18n/useI18n";

interface ProjectViewProps {
  projects: Project[];
  contexts: Context[];
  nextActions: NextAction[];
  projectHealthById: Record<string, ProjectHealth>;
  projectsWithoutNextActionCount: number;
  unboundActiveNextActions: NextAction[];
  projectActions: (projectId: string) => NextAction[];
  onCreateProject: (title: string) => boolean;
  onUpdateProjectTitle: (projectId: string, title: string) => boolean;
  onUpdateProjectStatus: (
    projectId: string,
    status: Project["status"],
  ) => boolean;
  onQuickAddLinkedAction: (input: {
    title: string;
    contextId: string;
    projectId: string;
  }) => boolean;
  onBindNextAction: (nextActionId: string, projectId: string) => boolean;
  onUnbindNextAction: (nextActionId: string) => boolean;
  onProjectDetailOpenChange?: (isOpen: boolean) => void;
}

export function ProjectView({
  projects,
  contexts,
  nextActions,
  projectHealthById,
  projectsWithoutNextActionCount,
  unboundActiveNextActions,
  projectActions,
  onCreateProject,
  onUpdateProjectTitle,
  onUpdateProjectStatus,
  onQuickAddLinkedAction,
  onBindNextAction,
  onUnbindNextAction,
  onProjectDetailOpenChange,
}: ProjectViewProps) {
  const { t } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const contextsById = useMemo(
    () => new Map(contexts.map((context) => [context.id, context])),
    [contexts],
  );
  const sortedProjects = useMemo(
    () =>
      [...projects].sort((firstProject, secondProject) => {
        if (firstProject.status !== secondProject.status) {
          if (firstProject.status === ProjectStatusEnum.Active) {
            return -1;
          }
          if (secondProject.status === ProjectStatusEnum.Active) {
            return 1;
          }
        }
        return (
          new Date(secondProject.createdAt).getTime() -
          new Date(firstProject.createdAt).getTime()
        );
      }),
    [projects],
  );
  const activeProjectsCount = useMemo(
    () =>
      projects.filter((project) => project.status === ProjectStatusEnum.Active)
        .length,
    [projects],
  );
  const doneProjectsCount = useMemo(
    () =>
      projects.filter((project) => project.status === ProjectStatusEnum.Done)
        .length,
    [projects],
  );
  const selectedProject = useMemo(
    () =>
      selectedProjectId === null
        ? null
        : (sortedProjects.find((project) => project.id === selectedProjectId) ??
          null),
    [selectedProjectId, sortedProjects],
  );

  useEffect(() => {
    onProjectDetailOpenChange?.(selectedProjectId !== null);
  }, [onProjectDetailOpenChange, selectedProjectId]);

  function handleCreateProject() {
    const isCreated = onCreateProject(newProjectTitle);
    if (!isCreated) {
      setCreateError(t("project.validation.invalidTitle"));
      return;
    }
    setCreateError(null);
    setNewProjectTitle("");
    setIsCreateOpen(false);
  }

  function resolveHealthLabel(health: ProjectHealth) {
    if (health === ProjectHealthEnum.MissingNextAction) {
      return t("project.health.missing");
    }
    return t("project.health.healthy");
  }

  function resolveStatusLabel(status: Project["status"]) {
    if (status === ProjectStatusEnum.Active) {
      return t("ds.project.status.active");
    }
    if (status === ProjectStatusEnum.OnHold) {
      return t("ds.project.status.on_hold");
    }
    return t("ds.project.status.done");
  }

  return (
    <section className="mt-5 grid min-h-0 grid-rows-[auto_auto_1fr] gap-3 overflow-y-auto pr-1 max-md:pr-0">
      {selectedProject === null ? (
        <header className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-lg text-slate-100">
              {t("project.view.title")}
            </h2>
            <div className="grid w-full gap-1 text-xs text-slate-300 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
              <span>
                {t("project.metrics.active", { count: activeProjectsCount })}
              </span>
              <span>
                {t("project.metrics.done", { count: doneProjectsCount })}
              </span>
              <span>
                {t("project.metrics.missing", {
                  count: projectsWithoutNextActionCount,
                })}
              </span>
              <span>
                {t("project.metrics.allActions", { count: nextActions.length })}
              </span>
            </div>
          </div>
        </header>
      ) : null}

      <section className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        {!isCreateOpen ? (
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            {t("project.createButton")}
          </button>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
              type="text"
              placeholder={t("project.createPlaceholder")}
              value={newProjectTitle}
              onChange={(event) => setNewProjectTitle(event.target.value)}
            />
            <button
              className="cursor-pointer rounded-[10px] border border-emerald-400/55 bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200"
              type="button"
              onClick={handleCreateProject}
            >
              {t("project.create")}
            </button>
            <button
              className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-xs text-slate-200"
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setCreateError(null);
                setNewProjectTitle("");
              }}
            >
              {t("project.cancel")}
            </button>
          </div>
        )}
        {createError ? (
          <p className="m-0 text-xs text-rose-300">{createError}</p>
        ) : null}
      </section>

      <div className="grid min-h-0 content-start gap-3">
        {sortedProjects.length === 0 ? (
          <div className="grid min-h-[200px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 text-center">
            <p className="m-0 text-sm text-slate-300">{t("project.empty")}</p>
          </div>
        ) : selectedProject ? (
          <div className="grid min-h-0 content-start gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
              <div>
                <h3 className="m-0 text-lg text-slate-100">
                  {selectedProject.title}
                </h3>
                <p className="mt-1 mb-0 text-sm text-slate-300">
                  {t("project.detail.description")}
                </p>
              </div>
              <button
                className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
                type="button"
                onClick={() => setSelectedProjectId(null)}
              >
                {t("project.backToList")}
              </button>
            </div>
            <ProjectCard
              project={selectedProject}
              health={
                projectHealthById[selectedProject.id] ??
                ProjectHealthEnum.Healthy
              }
              linkedActions={projectActions(selectedProject.id)}
              unboundActiveNextActions={unboundActiveNextActions}
              contextsById={contextsById}
              contexts={contexts}
              onUpdateTitle={onUpdateProjectTitle}
              onUpdateStatus={onUpdateProjectStatus}
              onQuickAddLinkedAction={onQuickAddLinkedAction}
              onBindNextAction={onBindNextAction}
              onUnbindNextAction={onUnbindNextAction}
            />
          </div>
        ) : (
          <div className="grid content-start gap-2.5">
            {sortedProjects.map((project) => {
              const linkedActions = projectActions(project.id);
              const linkedDoneCount = linkedActions.filter(
                (nextAction) => nextAction.status === NextActionStatusEnum.Done,
              ).length;
              const linkedActiveCount = linkedActions.filter(
                (nextAction) =>
                  nextAction.status === NextActionStatusEnum.Active,
              ).length;
              const projectHealth =
                projectHealthById[project.id] ?? ProjectHealthEnum.Healthy;

              return (
                <button
                  key={project.id}
                  className="grid w-full cursor-pointer gap-2 rounded-xl border border-slate-400/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3 text-left transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px hover:border-sky-400/45 hover:shadow-[0_0_18px_rgba(56,189,248,0.15)]"
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="m-0 text-base text-slate-100">
                      {project.title}
                    </h3>
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
                    <span>
                      {t("project.stats.completed", { count: linkedDoneCount })}
                    </span>
                    <span>
                      {t("project.stats.active", { count: linkedActiveCount })}
                    </span>
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
        )}
      </div>
    </section>
  );
}
