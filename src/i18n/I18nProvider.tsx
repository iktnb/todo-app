import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SUPPORTED_LOCALES,
  translations,
  type SupportedLocale,
} from "./translations";
import { I18nContext, type I18nContextValue } from "./i18n-context";

type InterpolationValues = Record<string, string | number>;

const LOCALE_STORAGE_KEY = "flowanchor.todo.locale";

function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

function detectInitialLocale(): SupportedLocale {
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith("uk")) {
    return "uk";
  }

  return "en";
}

function applyInterpolation(
  template: string,
  values?: InterpolationValues,
): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    if (!(token in values)) {
      return "";
    }
    return String(values[token]);
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(() =>
    detectInitialLocale(),
  );

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, values?: InterpolationValues) => {
      const message = translations[locale][key] ?? translations.en[key] ?? key;
      return applyInterpolation(message, values);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
