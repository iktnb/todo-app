import type { TaskStatus } from '../enums/task-status'

export interface Task {
  id: string
  title: string
  columnId: string
  status: TaskStatus
  waitingFor?: string
  waitingDeadline?: string
  createdAt: string
}
