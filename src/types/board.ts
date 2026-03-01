export interface Column {
  id: string
  title: string
}

export interface Task {
  id: string
  title: string
  columnId: string
  completed: boolean
}
