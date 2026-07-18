import type Database from 'better-sqlite3'
import { getDb } from '../db/connection'
import { getBill } from './billService'
import type { CategoryBreakdownItem, ReportSummary } from '@shared/types/report'
import type { CategoryType } from '@shared/types/category'

interface AggregateRow {
  category_id: number
  name: string
  color: string | null
  total: number
  count: number
}

function aggregateByType(
  db: Database.Database,
  billId: number,
  type: CategoryType
): CategoryBreakdownItem[] {
  const rows = db
    .prepare(
      `SELECT c.id as category_id, c.name as name, c.color as color, SUM(t.amount) as total, COUNT(*) as count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.bill_id = ? AND t.type = ? AND t.deleted_at IS NULL
       GROUP BY t.category_id
       ORDER BY total DESC`
    )
    .all(billId, type) as AggregateRow[]

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0)

  return rows.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.name,
    color: r.color,
    total: r.total,
    count: r.count,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0
  }))
}

export function getReportSummary(billId: number): ReportSummary {
  const db = getDb()
  const bill = getBill(billId)
  const expenseByCategory = aggregateByType(db, billId, 'expense')
  const incomeByCategory = aggregateByType(db, billId, 'income')
  const totalExpense = expenseByCategory.reduce((s, i) => s + i.total, 0)
  const totalIncome = incomeByCategory.reduce((s, i) => s + i.total, 0)

  return {
    billId: bill.id,
    billName: bill.name,
    startDate: bill.startDate,
    endDate: bill.endDate,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expenseByCategory,
    incomeByCategory,
    generatedAt: new Date().toISOString()
  }
}
