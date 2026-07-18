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
  amount: number
  note: string | null
}

const HEADER_FILL = 'FF12A150'
const HEADER_FONT_COLOR = 'FFFFFFFF'
const SECTION_FONT_COLOR = 'FF12A150'
const ZEBRA_FILL = 'FFF3F6F4'
const BORDER_COLOR = 'FFD9D9D9'

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: BORDER_COLOR } },
  left: { style: 'thin', color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
  right: { style: 'thin', color: { argb: BORDER_COLOR } }
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = THIN_BORDER
  })
  row.height = 20
}

function styleTitleRow(row: ExcelJS.Row): void {
  row.font = { bold: true, size: 13 }
}

function styleSectionRow(row: ExcelJS.Row): void {
  row.getCell(1).font = { bold: true, size: 12, color: { argb: SECTION_FONT_COLOR } }
}

function styleDataRow(row: ExcelJS.Row, numericCols: number[], zebra: boolean): void {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.border = THIN_BORDER
    cell.alignment = numericCols.includes(colNumber)
      ? { horizontal: 'right', vertical: 'middle' }
      : { vertical: 'middle' }
    if (zebra) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } }
    }
  })
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
    { header: labels.category, key: 'category', width: 24 },
    { header: labels.amount, key: 'amount', width: 16 },
    { header: labels.percentage, key: 'percentage', width: 12 },
    { header: labels.count, key: 'count', width: 10 }
  ]
  styleHeaderRow(summarySheet.getRow(1))
  summarySheet.getColumn('amount').numFmt = '#,##0.00'
  summarySheet.getColumn('percentage').numFmt = '0.0%'
  summarySheet.getColumn('count').numFmt = '#,##0'
  summarySheet.views = [{ state: 'frozen', ySplit: 1 }]

  styleTitleRow(summarySheet.addRow({ type: labels.bill, category: summary.billName }))
  styleTitleRow(
    summarySheet.addRow({ type: labels.period, category: `${summary.startDate} ~ ${summary.endDate}` })
  )
  summarySheet.addRow({})

  const totalIncomeRow = summarySheet.addRow({
    type: labels.totalIncome,
    amount: toDisplayAmount(summary.totalIncome)
  })
  totalIncomeRow.getCell('type').font = { bold: true }
  totalIncomeRow.getCell('amount').alignment = { horizontal: 'right' }
  const totalExpenseRow = summarySheet.addRow({
    type: labels.totalExpense,
    amount: toDisplayAmount(summary.totalExpense)
  })
  totalExpenseRow.getCell('type').font = { bold: true }
  totalExpenseRow.getCell('amount').alignment = { horizontal: 'right' }
  const balanceRow = summarySheet.addRow({
    type: labels.balance,
    amount: toDisplayAmount(summary.balance)
  })
  balanceRow.getCell('type').font = { bold: true }
  balanceRow.getCell('amount').alignment = { horizontal: 'right' }
  summarySheet.addRow({})

  styleSectionRow(summarySheet.addRow({ type: labels.expenseDetail }))
  summary.expenseByCategory.forEach((item, i) => {
    const row = summarySheet.addRow({
      type: labels.expense,
      category: resolveCategorySeedLabel(item.categoryNameKey, item.categoryName, language),
      amount: toDisplayAmount(item.total),
      percentage: item.percentage / 100,
      count: item.count
    })
    styleDataRow(row, [3, 4, 5], i % 2 === 1)
  })
  summarySheet.addRow({})
  styleSectionRow(summarySheet.addRow({ type: labels.incomeDetail }))
  summary.incomeByCategory.forEach((item, i) => {
    const row = summarySheet.addRow({
      type: labels.income,
      category: resolveCategorySeedLabel(item.categoryNameKey, item.categoryName, language),
      amount: toDisplayAmount(item.total),
      percentage: item.percentage / 100,
      count: item.count
    })
    styleDataRow(row, [3, 4, 5], i % 2 === 1)
  })

  const db = getDb()
  const transactions = db
    .prepare(
      `SELECT t.date, t.type, c.name as category, c.name_key as category_name_key, t.amount, t.note
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.bill_id = ? AND t.deleted_at IS NULL
       ORDER BY t.date, t.id`
    )
    .all(billId) as TransactionRow[]

  const txSheet = workbook.addWorksheet(labels.transactionsSheet)
  txSheet.columns = [
    { header: labels.date, key: 'date', width: 14 },
    { header: labels.type, key: 'type', width: 10 },
    { header: labels.primaryCategory, key: 'category', width: 18 },
    { header: labels.amount, key: 'amount', width: 16 },
    { header: labels.note, key: 'note', width: 28 }
  ]
  styleHeaderRow(txSheet.getRow(1))
  txSheet.getColumn('amount').numFmt = '#,##0.00'
  txSheet.views = [{ state: 'frozen', ySplit: 1 }]
  transactions.forEach((t, i) => {
    const row = txSheet.addRow({
      date: t.date,
      type: t.type === 'income' ? labels.income : labels.expense,
      category: resolveCategorySeedLabel(t.category_name_key, t.category, language),
      amount: toDisplayAmount(t.amount),
      note: t.note ?? ''
    })
    styleDataRow(row, [4], i % 2 === 1)
  })

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
