export const HeatmapSensitivity = {
  Low: "low",
  Balanced: "balanced",
  High: "high",
} as const;

export type HeatmapSensitivity =
  (typeof HeatmapSensitivity)[keyof typeof HeatmapSensitivity];
