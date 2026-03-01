import type { TranslationMessages } from "../types";
import { appEnTranslations } from "./app";
import { boardEnTranslations } from "./board";
import { guideEnTranslations } from "./guide";
import { headerEnTranslations } from "./header";
import { projectsEnTranslations } from "./projects";
import { workflowsEnTranslations } from "./workflows";

export const enTranslations: TranslationMessages = {
  ...appEnTranslations,
  ...headerEnTranslations,
  ...boardEnTranslations,
  ...guideEnTranslations,
  ...projectsEnTranslations,
  ...workflowsEnTranslations,
};
