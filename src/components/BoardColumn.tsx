import type { DragEvent } from 'react'
import type { Column, Task, TaskStatus } from '../types/board'
import { TaskCard } from './TaskCard'

interface BoardColumnProps {
  column: Column
  columns: Column[]
  tasks: Task[]
  legacyTaskIds: string[]
  isInbox: boolean
  isFullWidth?: boolean
  isDragOver: boolean
  rawInboxItemIds: Set<string>
  onSetTaskStatus: (taskId: string, nextStatus: TaskStatus) => void
  onMoveTask: (taskId: string, nextColumnId: string) => void
  onDeleteTask: (taskId: string) => void
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onStartClarify: (taskId: string, triggerElement: HTMLButtonElement) => void
  onColumnDragOver: (event: DragEvent<HTMLDivElement>, columnId: string) => void
  onColumnDrop: (event: DragEvent<HTMLDivElement>, columnId: string) => void
  onColumnDragLeave: (event: DragEvent<HTMLDivElement>) => void
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
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onStartClarify,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragLeave,
}: BoardColumnProps) {
  const columnClasses = [
    'grid min-h-0 grid-rows-[auto_1fr] gap-2.5 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5 shadow-[0_18px_36px_rgba(2,6,23,0.45)] backdrop-blur-[8px] transition-[transform,border-color,box-shadow] duration-250 ease-in-out hover:-translate-y-0.5 hover:border-violet-400/55 hover:shadow-[0_24px_42px_rgba(2,6,23,0.55),0_0_20px_rgba(167,139,250,0.15)]',
    isFullWidth ? 'w-full flex-1' : 'flex-[0_0_300px] max-md:basis-[min(290px,calc(100vw-48px))]',
    isInbox
      ? 'border-sky-400/50 shadow-[0_24px_42px_rgba(2,6,23,0.55),0_0_20px_rgba(56,189,248,0.16)]'
      : '',
    isDragOver
      ? 'border-sky-400/95 shadow-[inset_0_0_0_2px_rgba(56,189,248,0.5),0_0_22px_rgba(56,189,248,0.25)]'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={columnClasses}>
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-base tracking-[0.02em] text-slate-200">{column.title}</h2>
        <span className="rounded-full border border-sky-400/40 bg-sky-400/16 px-[9px] py-0.5 text-xs font-bold text-sky-300">
          {tasks.length}
        </span>
      </div>

      <div
        className="grid min-h-0 content-start gap-2 overflow-y-auto pr-0.5"
        data-inbox-list={isInbox ? 'true' : undefined}
        tabIndex={isInbox ? -1 : undefined}
        onDragOver={(event) => onColumnDragOver(event, column.id)}
        onDrop={(event) => onColumnDrop(event, column.id)}
        onDragLeave={onColumnDragLeave}
      >
        {tasks.length === 0 ? (
          <p className="mt-0.5 mb-0 text-center text-[0.92rem] text-slate-400">Пусто</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              isLegacy={legacyTaskIds.includes(task.id)}
              isRawItem={rawInboxItemIds.has(task.id)}
              onSetTaskStatus={onSetTaskStatus}
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
  )
}
