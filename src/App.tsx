import { BoardColumn } from './components/BoardColumn'
import { BoardHeader } from './components/BoardHeader'
import { CreateColumnCard } from './components/CreateColumnCard'
import { INBOX_COLUMN } from './constants/board'
import { useBoardState } from './hooks/useBoardState'
import './App.css'

function App() {
  const {
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
  } = useBoardState()

  return (
    <main className="board-app">
      <BoardHeader />

      <section className="board-columns" aria-label="Столбики задач">
        {orderedColumns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            columns={columns}
            tasks={tasks.filter((task) => task.columnId === column.id)}
            isInbox={column.id === INBOX_COLUMN.id}
            isDragOver={dragOverColumnId === column.id}
            taskInput={taskInput}
            setTaskInput={setTaskInput}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragLeave={handleColumnDragLeave}
          />
        ))}

        <CreateColumnCard
          columnInput={columnInput}
          setColumnInput={setColumnInput}
          onAddColumn={handleAddColumn}
        />
      </section>
    </main>
  )
}

export default App
