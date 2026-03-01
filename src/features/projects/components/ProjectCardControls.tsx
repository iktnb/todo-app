import type { Project, ProjectStatus } from "../../../types/gtd";
import { ProjectStatusEnum } from "../../../types/gtd";
import { useI18n } from "../../../i18n/useI18n";
import { NeonSelect } from "../../../../design-system/components";

interface ProjectCardControlsProps {
  project: Project;
  isEditingTitle: boolean;
  draftTitle: string;
  onDraftTitleChange: (value: string) => void;
  onSaveTitle: () => void;
  onCancelEditTitle: () => void;
  onStartEditTitle: () => void;
  onStatusChange: (status: ProjectStatus) => void;
}

export function ProjectCardControls({
  project,
  isEditingTitle,
  draftTitle,
  onDraftTitleChange,
  onSaveTitle,
  onCancelEditTitle,
  onStartEditTitle,
  onStatusChange,
}: ProjectCardControlsProps) {
  const { t } = useI18n();
  const projectStatusOptions = [
    {
      value: ProjectStatusEnum.Active,
      label: t("ds.project.status.active"),
    },
    {
      value: ProjectStatusEnum.OnHold,
      label: t("ds.project.status.on_hold"),
    },
    {
      value: ProjectStatusEnum.Done,
      label: t("ds.project.status.done"),
    },
  ] as const;

  return (
    <div className="grid gap-2 rounded-xl border border-slate-400/25 bg-slate-900/60 p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-slate-300" htmlFor={`project-status-${project.id}`}>
          {t("project.card.status")}
        </label>
        <NeonSelect<ProjectStatus>
          id={`project-status-${project.id}`}
          className="w-44"
          buttonClassName="py-1.5 text-xs"
          value={project.status}
          options={projectStatusOptions}
          onChange={onStatusChange}
        />
      </div>

      {isEditingTitle ? (
        <div className="grid gap-2">
          <input
            className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
            type="text"
            value={draftTitle}
            onChange={(event) => onDraftTitleChange(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/15 px-2.5 py-1.5 text-xs font-semibold text-sky-200"
              type="button"
              onClick={onSaveTitle}
            >
              {t("project.card.saveTitle")}
            </button>
            <button
              className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-2.5 py-1.5 text-xs text-slate-200"
              type="button"
              onClick={onCancelEditTitle}
            >
              {t("project.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="w-fit cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-2.5 py-1.5 text-xs text-slate-200"
          type="button"
          onClick={onStartEditTitle}
        >
          {t("project.card.editTitle")}
        </button>
      )}
    </div>
  );
}
