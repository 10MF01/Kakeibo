import { Button, Card, List, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Category } from '@shared/types/category'
import type { Transaction } from '@shared/types/transaction'
import { toDisplayAmount } from '@shared/amount'

interface DayEntryCardProps {
  date: string
  transactions: Transaction[]
  categoryMap: Map<number, Category>
  onAdd: (date: string) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function DayEntryCard({
  date,
  transactions,
  categoryMap,
  onAdd,
  onEdit,
  onDelete
}: DayEntryCardProps): React.JSX.Element {
  const dayIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const dayExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>{date}</span>
          <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
            {WEEKDAYS[dayjs(date).day()]}
          </Typography.Text>
        </Space>
      }
      extra={
        <Space size={12}>
          {dayIncome > 0 && (
            <Typography.Text type="success">收 {toDisplayAmount(dayIncome).toFixed(2)}</Typography.Text>
          )}
          {dayExpense > 0 && (
            <Typography.Text type="danger">支 {toDisplayAmount(dayExpense).toFixed(2)}</Typography.Text>
          )}
          <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => onAdd(date)}>
            添加
          </Button>
        </Space>
      }
      style={{ marginBottom: 12 }}
    >
      {transactions.length === 0 ? (
        <Typography.Text type="secondary">这一天还没有记录</Typography.Text>
      ) : (
        <List
          size="small"
          dataSource={transactions}
          renderItem={(t) => {
            const category = categoryMap.get(t.categoryId)
            const subcategory = t.subcategoryId ? categoryMap.get(t.subcategoryId) : null
            return (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(t)}
                  />,
                  <Popconfirm key="delete" title="删除这条记录？" onConfirm={() => onDelete(t)}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <Space>
                  <Tag color={t.type === 'income' ? 'green' : 'volcano'}>
                    {t.type === 'income' ? '收入' : '支出'}
                  </Tag>
                  <span>{category?.name ?? '未知分类'}</span>
                  {subcategory && <Tag>{subcategory.name}</Tag>}
                  {t.note && <Typography.Text type="secondary">{t.note}</Typography.Text>}
                </Space>
                <span>{toDisplayAmount(t.amount).toFixed(2)}</span>
              </List.Item>
            )
          }}
        />
      )}
    </Card>
  )
}

export default DayEntryCard
