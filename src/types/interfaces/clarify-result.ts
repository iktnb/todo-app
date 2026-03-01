import type { ClarifyOutcome } from '../enums/clarify-outcome'

export interface ClarifyResult {
  outcome: ClarifyOutcome
  itemTitle: string
}
