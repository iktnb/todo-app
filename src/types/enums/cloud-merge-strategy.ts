export const CloudMergeStrategy = {
  ReplaceLocal: "replace_local",
  Merge: "merge",
} as const;

export type CloudMergeStrategy =
  (typeof CloudMergeStrategy)[keyof typeof CloudMergeStrategy];
