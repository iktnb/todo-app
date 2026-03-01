import { INBOX_COLUMN } from "../../../constants/board";
import { TaskStatusEnum } from "../../../types/board";
import type { Task } from "../../../types/board";
import {
  NextActionStatusEnum,
  ProjectHealthEnum,
  ProjectStatusEnum,
} from "../../../types/gtd";
import type { Item, NextAction, Project, ProjectHealth } from "../../../types/gtd";

function byNewestCreatedAt(firstIso: string, secondIso: string): number {
  return new Date(secondIso).getTime() - new Date(firstIso).getTime();
}

export function selectInboxItems(items: Item[]): Item[] {
  return items
    .filter((item) => !item.clarified)
    .sort((firstItem, secondItem) =>
      byNewestCreatedAt(firstItem.createdAt, secondItem.createdAt),
    );
}

export function selectInboxTasks(tasks: Task[], itemById: Map<string, Item>): Task[] {
  return tasks
    .filter((task) => {
      if (task.columnId !== INBOX_COLUMN.id) {
        return false;
      }
      if (task.status === TaskStatusEnum.Waiting) {
        return false;
      }
      const relatedItem = itemById.get(task.id);
      return relatedItem === undefined || !relatedItem.clarified;
    })
    .sort((firstTask, secondTask) =>
      byNewestCreatedAt(firstTask.createdAt, secondTask.createdAt),
    );
}

export function selectWaitingInboxTasks(
  tasks: Task[],
  itemById: Map<string, Item>,
): Task[] {
  return tasks
    .filter((task) => {
      if (task.columnId !== INBOX_COLUMN.id) {
        return false;
      }
      if (task.status !== TaskStatusEnum.Waiting) {
        return false;
      }
      const relatedItem = itemById.get(task.id);
      return relatedItem === undefined || !relatedItem.clarified;
    })
    .sort((firstTask, secondTask) => {
      const firstDeadline = new Date(firstTask.waitingDeadline ?? "").getTime();
      const secondDeadline = new Date(secondTask.waitingDeadline ?? "").getTime();
      const firstIsInvalid = Number.isNaN(firstDeadline);
      const secondIsInvalid = Number.isNaN(secondDeadline);

      if (firstIsInvalid && secondIsInvalid) {
        return byNewestCreatedAt(firstTask.createdAt, secondTask.createdAt);
      }
      if (firstIsInvalid) {
        return 1;
      }
      if (secondIsInvalid) {
        return -1;
      }
      return firstDeadline - secondDeadline;
    });
}

export function selectProjectHealthById(
  projects: Project[],
  nextActions: NextAction[],
): Record<string, ProjectHealth> {
  const activeActionCountsByProjectId: Record<string, number> = {};
  for (const nextAction of nextActions) {
    if (
      nextAction.status !== NextActionStatusEnum.Active ||
      nextAction.projectId == null
    ) {
      continue;
    }
    activeActionCountsByProjectId[nextAction.projectId] =
      (activeActionCountsByProjectId[nextAction.projectId] ?? 0) + 1;
  }

  const healthById: Record<string, ProjectHealth> = {};
  for (const project of projects) {
    if (project.status !== ProjectStatusEnum.Active) {
      healthById[project.id] = ProjectHealthEnum.Healthy;
      continue;
    }
    const activeProjectActionsCount = activeActionCountsByProjectId[project.id] ?? 0;
    healthById[project.id] =
      activeProjectActionsCount > 0
        ? ProjectHealthEnum.Healthy
        : ProjectHealthEnum.MissingNextAction;
  }
  return healthById;
}

export function selectDashboardActivityByDate(params: {
  completionCountsByDate: Record<string, number>;
  tasks: Task[];
  nextActions: NextAction[];
  projects: Project[];
}): Record<string, number> {
  const { completionCountsByDate, tasks, nextActions, projects } = params;
  if (Object.keys(completionCountsByDate).length > 0) {
    return completionCountsByDate;
  }

  const byDate: Record<string, number> = {};
  const allCompletedAtValues = [
    ...tasks
      .filter((task) => task.status === TaskStatusEnum.Done)
      .map((task) => task.completedAt)
      .filter((completedAt): completedAt is string => !!completedAt),
    ...nextActions
      .filter((nextAction) => nextAction.status === NextActionStatusEnum.Done)
      .map((nextAction) => nextAction.completedAt)
      .filter((completedAt): completedAt is string => !!completedAt),
    ...projects
      .filter((project) => project.status === ProjectStatusEnum.Done)
      .map((project) => project.completedAt)
      .filter((completedAt): completedAt is string => !!completedAt),
  ];
  for (const completedAt of allCompletedAtValues) {
    const dayKey = completedAt.slice(0, 10);
    byDate[dayKey] = (byDate[dayKey] ?? 0) + 1;
  }
  return byDate;
}
