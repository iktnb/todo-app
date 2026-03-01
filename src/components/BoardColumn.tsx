import type { DragEvent } from "react";
import type { Column, Task, TaskStatus } from "../types/board";
import { TaskStatusEnum } from "../types/board";
import { TaskCard } from "./TaskCard";
import { useI18n } from "../i18n/useI18n";

interface BoardColumnProps {
  column: Column;
  columns: Column[];
  tasks: Task[];
  legacyTaskIds: string[];
  isInbox: boolean;
  isFullWidth?: boolean;
  isDragOver: boolean;
  rawInboxItemIds: Set<string>;
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
  onColumnDragOver: (
    event: DragEvent<HTMLDivElement>,
    columnId: string,
  ) => void;
  onColumnDrop: (event: DragEvent<HTMLDivElement>, columnId: string) => void;
  onColumnDragLeave: (event: DragEvent<HTMLDivElement>) => void;
}

export function BoardColumn({
  column,
  columns,
  tasks,
  legacyTaskIds,
  isInbox,
  isFullWidth = false,
  isDragOver,
  rawInboxItemIds,
  onSetTaskStatus,
  onUpdateTaskTitle,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onStartClarify,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragLeave,
}: BoardColumnProps) {
  const { t } = useI18n();
  const visibleTasks = isInbox
    ? tasks.filter((task) => task.status !== TaskStatusEnum.Obsolete)
    : tasks;
  const columnClasses = [
    "grid min-h-0 grid-rows-[auto_1fr] gap-2.5 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5 shadow-[0_18px_36px_rgba(2,6,23,0.45)] backdrop-blur-[8px] transition-[transform,border-color,box-shadow] duration-250 ease-in-out hover:-translate-y-0.5 hover:border-violet-400/55 hover:shadow-[0_24px_42px_rgba(2,6,23,0.55),0_0_20px_rgba(167,139,250,0.15)]",
    isFullWidth
      ? "w-full min-w-0"
      : "flex-[0_0_300px] max-md:basis-[min(290px,calc(100vw-48px))]",
    isInbox
      ? "border-sky-400/50 shadow-[0_24px_42px_rgba(2,6,23,0.55),0_0_20px_rgba(56,189,248,0.16)]"
      : "",
    isDragOver
      ? "border-sky-400/95 shadow-[inset_0_0_0_2px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.25)]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={columnClasses}>
      <div
        className="grid min-h-0 content-start gap-2 overflow-y-auto pr-0.5"
        data-inbox-list={isInbox ? "true" : undefined}
        tabIndex={isInbox ? -1 : undefined}
        onDragOver={(event) => onColumnDragOver(event, column.id)}
        onDrop={(event) => onColumnDrop(event, column.id)}
        onDragLeave={onColumnDragLeave}
      >
        {visibleTasks.length === 0 ? (
          <p className="mt-0.5 mb-0 text-center text-[0.92rem] text-slate-400">
            {t("board.empty")}
          </p>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              isLegacy={legacyTaskIds.includes(task.id)}
              isRawItem={rawInboxItemIds.has(task.id)}
              onSetTaskStatus={onSetTaskStatus}
              onUpdateTaskTitle={onUpdateTaskTitle}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onStartClarify={onStartClarify}
            />
          ))
        )}
      </div>
    </article>
  );
}
