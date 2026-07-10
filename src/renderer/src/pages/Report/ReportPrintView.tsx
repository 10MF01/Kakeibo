import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { theme } from 'antd'
import dayjs from 'dayjs'
import CategoryPieChart from '@renderer/components/report/CategoryPieChart'
import CategoryBreakdownTable from '@renderer/components/report/CategoryBreakdownTable'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import type { ReportSummary } from '@shared/types/report'

interface SummaryBoxProps {
  label: string
  value: string
  color: string
}

function SummaryBox({ label, value, color }: SummaryBoxProps): React.JSX.Element {
  return (
    <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
      <div style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}

function ReportPrintView(): React.JSX.Element {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const currency = useCurrencyFormatter()
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
      <h1 style={{ marginBottom: 4 }}>{t('report.title', { name: summary.billName })}</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {t('report.period')}：{summary.startDate} ~ {summary.endDate} ｜ {t('report.generatedAt')}：
        {dayjs(summary.generatedAt).format('YYYY-MM-DD HH:mm')}
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <SummaryBox
          label={t('report.totalIncome')}
          value={currency.format(summary.totalIncome)}
          color={token.colorSuccess}
        />
        <SummaryBox
          label={t('report.totalExpense')}
          value={currency.format(summary.totalExpense)}
          color={token.colorError}
        />
        <SummaryBox
          label={t('report.balance')}
          value={currency.format(summary.balance)}
          color={summary.balance >= 0 ? token.colorSuccess : token.colorError}
        />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>{t('report.expensePie')}</h2>
      <div style={{ marginBottom: 24 }}>
        <CategoryPieChart data={summary.expenseByCategory} height={280} animate={false} />
      </div>
      <CategoryBreakdownTable data={summary.expenseByCategory} />

      {summary.incomeByCategory.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>{t('report.incomePie')}</h2>
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
