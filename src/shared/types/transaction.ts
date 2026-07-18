import type { CategoryType } from './category'

export interface Transaction {
  id: number
  uuid: string
  billId: number
  date: string
  type: CategoryType
  categoryId: number
  /** stored as an integer in the smallest display unit (e.g. yen/cents x100) to avoid float drift */
  amount: number
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface TransactionCreateInput {
  billId: number
  date: string
  type: CategoryType
  categoryId: number
  amount: number
  note?: string | null
}

export interface TransactionUpdateInput {
  date?: string
  type?: CategoryType
  categoryId?: number
  amount?: number
  note?: string | null
}
