interface GuideViewProps {
  onNavigate: (mode: 'board' | 'engage' | 'projects' | 'review') => void
}

export function GuideView({ onNavigate }: GuideViewProps) {
  return (
    <section
      className="mt-5 grid min-h-0 gap-3 overflow-y-auto pr-1"
      aria-label="Руководство по GTD приложению"
    >
      <article className="grid gap-3 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h2 className="m-0 text-xl text-slate-100">Руководство</h2>
        <p className="m-0 text-sm text-slate-300">
          Это приложение построено на GTD (Getting Things Done): сначала вы фиксируете мысль,
          потом уточняете, что это значит, и только после этого выполняете.
        </p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">1) Capture — Inbox</h3>
        <p className="m-0 text-sm text-slate-300">
          В режиме <strong>Inbox</strong> записывайте входящие мысли как есть. Не
          думайте о приоритете и сроках в момент захвата.
        </p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">2) Clarify — кнопка Clarify</h3>
        <p className="m-0 text-sm text-slate-300">
          Для каждого элемента Inbox запустите <strong>Clarify</strong> и ответьте на два вопроса:
          это actionable и это one-step? После этого элемент станет NextAction, Project, Someday
          или уйдет в Trash.
        </p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">3) Engage — режим Engage</h3>
        <p className="m-0 text-sm text-slate-300">
          В режиме <strong>Engage</strong> выбирайте действия по контексту ({'@'}computer,
          {'@'}phone и т.д.) и отмечайте выполненные шаги кнопкой <strong>Done</strong>.
        </p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">4) Projects — режим Projects</h3>
        <p className="m-0 text-sm text-slate-300">
          Проект — это желаемый результат из нескольких шагов. Следите, чтобы у каждого активного
          проекта был хотя бы один активный NextAction.
        </p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">5) Weekly Review — режим Weekly Review</h3>
        <p className="m-0 text-sm text-slate-300">
          Раз в неделю пройдите полный обзор: очистите Inbox, проверьте проекты и зафиксируйте
          фокус на следующую неделю.
        </p>
      </article>

      <article className="grid gap-3 rounded-2xl border border-sky-400/35 bg-sky-400/10 p-4">
        <h3 className="m-0 text-base text-sky-100">Быстрый старт (5 минут)</h3>
        <ol className="m-0 grid gap-1.5 pl-5 text-sm text-sky-50">
          <li>Добавьте 3-5 входящих items в Inbox.</li>
          <li>Уточните каждый item через Clarify.</li>
          <li>Откройте Engage и выполните 1-2 NextAction.</li>
          <li>Проверьте Projects и уберите элементы без следующего шага.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <button
            className="cursor-pointer rounded-[10px] border border-sky-400/60 bg-sky-400/18 px-3 py-1.5 text-sm font-semibold text-sky-100"
            type="button"
            onClick={() => onNavigate('board')}
          >
            Перейти в Inbox
          </button>
          <button
            className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/18 px-3 py-1.5 text-sm font-semibold text-violet-100"
            type="button"
            onClick={() => onNavigate('engage')}
          >
            Перейти в Engage
          </button>
        </div>
      </article>
    </section>
  )
}
