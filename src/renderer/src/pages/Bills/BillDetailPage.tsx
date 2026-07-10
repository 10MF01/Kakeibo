import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Space, Spin, Statistic, Typography, message, theme } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import DayEntryCard from '@renderer/components/bill/DayEntryCard'
import TransactionForm, {
  type TransactionFormValues
} from '@renderer/components/bill/TransactionForm'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import type { Bill } from '@shared/types/bill'
import type { Transaction } from '@shared/types/transaction'

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  let cur = dayjs(start)
  const last = dayjs(end)
  while (cur.isSame(last, 'day') || cur.isBefore(last, 'day')) {
    dates.push(cur.format('YYYY-MM-DD'))
    cur = cur.add(1, 'day')
  }
  return dates
}

interface FormState {
  open: boolean
  date: string
  editing?: Transaction
}

function BillDetailPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const { billId } = useParams<{ billId: string }>()
  const navigate = useNavigate()
  const { categories, fetch: fetchCategories } = useCategoryStore()
  const currency = useCurrencyFormatter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<FormState>({ open: false, date: '' })
  const [submitting, setSubmitting] = useState(false)

  const id = Number(billId)

  const loadData = async (): Promise<void> => {
    setLoading(true)
    try {
      const [billData, txData] = await Promise.all([
        window.api.bills.get(id),
        window.api.transactions.listByBill(id)
      ])
      setBill(billData)
      setTransactions(txData)
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('bills.notFound'))
      navigate('/bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const dates = useMemo(
    () => (bill ? generateDateRange(bill.startDate, bill.endDate) : []),
    [bill]
  )
  const transactionsByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of transactions) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return map
  }, [transactions])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const openAdd = (date: string): void => setFormState({ open: true, date })
  const openEdit = (transaction: Transaction): void =>
    setFormState({ open: true, date: transaction.date, editing: transaction })
  const closeForm = (): void => setFormState((s) => ({ ...s, open: false }))

  const handleSubmit = async (values: TransactionFormValues): Promise<void> => {
    setSubmitting(true)
    try {
      if (formState.editing) {
        await window.api.transactions.update(formState.editing.id, values)
      } else {
        await window.api.transactions.create({ ...values, billId: id, date: formState.date })
      }
      await loadData()
      closeForm()
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('bills.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (transaction: Transaction): Promise<void> => {
    try {
      await window.api.transactions.delete(transaction.id)
      await loadData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('bills.deleteFailed'))
    }
  }

  if (loading || !bill) {
    return <Spin />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>{bill.name}</Typography.Title>
          <Typography.Paragraph type="secondary">
            {bill.startDate} ~ {bill.endDate}
          </Typography.Paragraph>
        </div>
        <Button icon={<FileTextOutlined />} onClick={() => navigate(`/bills/${id}/report`)}>
          {t('bills.detail.viewReport')}
        </Button>
      </div>
      <Space size={48} style={{ marginBottom: 24 }}>
        <Statistic
          title={t('bills.detail.income')}
          value={currency.format(totalIncome)}
          valueStyle={{ color: token.colorSuccess }}
        />
        <Statistic
          title={t('bills.detail.expense')}
          value={currency.format(totalExpense)}
          valueStyle={{ color: token.colorError }}
        />
        <Statistic
          title={t('bills.detail.balance')}
          value={currency.format(balance)}
          valueStyle={{ color: balance >= 0 ? token.colorSuccess : token.colorError }}
        />
      </Space>
      {dates.map((date) => (
        <DayEntryCard
          key={date}
          date={date}
          transactions={transactionsByDate.get(date) ?? []}
          categoryMap={categoryMap}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      ))}
      <TransactionForm
        open={formState.open}
        date={formState.date}
        categories={categories}
        initialValues={formState.editing}
        confirmLoading={submitting}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default BillDetailPage
