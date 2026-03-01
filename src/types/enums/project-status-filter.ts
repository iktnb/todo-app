import { ProjectStatus as ProjectStatusEnum } from "./project-status";

export const ProjectStatusFilter = {
  All: "all",
  Active: ProjectStatusEnum.Active,
  OnHold: ProjectStatusEnum.OnHold,
  Done: ProjectStatusEnum.Done,
} as const;

export type ProjectStatusFilter =
  (typeof ProjectStatusFilter)[keyof typeof ProjectStatusFilter];
