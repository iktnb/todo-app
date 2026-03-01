import type { NextAction, Project } from "../../../types/gtd";
import {
  NextActionStatusEnum,
  ProjectStatusEnum,
} from "../../../types/gtd";

export function countActiveProjectActions(
  nextActions: NextAction[],
  projectId: string,
): number {
  return nextActions.filter(
    (nextAction) =>
      nextAction.projectId === projectId &&
      nextAction.status === NextActionStatusEnum.Active,
  ).length;
}

export function findBlockingProjectByNextAction(params: {
  nextActionId: string;
  sourceNextActions: NextAction[];
  projects: Project[];
}): Project | null {
  const { nextActionId, sourceNextActions, projects } = params;
  const nextAction = sourceNextActions.find(
    (currentAction) => currentAction.id === nextActionId,
  );
  if (
    !nextAction ||
    nextAction.status !== NextActionStatusEnum.Active ||
    !nextAction.projectId
  ) {
    return null;
  }

  const relatedProject = projects.find(
    (project) => project.id === nextAction.projectId,
  );
  if (!relatedProject || relatedProject.status !== ProjectStatusEnum.Active) {
    return null;
  }

  const activeProjectActionsCount = countActiveProjectActions(
    sourceNextActions,
    relatedProject.id,
  );
  if (activeProjectActionsCount > 1) {
    return null;
  }

  return relatedProject;
}
