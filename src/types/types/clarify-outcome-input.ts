import type { TrashReason } from '../enums/trash-reason'

export type ClarifyOutcomeInput =
  | {
      outcome: 'next_action'
      contextId: string
      title?: string
    }
  | {
      outcome: 'project'
      title: string
      notes?: string
    }
  | {
      outcome: 'someday'
      reviewAt?: string
      notes?: string
    }
  | {
      outcome: 'trash'
      reason?: TrashReason
    }
