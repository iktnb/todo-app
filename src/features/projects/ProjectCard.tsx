import { useMemo, useState } from "react";
import { ProjectCard as DsProjectCard } from "../../../design-system/components/ProjectCard";
import type {
  Context,
  NextAction,
  Project,
  ProjectHealth,
  ProjectStatus,
} from "../../types/gtd";
import { NextActionStatusEnum, ProjectStatusEnum } from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";

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

  const availableUnboundActions = useMemo(
    () =>
      unboundActiveNextActions.filter(
        (nextAction) => nextAction.status === NextActionStatusEnum.Active,
      ),
    [unboundActiveNextActions],
  );

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
        <div className="grid gap-2 rounded-xl border border-slate-400/25 bg-slate-900/60 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="text-xs text-slate-300"
              htmlFor={`project-status-${project.id}`}
            >
              {t("project.card.status")}
            </label>
            <select
              id={`project-status-${project.id}`}
              className="rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2 py-1.5 text-xs text-slate-200"
              value={project.status}
              onChange={(event) =>
                handleStatusChange(event.target.value as ProjectStatus)
              }
            >
              <option value={ProjectStatusEnum.Active}>
                {t("ds.project.status.active")}
              </option>
              <option value={ProjectStatusEnum.OnHold}>
                {t("ds.project.status.on_hold")}
              </option>
              <option value={ProjectStatusEnum.Done}>
                {t("ds.project.status.done")}
              </option>
            </select>
          </div>

          {isEditingTitle ? (
            <div className="grid gap-2">
              <input
                className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
                type="text"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/15 px-2.5 py-1.5 text-xs font-semibold text-sky-200"
                  type="button"
                  onClick={handleSaveTitle}
                >
                  {t("project.card.saveTitle")}
                </button>
                <button
                  className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-2.5 py-1.5 text-xs text-slate-200"
                  type="button"
                  onClick={() => {
                    setDraftTitle(project.title);
                    setIsEditingTitle(false);
                    setError(null);
                  }}
                >
                  {t("project.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-2.5 py-1.5 text-xs text-slate-200"
              type="button"
              onClick={() => setIsEditingTitle(true)}
            >
              {t("project.card.editTitle")}
            </button>
          )}
        </div>
      }
      footer={
        <div className="grid gap-2 rounded-xl border border-slate-400/25 bg-slate-900/60 p-2.5">
          <p className="m-0 text-xs font-semibold tracking-[0.02em] text-slate-300">
            {t("project.card.quickAdd")}
          </p>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
              type="text"
              value={quickAddTitle}
              onChange={(event) => setQuickAddTitle(event.target.value)}
              placeholder={t("project.card.quickAddPlaceholder")}
            />
            <select
              className="rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2 py-2 text-xs text-slate-200"
              value={quickAddContextId}
              onChange={(event) => setQuickAddContextId(event.target.value)}
            >
              {contexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.name}
                </option>
              ))}
            </select>
            <button
              className="cursor-pointer rounded-[10px] border border-emerald-400/50 bg-emerald-400/15 px-2.5 py-2 text-xs font-semibold text-emerald-200"
              type="button"
              onClick={handleQuickAdd}
            >
              {t("project.card.add")}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <select
              className="rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2 py-2 text-xs text-slate-200"
              value={bindNextActionId}
              onChange={(event) => setBindNextActionId(event.target.value)}
            >
              <option value="">{t("project.card.bindExisting")}</option>
              {availableUnboundActions.map((nextAction) => (
                <option key={nextAction.id} value={nextAction.id}>
                  {nextAction.title}
                </option>
              ))}
            </select>
            <button
              className="cursor-pointer rounded-[10px] border border-violet-400/50 bg-violet-400/15 px-2.5 py-2 text-xs font-semibold text-violet-200"
              type="button"
              onClick={handleBind}
            >
              {t("project.card.bind")}
            </button>
          </div>

          {error ? <p className="m-0 text-xs text-rose-300">{error}</p> : null}
        </div>
      }
    />
  );
}
