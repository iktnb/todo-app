import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ITEM_TITLE_MAX_LENGTH } from "../constants/validation";
import { useI18n } from "../i18n/useI18n";

interface QuickCaptureFormProps {
  taskInput: string;
  setTaskInput: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function QuickCaptureForm({
  taskInput,
  setTaskInput,
  onSubmit,
}: QuickCaptureFormProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = () => setIsDesktop(mediaQuery.matches);

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    function handleShortcutFocus(event: KeyboardEvent) {
      if (!event.shiftKey || event.key !== "Enter" || isInputFocused) {
        return;
      }

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", handleShortcutFocus);
    return () => window.removeEventListener("keydown", handleShortcutFocus);
  }, [isDesktop, isInputFocused]);

  const inputPlaceholder =
    isDesktop && !isInputFocused
      ? t("header.quickCaptureFocusShortcutHint")
      : t("header.quickCapturePlaceholder");

  return (
    <form
      className="grid w-full grid-cols-[1fr_auto] gap-2 max-sm:grid-cols-1"
      onSubmit={onSubmit}
    >
      <div className="flex items-center gap-2 rounded-[10px] border border-slate-400/35 bg-slate-900/75 p-1 text-sm text-slate-200 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out focus-within:border-sky-400/90 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.22)]">
        <input
          ref={inputRef}
          className="w-full px-1 bg-transparent placeholder:text-slate-400 focus:outline-none"
          type="text"
          value={taskInput}
          onChange={(event) => setTaskInput(event.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          maxLength={ITEM_TITLE_MAX_LENGTH}
          placeholder={inputPlaceholder}
          aria-label={t("header.quickCaptureAria")}
        />
        <button
          className="cursor-pointer w-16 rounded-[10px] border border-sky-400/50 bg-sky-400/12 whitespace-nowrap text-base font-semibold text-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.2)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-in-out hover:-translate-y-px max-sm:w-full"
          type="submit"
        >
          {t("header.quickCaptureSubmit")}
        </button>
      </div>
    </form>
  );
}
