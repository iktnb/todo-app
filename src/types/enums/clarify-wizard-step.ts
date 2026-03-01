export const ClarifyWizardStep = {
  Actionable: "actionable",
  OneStep: "one_step",
  NonActionable: "non_actionable",
  NextActionDetails: "next_action_details",
  ProjectDetails: "project_details",
  Confirm: "confirm",
} as const;

export type ClarifyWizardStep =
  (typeof ClarifyWizardStep)[keyof typeof ClarifyWizardStep];
