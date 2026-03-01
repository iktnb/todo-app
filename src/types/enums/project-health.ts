export const ProjectHealth = {
  Healthy: "healthy",
  MissingNextAction: "missing_next_action",
} as const;

export type ProjectHealth = (typeof ProjectHealth)[keyof typeof ProjectHealth];
