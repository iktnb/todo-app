import { useState } from "react";
import { ProjectCard as DsProjectCard } from "../../../design-system/components/ProjectCard";
import type {
  Context,
  NextAction,
  Project,
  ProjectHealth,
  ProjectStatus,
} from "../../types/gtd";
import { ProjectStatusEnum } from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";
import { ProjectCardControls } from "./components/ProjectCardControls";
import { ProjectCardFooter } from "./components/ProjectCardFooter";

interface ProjectCardProps {
  project: Project;
  health: ProjectHealth;
  linkedActions: NextAction[];
  unboundActiveNextActions: NextAction[];
  contextsById: Map<string, Context>;
  contexts: Context[];
  onUpdateTitle: (projectId: string, title: string) => boolean;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => boolean;
  onQuickAddLinkedAction: (input: {
    title: string;
    contextId: string;
    projectId: string;
  }) => boolean;
  onBindNextAction: (nextActionId: string, projectId: string) => boolean;
  onUnbindNextAction: (nextActionId: string) => boolean;
}

export function ProjectCard({
  project,
  health,
  linkedActions,
  unboundActiveNextActions,
  contextsById,
  contexts,
  onUpdateTitle,
  onUpdateStatus,
  onQuickAddLinkedAction,
  onBindNextAction,
  onUnbindNextAction,
}: ProjectCardProps) {
  const { t } = useI18n();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(project.title);
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [quickAddContextId, setQuickAddContextId] = useState(
    contexts[0]?.id ?? "",
  );
  const [bindNextActionId, setBindNextActionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSaveTitle() {
    const isUpdated = onUpdateTitle(project.id, draftTitle);
    if (!isUpdated) {
      setError(t("project.card.error.updateTitle"));
      return;
    }
    setError(null);
    setIsEditingTitle(false);
  }

  function handleStatusChange(nextStatus: ProjectStatus) {
    const isUpdated = onUpdateStatus(project.id, nextStatus);
    if (!isUpdated) {
      setError(t("project.card.error.activateWithoutAction"));
      return;
    }
    setError(null);
  }

  function handleQuickAdd() {
    const preferredContextId = quickAddContextId || contexts[0]?.id;
    if (!preferredContextId) {
      setError(t("project.card.error.noContext"));
      return;
    }
    const isCreated = onQuickAddLinkedAction({
      title: quickAddTitle,
      contextId: preferredContextId,
      projectId: project.id,
    });
    if (!isCreated) {
      setError(t("project.card.error.addAction"));
      return;
    }
    setError(null);
    setQuickAddTitle("");
  }

  function handleBind() {
    if (!bindNextActionId) {
      setError(t("project.card.error.selectAction"));
      return;
    }
    const isBound = onBindNextAction(bindNextActionId, project.id);
    if (!isBound) {
      setError(t("project.card.error.bindAction"));
      return;
    }
    setError(null);
    setBindNextActionId("");
  }

  return (
    <DsProjectCard
      title={project.title}
      status={project.status}
      health={health}
      linkedActions={linkedActions.map((nextAction) => ({
        id: nextAction.id,
        title: nextAction.title,
        status: nextAction.status,
        meta:
          contextsById.get(nextAction.contextId)?.name ??
          t("project.card.meta.unknownContext"),
        actions: (
          <button
            className="cursor-pointer rounded-[10px] border border-rose-400/50 bg-rose-400/15 px-2 py-1 text-xs font-semibold text-rose-200"
            type="button"
            onClick={() => onUnbindNextAction(nextAction.id)}
          >
            {t("project.card.unbind")}
          </button>
        ),
      }))}
      labels={{
        statusLabel: t("project.card.status"),
        statusMap: {
          [ProjectStatusEnum.Active]: t("ds.project.status.active"),
          [ProjectStatusEnum.OnHold]: t("ds.project.status.on_hold"),
          [ProjectStatusEnum.Done]: t("ds.project.status.done"),
        },
        missingNextAction: t("ds.project.healthMissing"),
        linkedSection: t("ds.project.linkedSection"),
        noLinkedActions: t("ds.project.noLinked"),
        noContext: t("ds.project.noContext"),
      }}
      controls={
        <ProjectCardControls
          project={project}
          isEditingTitle={isEditingTitle}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onSaveTitle={handleSaveTitle}
          onCancelEditTitle={() => {
            setDraftTitle(project.title);
            setIsEditingTitle(false);
            setError(null);
          }}
          onStartEditTitle={() => setIsEditingTitle(true)}
          onStatusChange={handleStatusChange}
        />
      }
      footer={
        <ProjectCardFooter
          contexts={contexts}
          unboundActiveNextActions={unboundActiveNextActions}
          quickAddTitle={quickAddTitle}
          quickAddContextId={quickAddContextId}
          bindNextActionId={bindNextActionId}
          onQuickAddTitleChange={setQuickAddTitle}
          onQuickAddContextIdChange={setQuickAddContextId}
          onBindNextActionIdChange={setBindNextActionId}
          onQuickAdd={handleQuickAdd}
          onBind={handleBind}
          error={error}
        />
      }
    />
  );
}
