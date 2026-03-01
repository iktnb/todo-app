export const NextActionEnergy = {
  Low: "low",
  Medium: "medium",
  High: "high",
} as const;

export type NextActionEnergy =
  (typeof NextActionEnergy)[keyof typeof NextActionEnergy];
