export const ProjectStatus = {
  Active: "active",
  OnHold: "on_hold",
  Done: "done",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
