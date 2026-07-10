import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import CategoryPieChart from '@renderer/components/report/CategoryPieChart'
import CategoryBreakdownTable from '@renderer/components/report/CategoryBreakdownTable'
import { toDisplayAmount } from '@shared/amount'
import type { ReportSummary } from '@shared/types/report'

interface SummaryBoxProps {
  label: string
  value: number
  color: string
}

function SummaryBox({ label, value, color }: SummaryBoxProps): React.JSX.Element {
  return (
    <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
      <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{toDisplayAmount(value).toFixed(2)}</div>
    </div>
  )
}

function ReportPrintView(): React.JSX.Element {
  const { billId } = useParams<{ billId: string }>()
  const id = Number(billId)
  const [summary, setSummary] = useState<ReportSummary | null>(null)

  useEffect(() => {
    window.api.reports.getSummary(id).then(setSummary)
  }, [id])

  useEffect(() => {
    if (!summary) return
    const timer = setTimeout(() => {
      window.api.reports.notifyPrintReady()
    }, 600)
    return () => clearTimeout(timer)
  }, [summary])

  if (!summary) {
    return <div />
  }

  return (
    <div style={{ width: 780, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>{summary.billName} 消费报告</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        账单周期：{summary.startDate} ~ {summary.endDate} ｜ 生成时间：
        {dayjs(summary.generatedAt).format('YYYY-MM-DD HH:mm')}
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <SummaryBox label="总收入" value={summary.totalIncome} color="#3f8600" />
        <SummaryBox label="总支出" value={summary.totalExpense} color="#cf1322" />
        <SummaryBox
          label="盈余"
          value={summary.balance}
          color={summary.balance >= 0 ? '#3f8600' : '#cf1322'}
        />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>支出分类占比</h2>
      <div style={{ marginBottom: 24 }}>
        <CategoryPieChart data={summary.expenseByCategory} height={280} animate={false} />
      </div>
      <CategoryBreakdownTable data={summary.expenseByCategory} />

      {summary.incomeByCategory.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>收入分类占比</h2>
          <div style={{ marginBottom: 24 }}>
            <CategoryPieChart data={summary.incomeByCategory} height={280} animate={false} />
          </div>
          <CategoryBreakdownTable data={summary.incomeByCategory} />
        </>
      )}
    </div>
  )
}

export default ReportPrintView
