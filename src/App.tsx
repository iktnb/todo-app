import { BoardColumn } from './components/BoardColumn'
import { BoardHeader } from './components/BoardHeader'
import { CreateColumnCard } from './components/CreateColumnCard'
import { INBOX_COLUMN } from './constants/board'
import { useBoardState } from './hooks/useBoardState'

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
    handleSetTaskStatus,
    handleMoveTask,
    handleDeleteTask,
    handleDragStart,
    handleDragEnd,
    handleColumnDragOver,
    handleColumnDrop,
    handleColumnDragLeave,
  } = useBoardState()

  return (
    <main className="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden p-6 max-md:p-4">
      <BoardHeader />

      <section
        className="mt-5 flex items-stretch gap-4 overflow-x-auto overflow-y-hidden px-1 pt-0.5 pb-2 max-md:mt-3.5 max-md:gap-3"
        aria-label="Столбики задач"
      >
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
            onSetTaskStatus={handleSetTaskStatus}
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
