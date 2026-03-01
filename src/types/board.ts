export interface Column {
  id: string
  title: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  columnId: string
  status: TaskStatus
  createdAt: string
}
