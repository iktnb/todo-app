import type { Context, NextAction } from "../../types/gtd";
import { NextActionStatusEnum, type NextActionStatus } from "../../types/gtd";
import { useI18n } from "../../i18n/useI18n";
import { NeonSelect } from "../../../design-system/components";
import { useState } from "react";

interface NextActionListProps {
  nextActions: NextAction[];
  contexts: Context[];
  contextsById: Map<string, Context>;
  selectedContextLabel: string;
  onSetStatus: (nextActionId: string, status: NextActionStatus) => boolean;
  onUpdateNextAction: (
    nextActionId: string,
    input: {
      title: string;
      notes?: string;
      contextId: string;
    },
  ) => boolean;
  onDeleteNextAction: (nextActionId: string) => boolean;
}

export function NextActionList({
  nextActions,
  contexts,
  contextsById,
  selectedContextLabel,
  onSetStatus,
  onUpdateNextAction,
  onDeleteNextAction,
}: NextActionListProps) {
  const { t } = useI18n();
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [contextDraft, setContextDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorActionId, setErrorActionId] = useState<string | null>(null);
  const nextActionStatusOptions: Array<{
    value: NextActionStatus;
    label: string;
  }> = [
    {
      value: NextActionStatusEnum.Active,
      label: t("nextAction.status.active"),
    },
    {
      value: NextActionStatusEnum.Done,
      label: t("nextAction.status.done"),
    },
  ];

  function startEdit(nextAction: NextAction) {
    setEditingActionId(nextAction.id);
    setTitleDraft(nextAction.title);
    setNotesDraft(nextAction.notes ?? "");
    setContextDraft(nextAction.contextId);
    setActionError(null);
  }

  function cancelEdit() {
    setEditingActionId(null);
    setTitleDraft("");
    setNotesDraft("");
    setContextDraft("");
    setActionError(null);
    setErrorActionId(null);
  }

  function saveEdit(nextActionId: string) {
    const fallbackContextId = contexts[0]?.id;
    const preferredContextId = contextDraft || fallbackContextId;
    if (!preferredContextId) {
      setActionError(t("nextAction.error.update"));
      setErrorActionId(nextActionId);
      return;
    }

    const isUpdated = onUpdateNextAction(nextActionId, {
      title: titleDraft,
      notes: notesDraft,
      contextId: preferredContextId,
    });
    if (!isUpdated) {
      setActionError(t("nextAction.error.update"));
      setErrorActionId(nextActionId);
      return;
    }
    cancelEdit();
  }

  function handleStatusChange(nextActionId: string, status: NextActionStatus) {
    const isUpdated = onSetStatus(nextActionId, status);
    if (!isUpdated) {
      setActionError(t("nextAction.error.status"));
      setErrorActionId(nextActionId);
    } else {
      setActionError(null);
      setErrorActionId(null);
    }
  }

  function handleDelete(nextActionId: string, title: string) {
    const shouldDelete = window.confirm(
      t("nextAction.deleteConfirm", { title }),
    );
    if (!shouldDelete) {
      return;
    }

    const isDeleted = onDeleteNextAction(nextActionId);
    if (!isDeleted) {
      setActionError(t("nextAction.error.delete"));
      setErrorActionId(nextActionId);
      return;
    }
    setActionError(null);
    setErrorActionId(null);
    if (editingActionId === nextActionId) {
      cancelEdit();
    }
  }

  if (nextActions.length === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-5 text-center">
        <div className="max-w-[420px]">
          <h2 className="mt-0 mb-2 text-lg text-slate-100">
            {t("nextAction.empty.title")}
          </h2>
          <p className="m-0 text-sm text-slate-300">
            {t("nextAction.empty.description", {
              contextLabel: selectedContextLabel,
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-2.5">
      {nextActions.map((nextAction) => {
        const context = contextsById.get(nextAction.contextId);
        const isEditing = editingActionId === nextAction.id;
        const contextOptions = contexts.map((itemContext) => ({
          value: itemContext.id,
          label: itemContext.name,
        }));

        return (
          <article
            key={nextAction.id}
            className="grid gap-2 rounded-xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-sky-400/45 bg-sky-400/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] text-sky-200">
                  {context?.name ?? t("nextAction.unknownContext")}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] ${
                    nextAction.status === NextActionStatusEnum.Done
                      ? "border-emerald-400/50 bg-emerald-400/14 text-emerald-200"
                      : "border-slate-400/45 bg-slate-500/14 text-slate-300"
                  }`}
                >
                  {nextAction.status === NextActionStatusEnum.Done
                    ? t("nextAction.status.done")
                    : t("nextAction.status.active")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <button
                      className="cursor-pointer rounded-[10px] border border-emerald-400/50 bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-200"
                      type="button"
                      onClick={() => saveEdit(nextAction.id)}
                    >
                      {t("nextAction.save")}
                    </button>
                    <button
                      className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/30 px-2 py-1 text-xs font-semibold text-slate-200"
                      type="button"
                      onClick={cancelEdit}
                    >
                      {t("nextAction.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="cursor-pointer rounded-[10px] border border-violet-400/50 bg-violet-400/14 px-2 py-1 text-xs font-semibold text-violet-200"
                      type="button"
                      onClick={() => startEdit(nextAction)}
                    >
                      {t("nextAction.edit")}
                    </button>
                    <button
                      className="cursor-pointer rounded-[10px] border border-rose-400/50 bg-rose-400/14 px-2 py-1 text-xs font-semibold text-rose-200"
                      type="button"
                      onClick={() => handleDelete(nextAction.id, nextAction.title)}
                    >
                      {t("nextAction.delete")}
                    </button>
                  </>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="grid gap-2">
                <input
                  className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
                  type="text"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  aria-label={t("nextAction.editTitleAria")}
                />
                <textarea
                  className="min-h-20 w-full resize-y rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  aria-label={t("nextAction.editNotesAria")}
                />
                <NeonSelect<string>
                  className="w-full"
                  buttonClassName="py-2 text-sm"
                  value={contextDraft || contexts[0]?.id || ""}
                  options={contextOptions}
                  onChange={setContextDraft}
                  aria-label={t("nextAction.changeContextAria")}
                />
              </div>
            ) : (
              <>
                <p className="m-0 text-[0.98rem] text-slate-100">
                  {nextAction.title}
                </p>
                {nextAction.notes ? (
                  <p className="m-0 text-sm leading-[1.35] text-slate-300">
                    {nextAction.notes}
                  </p>
                ) : null}
              </>
            )}
            <div className="grid gap-2 sm:grid-cols-[minmax(180px,220px)_1fr] sm:items-center">
              <NeonSelect<NextActionStatus>
                className="w-full"
                buttonClassName="py-2 text-sm"
                value={nextAction.status}
                options={nextActionStatusOptions}
                onChange={(nextStatus) =>
                  handleStatusChange(nextAction.id, nextStatus)
                }
                aria-label={t("nextAction.changeStatusAria")}
              />
              {actionError && errorActionId === nextAction.id ? (
                <p className="m-0 text-xs text-rose-200">{actionError}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
