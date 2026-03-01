import type { ItemSource } from '../enums/item-source'

export interface Item {
  id: string
  title: string
  notes: string
  createdAt: string
  source: ItemSource
  clarified: boolean
  clarifiedAt?: string
}
