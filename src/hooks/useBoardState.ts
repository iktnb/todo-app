import { useMemo, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { INBOX_COLUMN } from '../constants/board'
import type { Column, Task } from '../types/board'

export function useBoardState() {
  const [columns, setColumns] = useState<Column[]>([INBOX_COLUMN])
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskInput, setTaskInput] = useState('')
  const [columnInput, setColumnInput] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = taskInput.trim()

    if (!title) {
      return
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      columnId: INBOX_COLUMN.id,
      completed: false,
    }

    setTasks((currentTasks) => [...currentTasks, newTask])
    setTaskInput('')
  }

  function handleAddColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = columnInput.trim()

    if (!title) {
      return
    }

    setColumns((currentColumns) => {
      const hasSameTitle = currentColumns.some(
        (column) => column.title.toLowerCase() === title.toLowerCase(),
      )

      if (hasSameTitle) {
        return currentColumns
      }

      return [
        ...currentColumns,
        {
          id: crypto.randomUUID(),
          title,
        },
      ]
    })

    setColumnInput('')
  }

  function handleToggleTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function handleMoveTask(taskId: string, nextColumnId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: nextColumnId } : task,
      ),
    )
  }

  function handleDeleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId)
  }

  function handleDragEnd() {
    setDraggedTaskId(null)
    setDragOverColumnId(null)
  }

  function handleColumnDragOver(event: DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault()
    setDragOverColumnId(columnId)
  }

  function handleColumnDrop(event: DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault()

    if (!draggedTaskId) {
      return
    }

    handleMoveTask(draggedTaskId, columnId)
    setDraggedTaskId(null)
    setDragOverColumnId(null)
  }

  function handleColumnDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    setDragOverColumnId(null)
  }

  const orderedColumns = useMemo(
    () => [
      ...columns.filter((column) => column.id === INBOX_COLUMN.id),
      ...columns.filter((column) => column.id !== INBOX_COLUMN.id),
    ],
    [columns],
  )

  return {
    columns,
    orderedColumns,
    tasks,
    taskInput,
    columnInput,
    dragOverColumnId,
    setTaskInput,
    setColumnInput,
    handleAddTask,
    handleAddColumn,
    handleToggleTask,
    handleMoveTask,
    handleDeleteTask,
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragLeave,
  }
}
