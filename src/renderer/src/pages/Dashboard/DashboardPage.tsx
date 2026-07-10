import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Empty, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useBillStore } from '@renderer/store/useBillStore'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { toDisplayAmount } from '@shared/amount'
import type { Transaction } from '@shared/types/transaction'

function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate()
  const { activeBill, loaded, fetch } = useBillStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()
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
        <Typography.Title level={3}>首页</Typography.Title>
        <Empty description="当前没有进行中的账单">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bills')}>
            去创建账单
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3}>首页</Typography.Title>
          <Typography.Paragraph type="secondary">
            当前账单：{activeBill.name}
            {activeBill.name !== `${activeBill.startDate} ~ ${activeBill.endDate}` &&
              `（${activeBill.startDate} ~ ${activeBill.endDate}）`}
          </Typography.Paragraph>
        </div>
        <Button onClick={() => navigate(`/bills/${activeBill.id}`)}>去记账</Button>
      </div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="本期收入"
              value={toDisplayAmount(totalIncome)}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本期支出"
              value={toDisplayAmount(totalExpense)}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本期盈余"
              value={toDisplayAmount(balance)}
              precision={2}
              valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="最近记录" loading={loadingTx}>
        {recentTransactions.length === 0 ? (
          <Empty description="还没有记录，去记一笔吧" />
        ) : (
          <List
            dataSource={recentTransactions}
            renderItem={(t) => {
              const category = categoryMap.get(t.categoryId)
              const subcategory = t.subcategoryId ? categoryMap.get(t.subcategoryId) : null
              return (
                <List.Item>
                  <Space>
                    <Typography.Text type="secondary">{t.date}</Typography.Text>
                    <Tag color={t.type === 'income' ? 'green' : 'volcano'}>
                      {t.type === 'income' ? '收入' : '支出'}
                    </Tag>
                    <span>{category?.name ?? '未知分类'}</span>
                    {subcategory && <Tag>{subcategory.name}</Tag>}
                  </Space>
                  <span>{toDisplayAmount(t.amount).toFixed(2)}</span>
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
