import type Database from 'better-sqlite3'
import { hostname } from 'os'
import { getDb } from '../db/connection'
import { AppError } from '@shared/types/error'
import { getSettings, updateSettings } from './settingsService'
import type {
  SyncBillRecord,
  SyncCategoryRecord,
  SyncPayload,
  SyncResult,
  SyncStatus,
  SyncTransactionRecord
} from '@shared/types/sync'

// The remote store is a Google Apps Script Web App (deployed by the user under their own
// Google account, "execute as: me" + "who has access: anyone") that reads/writes a single
// Drive file on GET/POST. A plain Drive share link can't support authenticated writes from an
// unauthenticated client, so this relay is what makes bidirectional sync possible without OAuth
// on either device. See Kakeibo-mobile/src/services/syncService.ts for the mobile counterpart —
// keep both in sync if the merge algorithm changes.

export function getSyncStatus(): SyncStatus {
  const settings = getSettings()
  return { endpointUrl: settings.syncEndpointUrl, lastSyncedAt: settings.lastSyncedAt }
}

export function setSyncEndpointUrl(url: string): SyncStatus {
  updateSettings({ syncEndpointUrl: url.trim() })
  return getSyncStatus()
}

function requireEndpointUrl(): string {
  const settings = getSettings()
  if (!settings.syncEndpointUrl) {
    throw new AppError('SYNC_FOLDER_NOT_SET', 'sync endpoint URL has not been set yet')
  }
  return settings.syncEndpointUrl
}

interface CategoryRow {
  uuid: string
  type: 'income' | 'expense'
  name: string
  name_key: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_system: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface BillRow {
  uuid: string
  name: string
  start_date: string
  end_date: string
  status: 'active' | 'closed'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface TransactionJoinRow {
  uuid: string
  bill_uuid: string
  category_uuid: string
  date: string
  type: 'income' | 'expense'
  amount: number
  note: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// No `deleted_at IS NULL` filtering anywhere in here — a deleted row still has to be exported
// (tombstone and all) or the other device has no way to learn it was deleted at all.
function buildPayload(db: Database.Database): SyncPayload {
  const categories = db.prepare('SELECT * FROM categories').all() as CategoryRow[]
  const bills = db.prepare('SELECT * FROM bills').all() as BillRow[]
  const transactions = db
    .prepare(
      `SELECT t.uuid, b.uuid as bill_uuid, c.uuid as category_uuid, t.date, t.type,
              t.amount, t.note, t.created_at, t.updated_at, t.deleted_at
       FROM transactions t
       JOIN bills b ON b.id = t.bill_id
       JOIN categories c ON c.id = t.category_id`
    )
    .all() as TransactionJoinRow[]

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    deviceId: `desktop-${hostname()}`,
    categories: categories.map(
      (c): SyncCategoryRecord => ({
        uuid: c.uuid,
        type: c.type,
        name: c.name,
        nameKey: c.name_key,
        icon: c.icon,
        color: c.color,
        sortOrder: c.sort_order,
        isSystem: !!c.is_system,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        deletedAt: c.deleted_at
      })
    ),
    bills: bills.map(
      (b): SyncBillRecord => ({
        uuid: b.uuid,
        name: b.name,
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
        deletedAt: b.deleted_at
      })
    ),
    transactions: transactions.map(
      (t): SyncTransactionRecord => ({
        uuid: t.uuid,
        billUuid: t.bill_uuid,
        categoryUuid: t.category_uuid,
        date: t.date,
        type: t.type,
        amount: t.amount,
        note: t.note,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        deletedAt: t.deleted_at
      })
    )
  }
}

// SQLite's `datetime('now')` (used for every desktop-side created_at/updated_at/deleted_at) returns
// UTC time formatted as "YYYY-MM-DD HH:MM:SS" — no 'T', no 'Z'. The mobile app instead writes real
// ISO-8601 UTC strings via `Date.prototype.toISOString()`. JS's `Date` constructor only parses a
// string as UTC when it has a 'Z'/offset in the strict ISO shape; a bare "YYYY-MM-DD HH:MM:SS"
// string falls back to being parsed as *local* time. On any machine whose timezone isn't UTC (e.g.
// JST, UTC+9), that silently shifts every desktop-authored timestamp by the local offset when
// compared here — which let an older mobile edit look "newer" than a same-day desktop delete and
// revive the deleted record on the next sync. Normalize both shapes to a real UTC instant first.
function toEpoch(value: string): number {
  const isBareSqliteDatetime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
  return new Date(isBareSqliteDatetime ? `${value.replace(' ', 'T')}Z` : value).getTime()
}

function isNewer(remoteUpdatedAt: string, localUpdatedAt: string): boolean {
  return toEpoch(remoteUpdatedAt) > toEpoch(localUpdatedAt)
}

// Merge strategy for every table: last-write-wins by `updatedAt`, matched by `uuid`.
// A record present locally but absent from the remote payload is left untouched — it will
// be included in this device's next export and eventually reach the other device.
// Deletion is a soft delete (`deleted_at` set, row otherwise untouched) rather than a physical
// DELETE, specifically so it can propagate through this same last-write-wins comparison: deleting
// a record just bumps its `updated_at` like any other edit, so whichever happened later — an
// edit on one device or a delete on the other — wins normally, instead of a deleted row getting
// silently re-inserted by the next sync because the deleting device has "no record" of it anymore.
function mergeCategories(db: Database.Database, records: SyncCategoryRecord[]): number {
  let count = 0
  const findStmt = db.prepare('SELECT updated_at FROM categories WHERE uuid = ?')
  // Both desktop and mobile independently seed the same set of default categories (same
  // name_key, different random uuid per device). Without this, syncing would duplicate every
  // default category instead of recognizing them as "the same" category on both sides.
  const findByNameKeyStmt = db.prepare(
    'SELECT id FROM categories WHERE name_key = ? AND uuid <> ? LIMIT 1'
  )
  // Fallback for a record with no name_key match: if a local category already has the exact
  // same (type, name) under a different uuid, treat it as "the same category" too rather than
  // inserting a second row — that insert would otherwise crash on the (type, name) unique index
  // (this is how a duplicate default/user category on one device used to break sync entirely).
  const findByNameStmt = db.prepare(
    'SELECT id FROM categories WHERE type = ? AND name = ? AND uuid <> ? LIMIT 1'
  )
  const adoptUuidStmt = db.prepare('UPDATE categories SET uuid = ? WHERE id = ?')
  const insertStmt = db.prepare(
    `INSERT INTO categories (uuid, type, name, name_key, icon, color, sort_order, is_system, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const updateStmt = db.prepare(
    `UPDATE categories SET type = ?, name = ?, name_key = ?, icon = ?, color = ?, sort_order = ?, is_system = ?, updated_at = ?, deleted_at = ?
     WHERE uuid = ?`
  )

  for (const r of records) {
    let existing = findStmt.get(r.uuid) as { updated_at: string } | undefined
    if (!existing && r.nameKey) {
      const seedMatch = findByNameKeyStmt.get(r.nameKey, r.uuid) as { id: number } | undefined
      if (seedMatch) {
        adoptUuidStmt.run(r.uuid, seedMatch.id)
        existing = findStmt.get(r.uuid) as { updated_at: string } | undefined
      }
    }
    if (!existing) {
      const nameMatch = findByNameStmt.get(r.type, r.name, r.uuid) as { id: number } | undefined
      if (nameMatch) {
        adoptUuidStmt.run(r.uuid, nameMatch.id)
        existing = findStmt.get(r.uuid) as { updated_at: string } | undefined
      }
    }
    if (!existing) {
      insertStmt.run(
        r.uuid,
        r.type,
        r.name,
        r.nameKey,
        r.icon,
        r.color,
        r.sortOrder,
        r.isSystem ? 1 : 0,
        r.createdAt,
        r.updatedAt,
        r.deletedAt
      )
      count++
    } else if (isNewer(r.updatedAt, existing.updated_at)) {
      updateStmt.run(
        r.type,
        r.name,
        r.nameKey,
        r.icon,
        r.color,
        r.sortOrder,
        r.isSystem ? 1 : 0,
        r.updatedAt,
        r.deletedAt,
        r.uuid
      )
      count++
    }
  }
  return count
}

function mergeBills(db: Database.Database, records: SyncBillRecord[]): number {
  let count = 0
  const findStmt = db.prepare('SELECT updated_at FROM bills WHERE uuid = ?')
  const insertStmt = db.prepare(
    `INSERT INTO bills (uuid, name, start_date, end_date, status, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const updateStmt = db.prepare(
    `UPDATE bills SET name = ?, start_date = ?, end_date = ?, status = ?, updated_at = ?, deleted_at = ? WHERE uuid = ?`
  )

  for (const r of records) {
    const existing = findStmt.get(r.uuid) as { updated_at: string } | undefined
    if (!existing) {
      insertStmt.run(
        r.uuid,
        r.name,
        r.startDate,
        r.endDate,
        r.status,
        r.createdAt,
        r.updatedAt,
        r.deletedAt
      )
      count++
    } else if (isNewer(r.updatedAt, existing.updated_at)) {
      updateStmt.run(r.name, r.startDate, r.endDate, r.status, r.updatedAt, r.deletedAt, r.uuid)
      count++
    }
  }
  return count
}

// Merging bills can leave more than one row with status='active' (e.g. each device had
// activated a different bill since the last sync). Keep only the most recently updated one
// active — the single-active-bill invariant is enforced procedurally, not by a DB constraint.
function fixupSingleActiveBill(db: Database.Database): void {
  const activeBills = db
    .prepare("SELECT id, updated_at FROM bills WHERE status = 'active' AND deleted_at IS NULL")
    .all() as { id: number; updated_at: string }[]
  if (activeBills.length <= 1) return
  // Sort in JS via toEpoch rather than `ORDER BY updated_at` — a plain SQL sort compares the
  // mixed desktop/mobile timestamp strings lexicographically, which has the same cross-format
  // pitfall as the old isNewer() (see comment above it).
  activeBills.sort((a, b) => toEpoch(b.updated_at) - toEpoch(a.updated_at))
  const closeStmt = db.prepare("UPDATE bills SET status = 'closed' WHERE id = ?")
  for (const bill of activeBills.slice(1)) closeStmt.run(bill.id)
}

function mergeTransactions(db: Database.Database, records: SyncTransactionRecord[]): number {
  let count = 0
  const findBillStmt = db.prepare('SELECT id FROM bills WHERE uuid = ?')
  const findCategoryStmt = db.prepare('SELECT id FROM categories WHERE uuid = ?')
  const findTxStmt = db.prepare('SELECT updated_at FROM transactions WHERE uuid = ?')
  const insertStmt = db.prepare(
    `INSERT INTO transactions (uuid, bill_id, date, type, category_id, amount, note, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const updateStmt = db.prepare(
    `UPDATE transactions SET bill_id = ?, date = ?, type = ?, category_id = ?, amount = ?, note = ?, updated_at = ?, deleted_at = ?
     WHERE uuid = ?`
  )

  for (const r of records) {
    const bill = findBillStmt.get(r.billUuid) as { id: number } | undefined
    const category = findCategoryStmt.get(r.categoryUuid) as { id: number } | undefined
    // The referenced bill/category ships in the same payload (export always includes every
    // category and bill), so this should always resolve; skip defensively if it doesn't.
    if (!bill || !category) continue

    const existing = findTxStmt.get(r.uuid) as { updated_at: string } | undefined
    if (!existing) {
      insertStmt.run(
        r.uuid,
        bill.id,
        r.date,
        r.type,
        category.id,
        r.amount,
        r.note,
        r.createdAt,
        r.updatedAt,
        r.deletedAt
      )
      count++
    } else if (isNewer(r.updatedAt, existing.updated_at)) {
      updateStmt.run(
        bill.id,
        r.date,
        r.type,
        category.id,
        r.amount,
        r.note,
        r.updatedAt,
        r.deletedAt,
        r.uuid
      )
      count++
    }
  }
  return count
}

function isSyncPayload(value: unknown): value is SyncPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as SyncPayload).categories) &&
    Array.isArray((value as SyncPayload).bills) &&
    Array.isArray((value as SyncPayload).transactions)
  )
}

async function fetchRemotePayload(endpointUrl: string): Promise<SyncPayload | null> {
  let response: Response
  try {
    response = await fetch(endpointUrl)
  } catch {
    throw new AppError('SYNC_FOLDER_NOT_SET', '无法连接到同步地址，请检查网址和网络连接')
  }
  if (!response.ok) {
    throw new AppError('SYNC_FOLDER_NOT_SET', `同步地址返回错误（HTTP ${response.status}）`)
  }
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new AppError('SYNC_FOLDER_NOT_SET', '同步地址返回的内容不是有效的数据，请检查网址是否正确')
  }
  // The freshly-deployed Apps Script returns '{}' for a brand-new sync file (nothing to
  // import yet) — treat that the same as "no remote data" rather than a malformed payload.
  return isSyncPayload(data) ? data : null
}

async function importSyncFile(): Promise<{
  categories: number
  bills: number
  transactions: number
}> {
  const endpointUrl = requireEndpointUrl()
  const payload = await fetchRemotePayload(endpointUrl)
  if (!payload) {
    return { categories: 0, bills: 0, transactions: 0 }
  }
  const db = getDb()

  const run = db.transaction(() => {
    const categories = mergeCategories(db, payload.categories)
    const bills = mergeBills(db, payload.bills)
    fixupSingleActiveBill(db)
    const transactions = mergeTransactions(db, payload.transactions)
    return { categories, bills, transactions }
  })
  return run()
}

async function exportSyncFile(): Promise<void> {
  const endpointUrl = requireEndpointUrl()
  const payload = buildPayload(getDb())
  let response: Response
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
  } catch {
    throw new AppError('SYNC_FOLDER_NOT_SET', '无法连接到同步地址，请检查网址和网络连接')
  }
  if (!response.ok) {
    throw new AppError('SYNC_FOLDER_NOT_SET', `同步地址返回错误（HTTP ${response.status}）`)
  }
}

// A sync round always imports first, then exports — so the file this device writes back
// carries the union of both sides' data, which is what lets the *other* device catch up on
// its own next sync.
export async function syncNow(): Promise<SyncResult> {
  const imported = await importSyncFile()
  await exportSyncFile()
  const now = new Date().toISOString()
  updateSettings({ lastSyncedAt: now })
  return {
    performed: true,
    importedCategories: imported.categories,
    importedBills: imported.bills,
    importedTransactions: imported.transactions,
    exportedAt: now
  }
}
