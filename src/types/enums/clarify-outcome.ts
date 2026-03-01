export const ClarifyOutcome = {
  NextAction: "next_action",
  Project: "project",
  Someday: "someday",
  Trash: "trash",
} as const;

export type ClarifyOutcome =
  (typeof ClarifyOutcome)[keyof typeof ClarifyOutcome];
