import ExcelJS from 'exceljs'
import { dialog } from 'electron'
import { writeFile } from 'fs/promises'
import { getDb } from '../db/connection'
import { getReportSummary } from './reportService'
import type { ExportResult } from '@shared/types/report'
import { toDisplayAmount } from '@shared/amount'
import { EXPORT_LABELS } from '@shared/exportLabels'
import { resolveCategorySeedLabel } from '@shared/categorySeedLabels'
import type { AppLanguage } from '@shared/types/settings'

interface TransactionRow {
  date: string
  type: 'income' | 'expense'
  category: string
  category_name_key: string | null
  subcategory: string | null
  subcategory_name_key: string | null
  amount: number
  note: string | null
}

async function buildExcelBuffer(billId: number, language: AppLanguage): Promise<Buffer> {
  const labels = EXPORT_LABELS[language]
  const summary = getReportSummary(billId)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Kakeibo'
  workbook.created = new Date()

  const summarySheet = workbook.addWorksheet(labels.summarySheet)
  summarySheet.columns = [
    { header: labels.type, key: 'type', width: 12 },
    { header: labels.category, key: 'category', width: 20 },
    { header: labels.amount, key: 'amount', width: 15 },
    { header: labels.percentage, key: 'percentage', width: 10 },
    { header: labels.count, key: 'count', width: 10 }
  ]
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getColumn('amount').numFmt = '#,##0.00'

  summarySheet.addRow({ type: labels.bill, category: summary.billName })
  summarySheet.addRow({ type: labels.period, category: `${summary.startDate} ~ ${summary.endDate}` })
  summarySheet.addRow({})
  summarySheet.addRow({ type: labels.totalIncome, amount: toDisplayAmount(summary.totalIncome) })
  summarySheet.addRow({ type: labels.totalExpense, amount: toDisplayAmount(summary.totalExpense) })
  summarySheet.addRow({ type: labels.balance, amount: toDisplayAmount(summary.balance) })
  summarySheet.addRow({})

  summarySheet.addRow({ type: labels.expenseDetail }).font = { bold: true }
  for (const item of summary.expenseByCategory) {
    summarySheet.addRow({
      type: labels.expense,
      category: resolveCategorySeedLabel(item.categoryNameKey, item.categoryName, language),
      amount: toDisplayAmount(item.total),
      percentage: `${item.percentage}%`,
      count: item.count
    })
  }
  summarySheet.addRow({})
  summarySheet.addRow({ type: labels.incomeDetail }).font = { bold: true }
  for (const item of summary.incomeByCategory) {
    summarySheet.addRow({
      type: labels.income,
      category: resolveCategorySeedLabel(item.categoryNameKey, item.categoryName, language),
      amount: toDisplayAmount(item.total),
      percentage: `${item.percentage}%`,
      count: item.count
    })
  }

  const db = getDb()
  const transactions = db
    .prepare(
      `SELECT t.date, t.type, c.name as category, c.name_key as category_name_key,
              s.name as subcategory, s.name_key as subcategory_name_key, t.amount, t.note
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       LEFT JOIN categories s ON t.subcategory_id = s.id
       WHERE t.bill_id = ?
       ORDER BY t.date, t.id`
    )
    .all(billId) as TransactionRow[]

  const txSheet = workbook.addWorksheet(labels.transactionsSheet)
  txSheet.columns = [
    { header: labels.date, key: 'date', width: 12 },
    { header: labels.type, key: 'type', width: 8 },
    { header: labels.primaryCategory, key: 'category', width: 16 },
    { header: labels.subcategory, key: 'subcategory', width: 16 },
    { header: labels.amount, key: 'amount', width: 12 },
    { header: labels.note, key: 'note', width: 24 }
  ]
  txSheet.getRow(1).font = { bold: true }
  txSheet.getColumn('amount').numFmt = '#,##0.00'
  for (const t of transactions) {
    txSheet.addRow({
      date: t.date,
      type: t.type === 'income' ? labels.income : labels.expense,
      category: resolveCategorySeedLabel(t.category_name_key, t.category, language),
      subcategory: t.subcategory
        ? resolveCategorySeedLabel(t.subcategory_name_key, t.subcategory, language)
        : '',
      amount: toDisplayAmount(t.amount),
      note: t.note ?? ''
    })
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

export async function exportReportExcel(
  billId: number,
  language: AppLanguage
): Promise<ExportResult | null> {
  const labels = EXPORT_LABELS[language]
  const summary = getReportSummary(billId)
  const defaultPath = `${sanitizeFileName(summary.billName)}-${labels.reportSuffix}.xlsx`

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: labels.excelDialogTitle,
    defaultPath,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })
  if (canceled || !filePath) return null

  const buffer = await buildExcelBuffer(billId, language)
  await writeFile(filePath, buffer)
  return { filePath }
}
