import type { Context } from '../types/gtd'

export const DEFAULT_CONTEXTS: Context[] = [
  {
    id: 'context-computer',
    name: '@computer',
    description: 'Digital work requiring a computer',
  },
  {
    id: 'context-phone',
    name: '@phone',
    description: 'Calls and messages',
  },
  {
    id: 'context-home',
    name: '@home',
    description: 'Actions tied to home location',
  },
  {
    id: 'context-deep-work',
    name: '@deep-work',
    description: 'Focused work requiring concentration',
  },
  {
    id: 'context-5min',
    name: '@5min',
    description: 'Quick actions that fit short windows',
  },
]
