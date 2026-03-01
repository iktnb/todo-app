export const TrashReason = {
  Irrelevant: "irrelevant",
  Duplicate: "duplicate",
  NoLongerNeeded: "no_longer_needed",
} as const;

export type TrashReason = (typeof TrashReason)[keyof typeof TrashReason];
