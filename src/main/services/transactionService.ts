import type Database from 'better-sqlite3'
import { getDb } from '../db/connection'
import { AppError } from '@shared/types/error'
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput
} from '@shared/types/transaction'
import type { CategoryType } from '@shared/types/category'
import { getBill } from './billService'

interface TransactionRow {
  id: number
  bill_id: number
  date: string
  type: CategoryType
  category_id: number
  subcategory_id: number | null
  amount: number
  note: string | null
  created_at: string
  updated_at: string
}

interface CategoryRow {
  id: number
  parent_id: number | null
  type: CategoryType
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    billId: row.bill_id,
    date: row.date,
    type: row.type,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    amount: row.amount,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function validateCategory(
  db: Database.Database,
  categoryId: number,
  subcategoryId: number | null | undefined,
  type: CategoryType
): void {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId) as
    | CategoryRow
    | undefined
  if (!category) {
    throw new AppError('CATEGORY_NOT_FOUND', `category ${categoryId} not found`)
  }
  if (category.parent_id != null) {
    throw new AppError(
      'TRANSACTION_CATEGORY_TYPE_MISMATCH',
      'transaction category must be a primary category, not a subcategory'
    )
  }
  if (category.type !== type) {
    throw new AppError(
      'TRANSACTION_CATEGORY_TYPE_MISMATCH',
      'category type does not match transaction type'
    )
  }
  if (subcategoryId != null) {
    const sub = db.prepare('SELECT * FROM categories WHERE id = ?').get(subcategoryId) as
      | CategoryRow
      | undefined
    if (!sub) {
      throw new AppError('CATEGORY_NOT_FOUND', `subcategory ${subcategoryId} not found`)
    }
    if (sub.parent_id !== categoryId) {
      throw new AppError(
        'TRANSACTION_CATEGORY_TYPE_MISMATCH',
        'subcategory must belong to the selected primary category'
      )
    }
  }
}

function validateDateInBillRange(billId: number, date: string): void {
  const bill = getBill(billId)
  if (date < bill.startDate || date > bill.endDate) {
    throw new AppError(
      'TRANSACTION_DATE_OUT_OF_RANGE',
      'transaction date must fall within the bill date range'
    )
  }
}

export function listTransactionsByBill(billId: number): Transaction[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM transactions WHERE bill_id = ? ORDER BY date, id')
    .all(billId) as TransactionRow[]
  return rows.map(rowToTransaction)
}

export function listTransactionsByDate(billId: number, date: string): Transaction[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM transactions WHERE bill_id = ? AND date = ? ORDER BY id')
    .all(billId, date) as TransactionRow[]
  return rows.map(rowToTransaction)
}

export function createTransaction(input: TransactionCreateInput): Transaction {
  const db = getDb()
  validateDateInBillRange(input.billId, input.date)
  validateCategory(db, input.categoryId, input.subcategoryId, input.type)

  const result = db
    .prepare(
      `INSERT INTO transactions (bill_id, date, type, category_id, subcategory_id, amount, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.billId,
      input.date,
      input.type,
      input.categoryId,
      input.subcategoryId ?? null,
      input.amount,
      input.note ?? null
    )
  const row = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(result.lastInsertRowid) as TransactionRow
  return rowToTransaction(row)
}

export function updateTransaction(id: number, input: TransactionUpdateInput): Transaction {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as
    | TransactionRow
    | undefined
  if (!existing) {
    throw new AppError('TRANSACTION_NOT_FOUND', `transaction ${id} not found`)
  }

  const nextDate = input.date ?? existing.date
  const nextType = input.type ?? existing.type
  const nextCategoryId = input.categoryId ?? existing.category_id
  const nextSubcategoryId =
    input.subcategoryId !== undefined ? input.subcategoryId : existing.subcategory_id

  validateDateInBillRange(existing.bill_id, nextDate)
  validateCategory(db, nextCategoryId, nextSubcategoryId, nextType)

  db.prepare(
    `UPDATE transactions
     SET date = ?, type = ?, category_id = ?, subcategory_id = ?, amount = ?, note = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    nextDate,
    nextType,
    nextCategoryId,
    nextSubcategoryId,
    input.amount ?? existing.amount,
    input.note !== undefined ? input.note : existing.note,
    id
  )

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as TransactionRow
  return rowToTransaction(row)
}

export function deleteTransaction(id: number): void {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)
  if (!existing) {
    throw new AppError('TRANSACTION_NOT_FOUND', `transaction ${id} not found`)
  }
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
}
