import dayjs from 'dayjs'
import { getDb } from '../db/connection'
import { AppError } from '@shared/types/error'
import type { Bill, BillCreateInput, BillUpdateInput } from '@shared/types/bill'

interface BillRow {
  id: number
  name: string
  start_date: string
  end_date: string
  status: 'active' | 'closed'
  created_at: string
  updated_at: string
}

function rowToBill(row: BillRow): Bill {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const DATE_FORMAT_RE = /^\d{4}-\d{2}-\d{2}$/

function validateRange(startDate: string, endDate: string): void {
  if (
    !DATE_FORMAT_RE.test(startDate) ||
    !DATE_FORMAT_RE.test(endDate) ||
    !dayjs(startDate).isValid() ||
    !dayjs(endDate).isValid()
  ) {
    throw new AppError('BILL_INVALID_DATE_RANGE', 'dates must be in YYYY-MM-DD format')
  }
  if (dayjs(endDate).isBefore(dayjs(startDate))) {
    throw new AppError('BILL_INVALID_DATE_RANGE', 'end date must not be before start date')
  }
}

export function listBills(): Bill[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM bills ORDER BY start_date DESC').all() as BillRow[]
  return rows.map(rowToBill)
}

export function getBill(id: number): Bill {
  const db = getDb()
  const row = db.prepare('SELECT * FROM bills WHERE id = ?').get(id) as BillRow | undefined
  if (!row) {
    throw new AppError('BILL_NOT_FOUND', `bill ${id} not found`)
  }
  return rowToBill(row)
}

export function getActiveBill(): Bill | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM bills WHERE status = 'active' LIMIT 1").get() as
    | BillRow
    | undefined
  return row ? rowToBill(row) : null
}

export function createBill(input: BillCreateInput): Bill {
  validateRange(input.startDate, input.endDate)
  const db = getDb()
  const name = input.name?.trim() || `${input.startDate} ~ ${input.endDate}`
  const hasActiveBill = db.prepare("SELECT 1 FROM bills WHERE status = 'active' LIMIT 1").get()
  const status: 'active' | 'closed' = hasActiveBill ? 'closed' : 'active'
  const result = db
    .prepare('INSERT INTO bills (name, start_date, end_date, status) VALUES (?, ?, ?, ?)')
    .run(name, input.startDate, input.endDate, status)
  return getBill(result.lastInsertRowid as number)
}

export function activateBill(id: number): Bill {
  const db = getDb()
  getBill(id)
  const activate = db.transaction((billId: number) => {
    db.prepare("UPDATE bills SET status = 'closed', updated_at = datetime('now') WHERE status = 'active'").run()
    db.prepare("UPDATE bills SET status = 'active', updated_at = datetime('now') WHERE id = ?").run(billId)
  })
  activate(id)
  return getBill(id)
}

export function updateBill(id: number, input: BillUpdateInput): Bill {
  const db = getDb()
  const current = getBill(id)

  if (input.startDate !== undefined || input.endDate !== undefined) {
    validateRange(input.startDate ?? current.startDate, input.endDate ?? current.endDate)
  }

  const fields: string[] = []
  const params: unknown[] = []
  if (input.name !== undefined) {
    fields.push('name = ?')
    params.push(input.name)
  }
  if (input.startDate !== undefined) {
    fields.push('start_date = ?')
    params.push(input.startDate)
  }
  if (input.endDate !== undefined) {
    fields.push('end_date = ?')
    params.push(input.endDate)
  }
  if (input.status !== undefined) {
    fields.push('status = ?')
    params.push(input.status)
  }
  fields.push("updated_at = datetime('now')")
  params.push(id)

  db.prepare(`UPDATE bills SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  return getBill(id)
}

export function deleteBill(id: number): void {
  const db = getDb()
  getBill(id)
  db.prepare('DELETE FROM bills WHERE id = ?').run(id)
}
