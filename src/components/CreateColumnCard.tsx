import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useI18n } from "../i18n/useI18n";

interface CreateColumnCardProps {
  columnInput: string;
  setColumnInput: Dispatch<SetStateAction<string>>;
  onAddColumn: (event: FormEvent<HTMLFormElement>) => void;
}

export function CreateColumnCard({
  columnInput,
  setColumnInput,
  onAddColumn,
}: CreateColumnCardProps) {
  const { t } = useI18n();
  return (
    <article className="grid min-h-0 flex-[0_0_300px] content-start gap-2.5 rounded-2xl border border-dashed border-violet-400/50 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5 shadow-[0_18px_36px_rgba(2,6,23,0.45)] backdrop-blur-[8px] transition-[transform,border-color,box-shadow] duration-250 ease-in-out hover:-translate-y-0.5 hover:border-violet-400/55 hover:shadow-[0_24px_42px_rgba(2,6,23,0.55),0_0_20px_rgba(167,139,250,0.15)] max-md:basis-[min(290px,calc(100vw-48px))]">
      <h2 className="m-0 text-base text-violet-200 [text-shadow:0_0_10px_rgba(167,139,250,0.4)]">
        {t("column.create.title")}
      </h2>
      <form className="grid gap-2" onSubmit={onAddColumn}>
        <input
          className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out placeholder:text-slate-400 focus:border-sky-400/90 focus:bg-slate-900/90 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.22)] focus:outline-none"
          type="text"
          value={columnInput}
          onChange={(event) => setColumnInput(event.target.value)}
          placeholder={t("column.create.placeholder")}
          aria-label={t("column.create.aria")}
        />
        <button
          className="cursor-pointer rounded-[10px] border border-sky-400/50 bg-sky-400/12 px-2.5 py-2 font-semibold text-cyan-300 shadow-[0_0_16px_rgba(56,189,248,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px"
          type="submit"
        >
          {t("column.create.button")}
        </button>
      </form>
    </article>
  );
}
