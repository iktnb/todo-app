import type { ProjectStatus } from "../enums/project-status";

export interface Project {
  id: string;
  title: string;
  notes?: string;
  status: ProjectStatus;
  createdAt: string;
  reviewAt: string;
  lastReviewedAt?: string;
}
