import { useEffect, useState } from 'react'
import { Button, Card, Empty, List, Tag, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import BillForm, { type BillFormValues } from '@renderer/components/bill/BillForm'
import { useBillStore } from '@renderer/store/useBillStore'

function BillsListPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bills, fetch, refresh } = useBillStore()
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch()
  }, [fetch])

  const today = dayjs().format('YYYY-MM-DD')

  const handleSubmit = async (values: BillFormValues): Promise<void> => {
    setSubmitting(true)
    try {
      const bill = await window.api.bills.create(values)
      await refresh()
      setFormOpen(false)
      navigate(`/bills/${bill.id}`)
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('bills.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>{t('bills.title')}</Typography.Title>
          <Typography.Paragraph type="secondary">{t('bills.subtitle')}</Typography.Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          {t('bills.create')}
        </Button>
      </div>
      {bills.length === 0 ? (
        <Empty description={t('bills.empty')} />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={bills}
          renderItem={(bill) => {
            const isActive =
              bill.status === 'active' && bill.startDate <= today && bill.endDate >= today
            return (
              <List.Item>
                <Card hoverable onClick={() => navigate(`/bills/${bill.id}`)}>
                  <Typography.Text strong>{bill.name}</Typography.Text>
                  {isActive && (
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      {t('bills.active')}
                    </Tag>
                  )}
                  <div>
                    <Typography.Text type="secondary">
                      {bill.startDate} ~ {bill.endDate}
                    </Typography.Text>
                  </div>
                </Card>
              </List.Item>
            )
          }}
        />
      )}
      <BillForm
        open={formOpen}
        confirmLoading={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default BillsListPage
