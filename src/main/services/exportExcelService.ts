import ExcelJS from 'exceljs'
import { dialog } from 'electron'
import { writeFile } from 'fs/promises'
import { getDb } from '../db/connection'
import { getReportSummary } from './reportService'
import type { ExportResult } from '@shared/types/report'
import { toDisplayAmount } from '@shared/amount'

interface TransactionRow {
  date: string
  type: 'income' | 'expense'
  category: string
  subcategory: string | null
  amount: number
  note: string | null
}

async function buildExcelBuffer(billId: number): Promise<Buffer> {
  const summary = getReportSummary(billId)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Kakeibo'
  workbook.created = new Date()

  const summarySheet = workbook.addWorksheet('汇总')
  summarySheet.columns = [
    { header: '类型', key: 'type', width: 12 },
    { header: '分类', key: 'category', width: 20 },
    { header: '金额', key: 'amount', width: 15 },
    { header: '占比', key: 'percentage', width: 10 },
    { header: '笔数', key: 'count', width: 10 }
  ]
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getColumn('amount').numFmt = '#,##0.00'

  summarySheet.addRow({ type: '账单', category: summary.billName })
  summarySheet.addRow({ type: '周期', category: `${summary.startDate} ~ ${summary.endDate}` })
  summarySheet.addRow({})
  summarySheet.addRow({ type: '收入合计', amount: toDisplayAmount(summary.totalIncome) })
  summarySheet.addRow({ type: '支出合计', amount: toDisplayAmount(summary.totalExpense) })
  summarySheet.addRow({ type: '盈余', amount: toDisplayAmount(summary.balance) })
  summarySheet.addRow({})

  summarySheet.addRow({ type: '支出明细' }).font = { bold: true }
  for (const item of summary.expenseByCategory) {
    summarySheet.addRow({
      type: '支出',
      category: item.categoryName,
      amount: toDisplayAmount(item.total),
      percentage: `${item.percentage}%`,
      count: item.count
    })
  }
  summarySheet.addRow({})
  summarySheet.addRow({ type: '收入明细' }).font = { bold: true }
  for (const item of summary.incomeByCategory) {
    summarySheet.addRow({
      type: '收入',
      category: item.categoryName,
      amount: toDisplayAmount(item.total),
      percentage: `${item.percentage}%`,
      count: item.count
    })
  }

  const db = getDb()
  const transactions = db
    .prepare(
      `SELECT t.date, t.type, c.name as category, s.name as subcategory, t.amount, t.note
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       LEFT JOIN categories s ON t.subcategory_id = s.id
       WHERE t.bill_id = ?
       ORDER BY t.date, t.id`
    )
    .all(billId) as TransactionRow[]

  const txSheet = workbook.addWorksheet('流水明细')
  txSheet.columns = [
    { header: '日期', key: 'date', width: 12 },
    { header: '类型', key: 'type', width: 8 },
    { header: '一级分类', key: 'category', width: 16 },
    { header: '二级分类', key: 'subcategory', width: 16 },
    { header: '金额', key: 'amount', width: 12 },
    { header: '备注', key: 'note', width: 24 }
  ]
  txSheet.getRow(1).font = { bold: true }
  txSheet.getColumn('amount').numFmt = '#,##0.00'
  for (const t of transactions) {
    txSheet.addRow({
      date: t.date,
      type: t.type === 'income' ? '收入' : '支出',
      category: t.category,
      subcategory: t.subcategory ?? '',
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

export async function exportReportExcel(billId: number): Promise<ExportResult | null> {
  const summary = getReportSummary(billId)
  const defaultPath = `${sanitizeFileName(summary.billName)}-消费报告.xlsx`

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出 Excel 报告',
    defaultPath,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })
  if (canceled || !filePath) return null

  const buffer = await buildExcelBuffer(billId)
  await writeFile(filePath, buffer)
  return { filePath }
}
