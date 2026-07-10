import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Col, Row, Space, Spin, Statistic, Typography, message, theme } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import CategoryPieChart from '@renderer/components/report/CategoryPieChart'
import CategoryBreakdownTable from '@renderer/components/report/CategoryBreakdownTable'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import type { ReportSummary } from '@shared/types/report'
import type { AppLanguage } from '@shared/types/settings'

function ReportPage(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const { token } = theme.useToken()
  const currency = useCurrencyFormatter()
  const { billId } = useParams<{ billId: string }>()
  const id = Number(billId)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.api.reports
      .getSummary(id)
      .then(setSummary)
      .catch((err: Error) => message.error(err.message || t('report.loadFailed')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleExportPdf = async (): Promise<void> => {
    setExportingPdf(true)
    try {
      const result = await window.api.reports.exportPdf(id, i18n.language as AppLanguage)
      if (result) message.success(t('report.exportSuccess', { path: result.filePath }))
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('report.exportPdfFailed'))
    } finally {
      setExportingPdf(false)
    }
  }

  const handleExportExcel = async (): Promise<void> => {
    setExportingExcel(true)
    try {
      const result = await window.api.reports.exportExcel(id, i18n.language as AppLanguage)
      if (result) message.success(t('report.exportSuccess', { path: result.filePath }))
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('report.exportExcelFailed'))
    } finally {
      setExportingExcel(false)
    }
  }

  if (loading || !summary) {
    return <Spin />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>{t('report.title', { name: summary.billName })}</Typography.Title>
          <Typography.Paragraph type="secondary">
            {summary.startDate} ~ {summary.endDate}
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<FilePdfOutlined />} loading={exportingPdf} onClick={handleExportPdf}>
            {t('report.exportPdf')}
          </Button>
          <Button icon={<FileExcelOutlined />} loading={exportingExcel} onClick={handleExportExcel}>
            {t('report.exportExcel')}
          </Button>
        </Space>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('report.totalIncome')}
              value={currency.format(summary.totalIncome)}
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('report.totalExpense')}
              value={currency.format(summary.totalExpense)}
              valueStyle={{ color: token.colorError }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('report.balance')}
              value={currency.format(summary.balance)}
              valueStyle={{ color: summary.balance >= 0 ? token.colorSuccess : token.colorError }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title={t('report.expensePie')}>
            <CategoryPieChart data={summary.expenseByCategory} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('report.expenseDetail')}>
            <CategoryBreakdownTable data={summary.expenseByCategory} />
          </Card>
        </Col>
      </Row>

      {summary.incomeByCategory.length > 0 && (
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title={t('report.incomePie')}>
              <CategoryPieChart data={summary.incomeByCategory} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={t('report.incomeDetail')}>
              <CategoryBreakdownTable data={summary.incomeByCategory} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ReportPage
