import type { AppLanguage } from './types/settings'

interface ExportLabels {
  summarySheet: string
  transactionsSheet: string
  type: string
  category: string
  amount: string
  percentage: string
  count: string
  date: string
  primaryCategory: string
  note: string
  bill: string
  period: string
  totalIncome: string
  totalExpense: string
  balance: string
  expenseDetail: string
  incomeDetail: string
  income: string
  expense: string
  reportSuffix: string
  pdfDialogTitle: string
  excelDialogTitle: string
}

export const EXPORT_LABELS: Record<AppLanguage, ExportLabels> = {
  zh: {
    summarySheet: '汇总',
    transactionsSheet: '流水明细',
    type: '类型',
    category: '分类',
    amount: '金额',
    percentage: '占比',
    count: '笔数',
    date: '日期',
    primaryCategory: '分类',
    note: '备注',
    bill: '账单',
    period: '周期',
    totalIncome: '收入合计',
    totalExpense: '支出合计',
    balance: '盈余',
    expenseDetail: '支出明细',
    incomeDetail: '收入明细',
    income: '收入',
    expense: '支出',
    reportSuffix: '消费报告',
    pdfDialogTitle: '导出 PDF 报告',
    excelDialogTitle: '导出 Excel 报告'
  },
  ja: {
    summarySheet: '集計',
    transactionsSheet: '取引明細',
    type: '種類',
    category: 'カテゴリ',
    amount: '金額',
    percentage: '割合',
    count: '件数',
    date: '日付',
    primaryCategory: 'カテゴリ',
    note: 'メモ',
    bill: '家計簿',
    period: '期間',
    totalIncome: '収入合計',
    totalExpense: '支出合計',
    balance: '収支',
    expenseDetail: '支出明細',
    incomeDetail: '収入明細',
    income: '収入',
    expense: '支出',
    reportSuffix: '収支レポート',
    pdfDialogTitle: 'PDFレポートを出力',
    excelDialogTitle: 'Excelレポートを出力'
  },
  en: {
    summarySheet: 'Summary',
    transactionsSheet: 'Transactions',
    type: 'Type',
    category: 'Category',
    amount: 'Amount',
    percentage: 'Share',
    count: 'Count',
    date: 'Date',
    primaryCategory: 'Category',
    note: 'Note',
    bill: 'Bill',
    period: 'Period',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    balance: 'Balance',
    expenseDetail: 'Expense Detail',
    incomeDetail: 'Income Detail',
    income: 'Income',
    expense: 'Expense',
    reportSuffix: 'Report',
    pdfDialogTitle: 'Export PDF Report',
    excelDialogTitle: 'Export Excel Report'
  }
}
