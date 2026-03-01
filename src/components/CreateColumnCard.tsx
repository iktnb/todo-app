import type { Dispatch, FormEvent, SetStateAction } from 'react'

interface CreateColumnCardProps {
  columnInput: string
  setColumnInput: Dispatch<SetStateAction<string>>
  onAddColumn: (event: FormEvent<HTMLFormElement>) => void
}

export function CreateColumnCard({
  columnInput,
  setColumnInput,
  onAddColumn,
}: CreateColumnCardProps) {
  return (
    <article className="column create-column">
      <h2>Создать столбик</h2>
      <form className="create-column-form" onSubmit={onAddColumn}>
        <input
          type="text"
          value={columnInput}
          onChange={(event) => setColumnInput(event.target.value)}
          placeholder="Например: In Progress"
          aria-label="Название нового столбика"
        />
        <button type="submit">+ Создать</button>
      </form>
    </article>
  )
}
