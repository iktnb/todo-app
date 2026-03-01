import type { ClarifyWizardStep } from "../enums/clarify-wizard-step";

export interface ClarifyDecisionState {
  step: ClarifyWizardStep;
  actionable?: boolean;
  oneStep?: boolean;
}
