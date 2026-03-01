import type { Context } from "../types/gtd";

export function createDefaultContexts(
  t: (key: string, values?: Record<string, string | number>) => string,
): Context[] {
  return [
    {
      id: "context-computer",
      name: "@computer",
      description: t("defaultContext.computer"),
    },
    {
      id: "context-phone",
      name: "@phone",
      description: t("defaultContext.phone"),
    },
    {
      id: "context-home",
      name: "@home",
      description: t("defaultContext.home"),
    },
    {
      id: "context-deep-work",
      name: "@deep-work",
      description: t("defaultContext.deepWork"),
    },
    {
      id: "context-5min",
      name: "@5min",
      description: t("defaultContext.fiveMin"),
    },
  ];
}
