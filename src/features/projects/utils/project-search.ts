import type {
  Context,
  NextAction,
  Project,
  ProjectHealth,
  ProjectStatusFilter,
} from "../../../types/gtd";
import { ProjectHealthEnum, ProjectStatusFilterEnum } from "../../../types/gtd";

interface BuildProjectSearchableTextInput {
  project: Project;
  linkedActions: NextAction[];
  contextsById: Map<string, Context>;
  projectHealth: ProjectHealth;
}

interface FilterProjectsInput {
  projects: Project[];
  statusFilter: ProjectStatusFilter;
  searchQuery: string;
  contextsById: Map<string, Context>;
  projectHealthById: Record<string, ProjectHealth>;
  projectActions: (projectId: string) => NextAction[];
}

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function buildProjectSearchableText({
  project,
  linkedActions,
  contextsById,
  projectHealth,
}: BuildProjectSearchableTextInput) {
  const linkedActionSearchTokens = linkedActions.flatMap((nextAction) => {
    const context = contextsById.get(nextAction.contextId);
    return [
      nextAction.title,
      nextAction.notes ?? "",
      nextAction.status,
      context?.name ?? "",
      context?.description ?? "",
    ];
  });

  return normalizeSearchText(
    [
      project.title,
      project.notes ?? "",
      project.status,
      project.createdAt,
      project.reviewAt,
      project.lastReviewedAt ?? "",
      projectHealth,
      ...linkedActionSearchTokens,
    ].join(" "),
  );
}

export function filterProjects({
  projects,
  statusFilter,
  searchQuery,
  contextsById,
  projectHealthById,
  projectActions,
}: FilterProjectsInput) {
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const queryTokens = normalizedSearchQuery
    .split(/\s+/)
    .filter((token) => token.length > 0);

  return projects.filter((project) => {
    const hasStatusMatch =
      statusFilter === ProjectStatusFilterEnum.All ||
      project.status === statusFilter;

    if (!hasStatusMatch) {
      return false;
    }

    if (queryTokens.length === 0) {
      return true;
    }

    const linkedActions = projectActions(project.id);
    const projectHealth = projectHealthById[project.id] ?? ProjectHealthEnum.Healthy;
    const searchableText = buildProjectSearchableText({
      project,
      linkedActions,
      contextsById,
      projectHealth,
    });

    return queryTokens.every((token) => searchableText.includes(token));
  });
}
