import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Space, Spin, Statistic, Typography, message } from 'antd'
import dayjs from 'dayjs'
import DayEntryCard from '@renderer/components/bill/DayEntryCard'
import TransactionForm, {
  type TransactionFormValues
} from '@renderer/components/bill/TransactionForm'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { toDisplayAmount } from '@renderer/utils/amount'
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
  const { billId } = useParams<{ billId: string }>()
  const navigate = useNavigate()
  const { categories, fetch: fetchCategories } = useCategoryStore()
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
      message.error(err instanceof Error ? err.message : '账单不存在')
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
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (transaction: Transaction): Promise<void> => {
    try {
      await window.api.transactions.delete(transaction.id)
      await loadData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  if (loading || !bill) {
    return <Spin />
  }

  return (
    <div>
      <Typography.Title level={3}>{bill.name}</Typography.Title>
      <Typography.Paragraph type="secondary">
        {bill.startDate} ~ {bill.endDate}
      </Typography.Paragraph>
      <Space size={48} style={{ marginBottom: 24 }}>
        <Statistic
          title="收入"
          value={toDisplayAmount(totalIncome)}
          precision={2}
          valueStyle={{ color: '#3f8600' }}
        />
        <Statistic
          title="支出"
          value={toDisplayAmount(totalExpense)}
          precision={2}
          valueStyle={{ color: '#cf1322' }}
        />
        <Statistic
          title="盈余"
          value={toDisplayAmount(balance)}
          precision={2}
          valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
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
