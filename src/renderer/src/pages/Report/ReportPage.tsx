import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Col, Row, Space, Spin, Statistic, Typography, message } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import CategoryPieChart from '@renderer/components/report/CategoryPieChart'
import CategoryBreakdownTable from '@renderer/components/report/CategoryBreakdownTable'
import { toDisplayAmount } from '@shared/amount'
import type { ReportSummary } from '@shared/types/report'

function ReportPage(): React.JSX.Element {
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
      .catch((err: Error) => message.error(err.message || '加载报告失败'))
      .finally(() => setLoading(false))
  }, [id])

  const handleExportPdf = async (): Promise<void> => {
    setExportingPdf(true)
    try {
      const result = await window.api.reports.exportPdf(id)
      if (result) message.success(`已导出到 ${result.filePath}`)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导出 PDF 失败')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleExportExcel = async (): Promise<void> => {
    setExportingExcel(true)
    try {
      const result = await window.api.reports.exportExcel(id)
      if (result) message.success(`已导出到 ${result.filePath}`)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导出 Excel 失败')
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
          <Typography.Title level={3}>{summary.billName} · 消费报告</Typography.Title>
          <Typography.Paragraph type="secondary">
            {summary.startDate} ~ {summary.endDate}
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<FilePdfOutlined />} loading={exportingPdf} onClick={handleExportPdf}>
            导出 PDF
          </Button>
          <Button icon={<FileExcelOutlined />} loading={exportingExcel} onClick={handleExportExcel}>
            导出 Excel
          </Button>
        </Space>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总收入"
              value={toDisplayAmount(summary.totalIncome)}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总支出"
              value={toDisplayAmount(summary.totalExpense)}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="盈余"
              value={toDisplayAmount(summary.balance)}
              precision={2}
              valueStyle={{ color: summary.balance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="支出分类占比">
            <CategoryPieChart data={summary.expenseByCategory} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="支出明细">
            <CategoryBreakdownTable data={summary.expenseByCategory} />
          </Card>
        </Col>
      </Row>

      {summary.incomeByCategory.length > 0 && (
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="收入分类占比">
              <CategoryPieChart data={summary.incomeByCategory} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="收入明细">
              <CategoryBreakdownTable data={summary.incomeByCategory} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ReportPage
