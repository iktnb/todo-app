import type { Column, Task } from '../types/board'
import { TaskCompletionToggle } from '../../design-system'

interface TaskCardProps {
  task: Task
  columns: Column[]
  onToggleTask: (taskId: string) => void
  onMoveTask: (taskId: string, nextColumnId: string) => void
  onDeleteTask: (taskId: string) => void
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
}

export function TaskCard({
  task,
  columns,
  onToggleTask,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={() => onDragEnd()}
    >
      <div className="task-main">
        <TaskCompletionToggle
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          ariaLabel={`Отметить задачу "${task.title}" как выполненную`}
        />
        <span className={task.completed ? 'done' : ''}>{task.title}</span>
      </div>

      <div className="task-actions">
        <select
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
        <button type="button" onClick={() => onDeleteTask(task.id)}>
          Удалить
        </button>
      </div>
    </div>
  )
}
