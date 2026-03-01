import type { TranslationMessages } from "../types";
import { appUkTranslations } from "./app";
import { boardUkTranslations } from "./board";
import { guideUkTranslations } from "./guide";
import { headerUkTranslations } from "./header";
import { projectsUkTranslations } from "./projects";
import { workflowsUkTranslations } from "./workflows";

export const ukTranslations: TranslationMessages = {
  ...appUkTranslations,
  ...headerUkTranslations,
  ...boardUkTranslations,
  ...guideUkTranslations,
  ...projectsUkTranslations,
  ...workflowsUkTranslations,
};
