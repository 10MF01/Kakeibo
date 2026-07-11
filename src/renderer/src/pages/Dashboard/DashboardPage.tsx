import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  theme
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useBillStore } from '@renderer/store/useBillStore'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import { categoryDisplayName } from '@renderer/utils/categoryName'
import { dayCount } from '@renderer/utils/billDayCount'
import type { Transaction } from '@shared/types/transaction'

function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { activeBill, loaded, fetch } = useBillStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()
  const currency = useCurrencyFormatter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    fetch()
    fetchCategories()
  }, [fetch, fetchCategories])

  useEffect(() => {
    if (!activeBill) {
      setTransactions([])
      return
    }
    setLoadingTx(true)
    window.api.transactions
      .listByBill(activeBill.id)
      .then(setTransactions)
      .finally(() => setLoadingTx(false))
  }, [activeBill])

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.date === b.date ? b.id - a.id : b.date.localeCompare(a.date)))
        .slice(0, 8),
    [transactions]
  )

  if (!loaded) {
    return <Spin />
  }

  if (!activeBill) {
    return (
      <div>
        <Typography.Title level={3}>{t('dashboard.title')}</Typography.Title>
        <Empty description={t('dashboard.noActiveBill')}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bills')}>
            {t('dashboard.createBill')}
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>{t('dashboard.title')}</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('dashboard.currentBill', { name: activeBill.name })}
            {activeBill.name !== `${activeBill.startDate} ~ ${activeBill.endDate}` &&
              `（${activeBill.startDate} ~ ${activeBill.endDate}）`}
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('bills.dayCount', { count: dayCount(activeBill) })}
          </Typography.Text>
        </div>
        <Button onClick={() => navigate(`/bills/${activeBill.id}`)}>{t('dashboard.goToBill')}</Button>
      </div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.periodIncome')}
              value={currency.format(totalIncome)}
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.periodExpense')}
              value={currency.format(totalExpense)}
              valueStyle={{ color: token.colorError }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.periodBalance')}
              value={currency.format(balance)}
              valueStyle={{ color: balance >= 0 ? token.colorSuccess : token.colorError }}
            />
          </Card>
        </Col>
      </Row>
      <Card title={t('dashboard.recentTransactions')} loading={loadingTx}>
        {recentTransactions.length === 0 ? (
          <Empty description={t('dashboard.noTransactions')} />
        ) : (
          <List
            dataSource={recentTransactions}
            renderItem={(t2) => {
              const category = categoryMap.get(t2.categoryId)
              return (
                <List.Item>
                  <Space>
                    <Typography.Text type="secondary">{t2.date}</Typography.Text>
                    <Tag color={t2.type === 'income' ? 'green' : 'volcano'}>
                      {t2.type === 'income' ? t('transaction.form.income') : t('transaction.form.expense')}
                    </Tag>
                    <span>{category ? categoryDisplayName(category, t) : '-'}</span>
                  </Space>
                  <span>{currency.format(t2.amount)}</span>
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default DashboardPage
