export interface CategoryBreakdownItem {
  categoryId: number
  categoryName: string
  color: string | null
  total: number
  count: number
  percentage: number
}

export interface ReportSummary {
  billId: number
  billName: string
  startDate: string
  endDate: string
  totalIncome: number
  totalExpense: number
  balance: number
  expenseByCategory: CategoryBreakdownItem[]
  incomeByCategory: CategoryBreakdownItem[]
  generatedAt: string
}

export interface ExportResult {
  filePath: string
}
