import { useEffect, useMemo, useState } from "react";
import type {
  Context,
  NextAction,
  Project,
  ProjectHealth,
  ProjectStatusFilter,
} from "../../types/gtd";
import {
  ProjectHealthEnum,
  ProjectStatusFilterEnum,
  ProjectStatusEnum,
} from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";
import { ProjectCreateControls } from "./components/ProjectCreateControls";
import { ProjectDetailSection } from "./components/ProjectDetailSection";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectList } from "./components/ProjectList";
import { ProjectMetrics } from "./components/ProjectMetrics";
import { filterProjects } from "./utils/project-search";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>(
    ProjectStatusFilterEnum.All,
  );
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
  const filteredProjects = useMemo(
    () =>
      filterProjects({
        projects: sortedProjects,
        statusFilter,
        searchQuery,
        contextsById,
        projectHealthById,
        projectActions,
      }),
    [
      contextsById,
      projectActions,
      projectHealthById,
      searchQuery,
      sortedProjects,
      statusFilter,
    ],
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

  function handleCreateCancel() {
    setIsCreateOpen(false);
    setCreateError(null);
    setNewProjectTitle("");
  }

  return (
    <section className="mt-5 grid min-h-0 grid-rows-[auto_1fr] gap-3 overflow-y-auto pr-1 max-md:pr-0">
      {selectedProject === null ? (
        <header className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ProjectFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onSearchQueryChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
            />
            {!isCreateOpen ? (
              <ProjectCreateControls
                isCreateOpen={false}
                newProjectTitle={newProjectTitle}
                createError={null}
                onCreateOpen={() => setIsCreateOpen(true)}
                onCreateConfirm={handleCreateProject}
                onCreateCancel={handleCreateCancel}
                onNewProjectTitleChange={setNewProjectTitle}
              />
            ) : null}
          </div>
          <ProjectMetrics
            activeProjectsCount={activeProjectsCount}
            doneProjectsCount={doneProjectsCount}
            projectsWithoutNextActionCount={projectsWithoutNextActionCount}
            totalActionsCount={nextActions.length}
          />
          {isCreateOpen ? (
            <ProjectCreateControls
              isCreateOpen
              newProjectTitle={newProjectTitle}
              createError={createError}
              onCreateOpen={() => setIsCreateOpen(true)}
              onCreateConfirm={handleCreateProject}
              onCreateCancel={handleCreateCancel}
              onNewProjectTitleChange={setNewProjectTitle}
            />
          ) : null}
        </header>
      ) : (
        <section className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
          <ProjectCreateControls
            isCreateOpen={isCreateOpen}
            newProjectTitle={newProjectTitle}
            createError={createError}
            onCreateOpen={() => setIsCreateOpen(true)}
            onCreateConfirm={handleCreateProject}
            onCreateCancel={handleCreateCancel}
            onNewProjectTitleChange={setNewProjectTitle}
          />
        </section>
      )}

      <div className="grid min-h-0 content-start gap-3">
        {sortedProjects.length === 0 ? (
          <div className="grid min-h-[200px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 text-center">
            <p className="m-0 text-sm text-slate-300">{t("project.empty")}</p>
          </div>
        ) : selectedProject ? (
          <ProjectDetailSection
            selectedProject={selectedProject}
            projectHealthById={projectHealthById}
            projectActions={projectActions}
            unboundActiveNextActions={unboundActiveNextActions}
            contextsById={contextsById}
            contexts={contexts}
            onBackToList={() => setSelectedProjectId(null)}
            onUpdateProjectTitle={onUpdateProjectTitle}
            onUpdateProjectStatus={onUpdateProjectStatus}
            onQuickAddLinkedAction={onQuickAddLinkedAction}
            onBindNextAction={onBindNextAction}
            onUnbindNextAction={onUnbindNextAction}
          />
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="grid min-h-[120px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 text-center">
                <p className="m-0 text-sm text-slate-300">
                  {t("project.search.empty")}
                </p>
              </div>
            ) : null}
            <ProjectList
              projects={filteredProjects}
              projectActions={projectActions}
              projectHealthById={projectHealthById}
              onSelectProject={setSelectedProjectId}
              resolveStatusLabel={resolveStatusLabel}
              resolveHealthLabel={resolveHealthLabel}
            />
          </>
        )}
      </div>
    </section>
  );
}
