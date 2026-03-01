import { useI18n } from "../../../i18n/useI18n";

interface ProjectCreateControlsProps {
  isCreateOpen: boolean;
  newProjectTitle: string;
  createError: string | null;
  onCreateOpen: () => void;
  onCreateConfirm: () => void;
  onCreateCancel: () => void;
  onNewProjectTitleChange: (value: string) => void;
}

export function ProjectCreateControls({
  isCreateOpen,
  newProjectTitle,
  createError,
  onCreateOpen,
  onCreateConfirm,
  onCreateCancel,
  onNewProjectTitleChange,
}: ProjectCreateControlsProps) {
  const { t } = useI18n();

  return (
    <>
      {!isCreateOpen ? (
        <button
          id="project-create-open-button"
          className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
          type="button"
          onClick={onCreateOpen}
        >
          {t("project.createButton")}
        </button>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            id="project-create-title-input"
            className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
            type="text"
            placeholder={t("project.createPlaceholder")}
            value={newProjectTitle}
            onChange={(event) => onNewProjectTitleChange(event.target.value)}
          />
          <button
            id="project-create-confirm-button"
            className="cursor-pointer rounded-[10px] border border-emerald-400/55 bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200"
            type="button"
            onClick={onCreateConfirm}
          >
            {t("project.create")}
          </button>
          <button
            id="project-create-cancel-button"
            className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-xs text-slate-200"
            type="button"
            onClick={onCreateCancel}
          >
            {t("project.cancel")}
          </button>
        </div>
      )}
      {createError ? <p className="m-0 text-xs text-rose-300">{createError}</p> : null}
    </>
  );
}
