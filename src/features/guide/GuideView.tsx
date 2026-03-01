import { useI18n } from "../../i18n/useI18n";

interface GuideViewProps {
  onNavigate: (mode: "board" | "engage" | "projects" | "review") => void;
}

export function GuideView({ onNavigate }: GuideViewProps) {
  const { t } = useI18n();
  return (
    <section
      className="mt-5 grid min-h-0 gap-3 overflow-y-auto pr-1 max-md:pr-0"
      aria-label={t("guide.aria")}
    >
      <article className="grid gap-3 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h2 className="m-0 text-xl text-slate-100">{t("guide.title")}</h2>
        <p className="m-0 text-sm text-slate-300">{t("guide.intro")}</p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">
          {t("guide.capture.title")}
        </h3>
        <p className="m-0 text-sm text-slate-300">{t("guide.capture.body")}</p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">
          {t("guide.clarify.title")}
        </h3>
        <p className="m-0 text-sm text-slate-300">{t("guide.clarify.body")}</p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">
          {t("guide.engage.title")}
        </h3>
        <p className="m-0 text-sm text-slate-300">{t("guide.engage.body")}</p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">
          {t("guide.projects.title")}
        </h3>
        <p className="m-0 text-sm text-slate-300">{t("guide.projects.body")}</p>
      </article>

      <article className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-4">
        <h3 className="m-0 text-base text-slate-100">
          {t("guide.review.title")}
        </h3>
        <p className="m-0 text-sm text-slate-300">{t("guide.review.body")}</p>
      </article>

      <article className="grid gap-3 rounded-2xl border border-sky-400/35 bg-sky-400/10 p-4">
        <h3 className="m-0 text-base text-sky-100">
          {t("guide.quickStart.title")}
        </h3>
        <ol className="m-0 grid gap-1.5 pl-5 text-sm text-sky-50">
          <li>{t("guide.quickStart.step1")}</li>
          <li>{t("guide.quickStart.step2")}</li>
          <li>{t("guide.quickStart.step3")}</li>
          <li>{t("guide.quickStart.step4")}</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <button
            className="cursor-pointer rounded-[10px] border border-sky-400/60 bg-sky-400/18 px-3 py-1.5 text-sm font-semibold text-sky-100"
            type="button"
            onClick={() => onNavigate("board")}
          >
            {t("guide.goInbox")}
          </button>
          <button
            className="cursor-pointer rounded-[10px] border border-violet-400/55 bg-violet-400/18 px-3 py-1.5 text-sm font-semibold text-violet-100"
            type="button"
            onClick={() => onNavigate("engage")}
          >
            {t("guide.goEngage")}
          </button>
        </div>
      </article>
    </section>
  );
}
