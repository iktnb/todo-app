import { enTranslations } from "./translations/en";
import { ukTranslations } from "./translations/uk";

export const SUPPORTED_LOCALES = ["en", "uk"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const translations: Record<SupportedLocale, Record<string, string>> = {
  en: enTranslations,
  uk: ukTranslations,
};
