import { useMemo } from "react";
import type { Context, NextAction } from "../../../types/gtd";
import { NextActionStatusEnum } from "../../../types/gtd";
import { useI18n } from "../../../i18n/useI18n";
import { NeonSelect } from "../../../../design-system/components";

interface ProjectCardFooterProps {
  contexts: Context[];
  unboundActiveNextActions: NextAction[];
  quickAddTitle: string;
  quickAddContextId: string;
  bindNextActionId: string;
  onQuickAddTitleChange: (value: string) => void;
  onQuickAddContextIdChange: (value: string) => void;
  onBindNextActionIdChange: (value: string) => void;
  onQuickAdd: () => void;
  onBind: () => void;
  error: string | null;
}

export function ProjectCardFooter({
  contexts,
  unboundActiveNextActions,
  quickAddTitle,
  quickAddContextId,
  bindNextActionId,
  onQuickAddTitleChange,
  onQuickAddContextIdChange,
  onBindNextActionIdChange,
  onQuickAdd,
  onBind,
  error,
}: ProjectCardFooterProps) {
  const { t } = useI18n();
  const quickAddContextOptions = contexts.map((context) => ({
    value: context.id,
    label: context.name,
  }));
  const availableUnboundActions = useMemo(
    () =>
      unboundActiveNextActions.filter(
        (nextAction) => nextAction.status === NextActionStatusEnum.Active,
      ),
    [unboundActiveNextActions],
  );
  const bindExistingOptions = [
    { value: "", label: t("project.card.bindExisting") },
    ...availableUnboundActions.map((nextAction) => ({
      value: nextAction.id,
      label: nextAction.title,
    })),
  ];

  return (
    <div className="grid gap-2 rounded-xl border border-slate-400/25 bg-slate-900/60 p-2.5">
      <p className="m-0 text-xs font-semibold tracking-[0.02em] text-slate-300">
        {t("project.card.quickAdd")}
      </p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
          type="text"
          value={quickAddTitle}
          onChange={(event) => onQuickAddTitleChange(event.target.value)}
          placeholder={t("project.card.quickAddPlaceholder")}
        />
        <NeonSelect<string>
          className="min-w-36"
          buttonClassName="py-2 text-xs"
          value={quickAddContextId}
          options={quickAddContextOptions}
          onChange={onQuickAddContextIdChange}
        />
        <button
          className="cursor-pointer rounded-[10px] border border-emerald-400/50 bg-emerald-400/15 px-2.5 py-2 text-xs font-semibold text-emerald-200"
          type="button"
          onClick={onQuickAdd}
        >
          {t("project.card.add")}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <NeonSelect<string>
          className="w-full"
          buttonClassName="py-2 text-xs"
          value={bindNextActionId}
          options={bindExistingOptions}
          onChange={onBindNextActionIdChange}
        />
        <button
          className="cursor-pointer rounded-[10px] border border-violet-400/50 bg-violet-400/15 px-2.5 py-2 text-xs font-semibold text-violet-200"
          type="button"
          onClick={onBind}
        >
          {t("project.card.bind")}
        </button>
      </div>

      {error ? <p className="m-0 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
