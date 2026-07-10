import { Button, Card, List, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import type { Category } from '@shared/types/category'
import type { Transaction } from '@shared/types/transaction'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import { categoryDisplayName } from '@renderer/utils/categoryName'

interface DayEntryCardProps {
  date: string
  transactions: Transaction[]
  categoryMap: Map<number, Category>
  onAdd: (date: string) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const WEEKDAY_KEYS = [
  'weekday.sun',
  'weekday.mon',
  'weekday.tue',
  'weekday.wed',
  'weekday.thu',
  'weekday.fri',
  'weekday.sat'
]
const WEEKDAY_FALLBACK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function DayEntryCard({
  date,
  transactions,
  categoryMap,
  onAdd,
  onEdit,
  onDelete
}: DayEntryCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const currency = useCurrencyFormatter()
  const dayIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const dayExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const weekday = dayjs(date).day()

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>{date}</span>
          <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
            {t(WEEKDAY_KEYS[weekday], WEEKDAY_FALLBACK[weekday])}
          </Typography.Text>
        </Space>
      }
      extra={
        <Space size={12}>
          {dayIncome > 0 && <Typography.Text type="success">{currency.format(dayIncome)}</Typography.Text>}
          {dayExpense > 0 && <Typography.Text type="danger">{currency.format(dayExpense)}</Typography.Text>}
          <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => onAdd(date)}>
            {t('bills.detail.add')}
          </Button>
        </Space>
      }
      style={{ marginBottom: 12 }}
    >
      {transactions.length === 0 ? (
        <Typography.Text type="secondary">{t('bills.detail.noRecord')}</Typography.Text>
      ) : (
        <List
          size="small"
          dataSource={transactions}
          renderItem={(tx) => {
            const category = categoryMap.get(tx.categoryId)
            const subcategory = tx.subcategoryId ? categoryMap.get(tx.subcategoryId) : null
            return (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(tx)}
                  />,
                  <Popconfirm
                    key="delete"
                    title={t('bills.detail.deleteConfirm')}
                    onConfirm={() => onDelete(tx)}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <Space>
                  <Tag color={tx.type === 'income' ? 'green' : 'volcano'}>
                    {tx.type === 'income' ? t('transaction.form.income') : t('transaction.form.expense')}
                  </Tag>
                  <span>{category ? categoryDisplayName(category, t) : '-'}</span>
                  {subcategory && <Tag>{categoryDisplayName(subcategory, t)}</Tag>}
                  {tx.note && <Typography.Text type="secondary">{tx.note}</Typography.Text>}
                </Space>
                <span>{currency.format(tx.amount)}</span>
              </List.Item>
            )
          }}
        />
      )}
    </Card>
  )
}

export default DayEntryCard
