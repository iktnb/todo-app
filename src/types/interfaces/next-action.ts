import type { NextActionEnergy } from '../enums/next-action-energy'
import type { NextActionStatus } from '../enums/next-action-status'

export interface NextAction {
  id: string
  title: string
  notes?: string
  contextId: string
  timeEstimate?: number
  energy?: NextActionEnergy
  status: NextActionStatus
  projectId?: string | null
}
