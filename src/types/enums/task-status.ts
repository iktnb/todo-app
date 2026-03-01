export const TaskStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Waiting: "waiting",
  Done: "done",
  Obsolete: "obsolete",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
