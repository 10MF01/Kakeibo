import { useEffect, useState } from 'react'
import { Button, Card, Empty, List, Tag, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import BillForm, { type BillFormValues } from '@renderer/components/bill/BillForm'
import { useBillStore } from '@renderer/store/useBillStore'

function BillsListPage(): React.JSX.Element {
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
      message.error(err instanceof Error ? err.message : '创建账单失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>账单</Typography.Title>
          <Typography.Paragraph type="secondary">
            账单周期由你自由指定，例如 7/15 ~ 8/15，系统会按天为你生成录入表单。
          </Typography.Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          新建账单
        </Button>
      </div>
      {bills.length === 0 ? (
        <Empty description="还没有账单，先创建一个吧" />
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
                      进行中
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
