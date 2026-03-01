export const ItemSource = {
  Manual: "manual",
  Email: "email",
  Import: "import",
  Legacy: "legacy",
} as const;

export type ItemSource = (typeof ItemSource)[keyof typeof ItemSource];
