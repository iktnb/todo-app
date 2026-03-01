import { ClarifyOutcome } from "../enums/clarify-outcome";
import type { TrashReason } from "../enums/trash-reason";

export type ClarifyOutcomeInput =
  | {
      outcome: typeof ClarifyOutcome.NextAction;
      contextId: string;
      title?: string;
    }
  | {
      outcome: typeof ClarifyOutcome.Project;
      title: string;
      notes?: string;
    }
  | {
      outcome: typeof ClarifyOutcome.Someday;
      reviewAt?: string;
      notes?: string;
    }
  | {
      outcome: typeof ClarifyOutcome.Trash;
      reason?: TrashReason;
    };
