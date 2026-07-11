import { useEffect, useState } from 'react'
import { Button, Dropdown, Empty, List, Modal, Tag, Typography, message, theme } from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Bill } from '@shared/types/bill'
import BillForm, { type BillFormValues } from '@renderer/components/bill/BillForm'
import { useBillStore } from '@renderer/store/useBillStore'
import { dayCount } from '@renderer/utils/billDayCount'

function BillsListPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { bills, fetch, refresh, activateBill, deleteBill } = useBillStore()
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openMenu, setOpenMenu] = useState<{ billId: number; trigger: 'context' | 'more' } | null>(
    null
  )

  useEffect(() => {
    fetch()
  }, [fetch])

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

  const handleActivate = async (bill: Bill): Promise<void> => {
    try {
      await activateBill(bill.id)
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('bills.activateFailed'))
    }
  }

  const handleDelete = (bill: Bill): void => {
    Modal.confirm({
      title: t('bills.deleteConfirmTitle'),
      content: t('bills.deleteConfirmDesc'),
      okText: t('bills.menuDelete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteBill(bill.id)
          message.success(t('bills.deleteSuccess'))
        } catch (err) {
          message.error(err instanceof Error ? err.message : t('bills.deleteFailed'))
        }
      }
    })
  }

  const menuFor = (bill: Bill): MenuProps => ({
    items: [
      {
        key: 'activate',
        label: t('bills.menuActivate'),
        disabled: bill.status === 'active'
      },
      {
        key: 'delete',
        label: t('bills.menuDelete'),
        danger: true
      }
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation()
      setOpenMenu(null)
      if (key === 'activate') handleActivate(bill)
      if (key === 'delete') handleDelete(bill)
    }
  })

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
          dataSource={bills}
          renderItem={(bill) => {
            const isActive = bill.status === 'active'
            return (
              <List.Item style={{ padding: 0, border: 'none' }}>
                <Dropdown
                  trigger={['contextMenu']}
                  menu={menuFor(bill)}
                  open={openMenu?.billId === bill.id && openMenu.trigger === 'context'}
                  onOpenChange={(next) =>
                    setOpenMenu(next ? { billId: bill.id, trigger: 'context' } : null)
                  }
                >
                  <div
                    onClick={() => navigate(`/bills/${bill.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 20px',
                      marginBottom: 12,
                      borderRadius: 8,
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = token.colorFillTertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = token.colorBgContainer
                    }}
                  >
                    <div>
                      <div>
                        <Typography.Text strong style={{ fontSize: 18 }}>
                          {bill.name}
                        </Typography.Text>
                        {isActive && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            {t('bills.active')}
                          </Tag>
                        )}
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {bill.startDate} ~ {bill.endDate}
                        </Typography.Text>
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {t('bills.dayCount', { count: dayCount(bill) })}
                        </Typography.Text>
                      </div>
                    </div>
                    <Dropdown
                      trigger={['click']}
                      menu={menuFor(bill)}
                      open={openMenu?.billId === bill.id && openMenu.trigger === 'more'}
                      onOpenChange={(next) =>
                        setOpenMenu(next ? { billId: bill.id, trigger: 'more' } : null)
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </Dropdown>
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
