import { useState } from "react";
import { ITEM_TITLE_MAX_LENGTH } from "../constants/validation";
import type { Column, Task, TaskStatus } from "../types/board";
import { TaskStatusEnum } from "../types/board";
import { useI18n } from "../i18n/useI18n";
import { NeonSelect } from "../../design-system/components";

interface TaskCardProps {
  task: Task;
  columns: Column[];
  isLegacy: boolean;
  isRawItem: boolean;
  onSetTaskStatus: (
    taskId: string,
    nextStatus: TaskStatus,
    waitingDetails?: { waitingFor: string; waitingDeadline: string },
  ) => void;
  onUpdateTaskTitle: (taskId: string, nextTitle: string) => boolean;
  onMoveTask: (taskId: string, nextColumnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onStartClarify: (taskId: string, triggerElement: HTMLButtonElement) => void;
}

const TASK_STATUS_KEYS: Record<TaskStatus, string> = {
  [TaskStatusEnum.Todo]: "task.status.todo",
  [TaskStatusEnum.InProgress]: "task.status.in_progress",
  [TaskStatusEnum.Waiting]: "task.status.waiting",
  [TaskStatusEnum.Done]: "task.status.done",
  [TaskStatusEnum.Obsolete]: "task.status.obsolete",
};

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  [TaskStatusEnum.Todo]: "border-sky-400/45 bg-sky-400/14 text-cyan-300",
  [TaskStatusEnum.InProgress]:
    "border-yellow-400/45 bg-yellow-400/14 text-amber-200",
  [TaskStatusEnum.Waiting]:
    "border-orange-400/45 bg-orange-400/14 text-orange-200",
  [TaskStatusEnum.Done]: "border-green-400/45 bg-green-400/14 text-green-300",
  [TaskStatusEnum.Obsolete]:
    "border-slate-500/45 bg-slate-500/14 text-slate-300",
};

function formatCreatedAt(
  value: string,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("task.createdAtInvalid");
  }

  return t("task.createdAt", {
    date: date.toLocaleDateString(),
  });
}

function formatWaitingDeadline(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const normalizedDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return normalizedDate?.[1] ?? "";
}

export function TaskCard({
  task,
  columns,
  isLegacy,
  isRawItem,
  onSetTaskStatus,
  onUpdateTaskTitle,
  onMoveTask,
  onDragStart,
  onDragEnd,
  onStartClarify,
}: TaskCardProps) {
  const { t } = useI18n();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isWaitingFormOpen, setIsWaitingFormOpen] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState("");
  const [waitingDeadlineInput, setWaitingDeadlineInput] = useState("");
  const [waitingError, setWaitingError] = useState<string | null>(null);
  const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: TaskStatusEnum.Todo, label: t("task.status.todo") },
    { value: TaskStatusEnum.InProgress, label: t("task.status.in_progress") },
    { value: TaskStatusEnum.Waiting, label: t("task.status.waiting") },
    { value: TaskStatusEnum.Done, label: t("task.status.done") },
    { value: TaskStatusEnum.Obsolete, label: t("task.status.obsolete") },
  ];
  const moveTaskOptions = columns.map((targetColumn) => ({
    value: targetColumn.id,
    label: targetColumn.title,
  }));
  const showMoveControl = columns.length > 1;
  const isDone = task.status === TaskStatusEnum.Done;
  const isObsolete = task.status === TaskStatusEnum.Obsolete;
  const statusControlValue = isWaitingFormOpen
    ? TaskStatusEnum.Waiting
    : task.status;

  function handleStatusChange(nextStatus: TaskStatus) {
    if (nextStatus !== TaskStatusEnum.Waiting) {
      setWaitingError(null);
      setIsWaitingFormOpen(false);
      onSetTaskStatus(task.id, nextStatus);
      return;
    }

    setWaitingForInput(task.waitingFor?.trim() ?? "");
    setWaitingDeadlineInput(toDateInputValue(task.waitingDeadline));
    setWaitingError(null);
    setIsWaitingFormOpen(true);
  }

  function handleWaitingSubmit() {
    const waitingFor = waitingForInput.trim();
    const waitingDeadline = waitingDeadlineInput.trim();
    if (!waitingFor || !waitingDeadline) {
      setWaitingError(t("task.waitingValidation"));
      return;
    }

    onSetTaskStatus(task.id, TaskStatusEnum.Waiting, {
      waitingFor,
      waitingDeadline,
    });
    setWaitingError(null);
    setIsWaitingFormOpen(false);
  }

  function handleWaitingCancel() {
    setWaitingForInput(task.waitingFor ?? "");
    setWaitingDeadlineInput(toDateInputValue(task.waitingDeadline));
    setWaitingError(null);
    setIsWaitingFormOpen(false);
  }

  function handleStartEditTitle() {
    setTitleDraft(task.title);
    setTitleError(null);
    setIsEditingTitle(true);
  }

  function handleSaveTitle() {
    const normalizedTitle = titleDraft.trim();
    if (!normalizedTitle) {
      setTitleError(t("task.validation.emptyTitle"));
      return;
    }

    const isUpdated = onUpdateTaskTitle(task.id, normalizedTitle);
    if (!isUpdated) {
      setTitleError(t("task.validation.invalidTitle"));
      return;
    }

    setTitleError(null);
    setIsEditingTitle(false);
  }

  function handleCancelTitleEdit() {
    setTitleDraft(task.title);
    setTitleError(null);
    setIsEditingTitle(false);
  }

  return (
    <div
      className="grid cursor-grab gap-2 rounded-xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-2.5 transition-[border-color,box-shadow] duration-200 ease-in-out hover:border-sky-400/55 hover:shadow-[0_0_16px_rgba(56,189,248,0.15)] active:cursor-grabbing"
      draggable={!isEditingTitle && !isWaitingFormOpen}
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={() => onDragEnd()}
    >
      <div className="grid content-start gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`w-fit rounded-full border border-transparent px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] ${TASK_STATUS_CLASSES[task.status]}`}
            >
              {t(TASK_STATUS_KEYS[task.status])}
            </span>
            {isLegacy && (
              <span className="w-fit rounded-full border border-violet-400/45 bg-violet-400/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] text-violet-200">
                Legacy
              </span>
            )}
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <button
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-emerald-400/55 bg-emerald-400/14 text-emerald-200 transition-colors hover:bg-emerald-400/22"
                type="button"
                onClick={handleSaveTitle}
                aria-label={t("task.save")}
                title={t("task.save")}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10.5 8 14l8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-rose-400/55 bg-rose-400/12 text-rose-200 transition-colors hover:bg-rose-400/22"
                type="button"
                onClick={handleCancelTitleEdit}
                aria-label={t("task.cancel")}
                title={t("task.cancel")}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-slate-400/45 bg-slate-700/30 text-slate-200 transition-colors hover:bg-slate-700/45"
              type="button"
              onClick={handleStartEditTitle}
              aria-label={t("task.edit")}
              title={t("task.edit")}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="m13.5 4.5 2 2m-9.75 9 2.91-.73a2 2 0 0 0 .97-.53l5.75-5.74a1.5 1.5 0 0 0 0-2.12l-1.76-1.76a1.5 1.5 0 0 0-2.12 0L5.75 10.38a2 2 0 0 0-.53.97L4.5 14.25Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        {isEditingTitle ? (
          <div className="grid gap-1">
            <input
              className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus:border-sky-400/90 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.22)] focus:outline-none"
              type="text"
              value={titleDraft}
              maxLength={ITEM_TITLE_MAX_LENGTH}
              onChange={(event) => setTitleDraft(event.target.value)}
              aria-label={t("task.editTitleAria")}
            />
            {titleError ? (
              <p className="m-0 text-xs text-rose-200/90">{titleError}</p>
            ) : null}
          </div>
        ) : (
          <p
            className={`m-0 text-[0.96rem] leading-[1.35] text-slate-200 ${isDone ? "text-slate-400 line-through" : ""} ${isObsolete ? "text-slate-400" : ""}`}
          >
            {task.title}
          </p>
        )}
        {task.status === TaskStatusEnum.Waiting &&
        task.waitingFor &&
        task.waitingDeadline &&
        !isWaitingFormOpen ? (
          <div className="flex items-center justify-between gap-2">
          <span
              className="m-0 text-xs text-orange-200/90"
              title={`${task.waitingFor} | ${task.waitingDeadline}`}
            >
              {t("task.waitingFromTo", {
                who: task.waitingFor,
                deadline: formatWaitingDeadline(task.waitingDeadline),
              })}
            </span>
            <button
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-orange-400/45 bg-orange-400/12 text-orange-200 transition-colors hover:bg-orange-400/20"
              type="button"
              onClick={() => {
                setWaitingForInput(task.waitingFor ?? "");
                setWaitingDeadlineInput(toDateInputValue(task.waitingDeadline));
                setWaitingError(null);
                setIsWaitingFormOpen(true);
              }}
              aria-label={t("task.waitingEdit")}
              title={t("task.waitingEdit")}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="m13.5 4.5 2 2m-9.75 9 2.91-.73a2 2 0 0 0 .97-.53l5.75-5.74a1.5 1.5 0 0 0 0-2.12l-1.76-1.76a1.5 1.5 0 0 0-2.12 0L5.75 10.38a2 2 0 0 0-.53.97L4.5 14.25Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
        {isWaitingFormOpen ? (
          <div className="grid gap-1.5 rounded-[10px] border border-orange-400/35 bg-orange-400/8 p-2">
            <label className="grid gap-1 text-xs text-orange-100">
              {t("task.waitingWhoLabel")}
              <input
                className="w-full rounded-[8px] border border-slate-400/35 bg-slate-900/75 px-2 py-1.5 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus:border-orange-400/80 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.22)] focus:outline-none"
                type="text"
                required
                value={waitingForInput}
                onChange={(event) => setWaitingForInput(event.target.value)}
                aria-label={t("task.waitingWhoAria")}
              />
            </label>
            <label className="grid gap-1 text-xs text-orange-100">
              {t("task.waitingDeadlineLabel")}
              <input
                className="w-full rounded-[8px] border border-slate-400/35 bg-slate-900/75 px-2 py-1.5 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus:border-orange-400/80 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.22)] focus:outline-none"
                type="date"
                required
                value={waitingDeadlineInput}
                onChange={(event) => setWaitingDeadlineInput(event.target.value)}
                aria-label={t("task.waitingDeadlineAria")}
              />
            </label>
            {waitingError ? (
              <p className="m-0 text-xs text-rose-200/90">{waitingError}</p>
            ) : null}
            <div className="flex items-center gap-1.5">
              <button
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-orange-400/45 bg-orange-400/12 text-orange-100"
                type="button"
                onClick={handleWaitingSubmit}
                aria-label={t("task.waitingSave")}
                title={t("task.waitingSave")}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10.5 8 14l8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-slate-400/45 bg-slate-700/30 text-slate-200"
                type="button"
                onClick={handleWaitingCancel}
                aria-label={t("task.cancel")}
                title={t("task.cancel")}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
        <span className="m-0 text-xs text-slate-400">
          {formatCreatedAt(task.createdAt, t)}
        </span>
      </div>

      <div
        className={`grid gap-2 max-md:grid-cols-1 ${
          showMoveControl
            ? "grid-cols-[1fr_1fr_auto_auto]"
            : "grid-cols-[1fr_auto_auto]"
        }`}
      >
        <NeonSelect<TaskStatus>
          className="w-full"
          buttonClassName="py-2 text-sm"
          value={statusControlValue}
          onChange={handleStatusChange}
          aria-label={t("task.changeStatusAria")}
          options={taskStatusOptions}
        />
        {showMoveControl && (
          <NeonSelect<string>
            className="w-full"
            buttonClassName="py-2 text-sm"
            value={task.columnId}
            onChange={(nextColumnId) => onMoveTask(task.id, nextColumnId)}
            aria-label={t("task.moveAria")}
            options={moveTaskOptions}
          />
        )}
        {isRawItem && (
          <button
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border border-sky-400/55 bg-sky-400/14 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.18)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={(event) => onStartClarify(task.id, event.currentTarget)}
            aria-label={t("task.clarifyAria", { title: task.title })}
            title={t("task.clarify")}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M10 3.75a6.25 6.25 0 0 0-6.25 6.25c0 1.48.52 2.84 1.38 3.9.2.24.3.55.27.86l-.15 1.49a.5.5 0 0 0 .62.54l1.75-.45c.27-.07.56-.02.8.11A6.23 6.23 0 0 0 10 16.25 6.25 6.25 0 1 0 10 3.75Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.9 8.25a1.25 1.25 0 1 1 2.05.96c-.5.37-.95.78-.95 1.54M10 13.25h.01"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <button
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border border-violet-400/50 bg-violet-400/14 text-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
          type="button"
          onClick={() => onSetTaskStatus(task.id, TaskStatusEnum.Obsolete)}
          aria-label={t("task.delete")}
          title={t("task.delete")}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M3.75 5.5h12.5M8 8.25v5M12 8.25v5M6.5 5.5l.5-1.25A1.5 1.5 0 0 1 8.39 3.25h3.22A1.5 1.5 0 0 1 13 4.25l.5 1.25m-8.25 0 .62 9A1.5 1.5 0 0 0 7.37 16h5.26a1.5 1.5 0 0 0 1.5-1.5l.62-9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
