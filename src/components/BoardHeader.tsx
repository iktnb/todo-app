export function BoardHeader() {
  return (
    <header className="rounded-2xl border border-sky-400/25 bg-[linear-gradient(155deg,rgba(17,24,39,0.95),rgba(15,23,42,0.92))] p-5 shadow-[0_0_20px_rgba(56,189,248,0.15),0_0_40px_rgba(56,189,248,0.08)] max-md:p-4">
      <h1 className="m-0 text-[clamp(1.65rem,2.4vw,2.05rem)] tracking-[0.03em] text-slate-50 [text-shadow:0_0_12px_rgba(56,189,248,0.6),0_0_24px_rgba(56,189,248,0.3)]">
        Task Board
      </h1>
      <p className="mt-2 mb-0 text-slate-300">
        Добавляй столбики как хочешь и перемещай задачи между ними.
      </p>
    </header>
  )
}
