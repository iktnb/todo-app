export const NextActionStatus = {
  Active: "active",
  Done: "done",
} as const;

export type NextActionStatus =
  (typeof NextActionStatus)[keyof typeof NextActionStatus];
