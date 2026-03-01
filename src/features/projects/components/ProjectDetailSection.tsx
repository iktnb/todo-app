import type { Context, NextAction, Project, ProjectHealth } from "../../../types/gtd";
import { ProjectHealthEnum } from "../../../types/gtd";
import { useI18n } from "../../../i18n/useI18n";
import { ProjectCard } from "../ProjectCard";

interface ProjectDetailSectionProps {
  selectedProject: Project;
  projectHealthById: Record<string, ProjectHealth>;
  projectActions: (projectId: string) => NextAction[];
  unboundActiveNextActions: NextAction[];
  contextsById: Map<string, Context>;
  contexts: Context[];
  onBackToList: () => void;
  onUpdateProjectTitle: (projectId: string, title: string) => boolean;
  onUpdateProjectStatus: (projectId: string, status: Project["status"]) => boolean;
  onQuickAddLinkedAction: (input: {
    title: string;
    contextId: string;
    projectId: string;
  }) => boolean;
  onBindNextAction: (nextActionId: string, projectId: string) => boolean;
  onUnbindNextAction: (nextActionId: string) => boolean;
}

export function ProjectDetailSection({
  selectedProject,
  projectHealthById,
  projectActions,
  unboundActiveNextActions,
  contextsById,
  contexts,
  onBackToList,
  onUpdateProjectTitle,
  onUpdateProjectStatus,
  onQuickAddLinkedAction,
  onBindNextAction,
  onUnbindNextAction,
}: ProjectDetailSectionProps) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-0 content-start gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        <div>
          <h3 className="m-0 text-lg text-slate-100">{selectedProject.title}</h3>
          <p className="mt-1 mb-0 text-sm text-slate-300">
            {t("project.detail.description")}
          </p>
        </div>
        <button
          id="project-detail-back-button"
          className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-sm text-slate-200"
          type="button"
          onClick={onBackToList}
        >
          {t("project.backToList")}
        </button>
      </div>
      <ProjectCard
        project={selectedProject}
        health={projectHealthById[selectedProject.id] ?? ProjectHealthEnum.Healthy}
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
  );
}
