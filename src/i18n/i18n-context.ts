import { createContext, useContext } from "react";
import type { SupportedLocale } from "./translations";

type InterpolationValues = Record<string, string | number>;

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (nextLocale: SupportedLocale) => void;
  t: (key: string, values?: InterpolationValues) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within I18nProvider");
  }
  return context;
}
