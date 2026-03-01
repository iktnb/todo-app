import type { Column, Task, TaskStatus } from '../types/board'

interface TaskCardProps {
  task: Task
  columns: Column[]
  isLegacy: boolean
  isRawItem: boolean
  onSetTaskStatus: (taskId: string, nextStatus: TaskStatus) => void
  onMoveTask: (taskId: string, nextColumnId: string) => void
  onDeleteTask: (taskId: string) => void
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onStartClarify: (taskId: string, triggerElement: HTMLButtonElement) => void
}

const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Готово' },
]

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
}

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: 'border-sky-400/45 bg-sky-400/14 text-cyan-300',
  in_progress: 'border-yellow-400/45 bg-yellow-400/14 text-amber-200',
  done: 'border-green-400/45 bg-green-400/14 text-green-300',
}

function formatCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Недавно создана'
  }

  return `Создана ${date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  })}`
}

export function TaskCard({
  task,
  columns,
  isLegacy,
  isRawItem,
  onSetTaskStatus,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onStartClarify,
}: TaskCardProps) {
  const showMoveControl = columns.length > 1

  return (
    <div
      className="grid cursor-grab gap-2 rounded-xl border border-slate-400/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-2.5 transition-[border-color,transform,box-shadow] duration-200 ease-in-out hover:-translate-y-px hover:border-sky-400/55 hover:shadow-[0_0_16px_rgba(56,189,248,0.15)] active:cursor-grabbing"
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={() => onDragEnd()}
    >
      <div className="grid content-start gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`w-fit rounded-full border border-transparent px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] ${TASK_STATUS_CLASSES[task.status]}`}
          >
            {TASK_STATUS_LABELS[task.status]}
          </span>
          {isLegacy && (
            <span className="w-fit rounded-full border border-violet-400/45 bg-violet-400/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] text-violet-200">
              Legacy
            </span>
          )}
          {isRawItem && (
            <span className="w-fit rounded-full border border-sky-400/45 bg-sky-400/15 px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] text-sky-200">
              Inbox
            </span>
          )}
        </div>
        <p
          className={`m-0 text-[0.96rem] leading-[1.35] text-slate-200 ${task.status === 'done' ? 'text-slate-400 line-through' : ''}`}
        >
          {task.title}
        </p>
        <span className="m-0 text-xs text-slate-400">{formatCreatedAt(task.createdAt)}</span>
      </div>

      <div
        className={`grid gap-2 max-md:grid-cols-1 ${
          showMoveControl ? 'grid-cols-[1fr_1fr_auto_auto]' : 'grid-cols-[1fr_auto_auto]'
        }`}
      >
        <select
          className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus:border-sky-400/90 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.22)] focus:outline-none"
          value={task.status}
          onChange={(event) =>
            onSetTaskStatus(task.id, event.target.value as TaskStatus)
          }
          aria-label="Изменить статус задачи"
        >
          {TASK_STATUS_OPTIONS.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
        {showMoveControl && (
          <select
            className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus:border-sky-400/90 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.22)] focus:outline-none"
            value={task.columnId}
            onChange={(event) => onMoveTask(task.id, event.target.value)}
            aria-label="Переместить задачу в другой столбик"
          >
            {columns.map((targetColumn) => (
              <option key={targetColumn.id} value={targetColumn.id}>
                {targetColumn.title}
              </option>
            ))}
          </select>
        )}
        {isRawItem && (
          <button
            className="cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/14 px-2.5 py-2 font-semibold text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.18)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
            type="button"
            onClick={(event) => onStartClarify(task.id, event.currentTarget)}
            aria-label={`Clarify item ${task.title}`}
          >
            Clarify
          </button>
        )}
        <button
          className="cursor-pointer rounded-[10px] border border-violet-400/50 bg-violet-400/14 px-2.5 py-2 font-semibold text-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
          type="button"
          onClick={() => onDeleteTask(task.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
