import type { CategoryType } from './category'
import type { BillStatus } from './bill'

// The cross-device sync payload references categories/bills by `uuid`, never by the local
// integer `id` — two independently-seeded SQLite databases (desktop + mobile) assign integer
// ids independently, so only `uuid` reliably identifies "the same record" on both sides.
export interface SyncCategoryRecord {
  uuid: string
  type: CategoryType
  name: string
  seedKey: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface SyncBillRecord {
  uuid: string
  name: string
  startDate: string
  endDate: string
  status: BillStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface SyncTransactionRecord {
  uuid: string
  billUuid: string
  categoryUuid: string
  date: string
  type: CategoryType
  amount: number
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface SyncPayload {
  schemaVersion: 1
  exportedAt: string
  deviceId: string
  categories: SyncCategoryRecord[]
  bills: SyncBillRecord[]
  transactions: SyncTransactionRecord[]
}

export interface SyncResult {
  performed: boolean
  importedCategories: number
  importedBills: number
  importedTransactions: number
  exportedAt: string
}

export interface SyncStatus {
  endpointUrl: string | null
  lastSyncedAt: string | null
}
