import type { Dispatch, DragEvent, FormEvent, SetStateAction } from 'react'
import type { Column, Task } from '../types/board'
import { TaskCard } from './TaskCard'

interface BoardColumnProps {
  column: Column
  columns: Column[]
  tasks: Task[]
  isInbox: boolean
  isDragOver: boolean
  taskInput: string
  setTaskInput: Dispatch<SetStateAction<string>>
  onAddTask: (event: FormEvent<HTMLFormElement>) => void
  onToggleTask: (taskId: string) => void
  onMoveTask: (taskId: string, nextColumnId: string) => void
  onDeleteTask: (taskId: string) => void
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onColumnDragOver: (event: DragEvent<HTMLDivElement>, columnId: string) => void
  onColumnDrop: (event: DragEvent<HTMLDivElement>, columnId: string) => void
  onColumnDragLeave: (event: DragEvent<HTMLDivElement>) => void
}

export function BoardColumn({
  column,
  columns,
  tasks,
  isInbox,
  isDragOver,
  taskInput,
  setTaskInput,
  onAddTask,
  onToggleTask,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragLeave,
}: BoardColumnProps) {
  return (
    <article
      className={`column${isInbox ? ' inbox-column' : ''}${isDragOver ? ' column-drag-over' : ''}`}
    >
      <div className="column-head">
        <h2>{column.title}</h2>
        <span>{tasks.length}</span>
      </div>

      {isInbox && (
        <form className="task-form" onSubmit={onAddTask}>
          <input
            type="text"
            value={taskInput}
            onChange={(event) => setTaskInput(event.target.value)}
            placeholder="Новая задача..."
            aria-label="Добавить задачу в Inbox"
          />
          <button type="submit">Добавить</button>
        </form>
      )}

      <div
        className="column-body"
        onDragOver={(event) => onColumnDragOver(event, column.id)}
        onDrop={(event) => onColumnDrop(event, column.id)}
        onDragLeave={onColumnDragLeave}
      >
        {tasks.length === 0 ? (
          <p className="empty-column">Пусто</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onToggleTask={onToggleTask}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </article>
  )
}
