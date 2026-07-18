import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input, message, Radio, Select, Space, Switch, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/store/useSettingsStore'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { categoryDisplayName } from '@renderer/utils/categoryName'
import type { AppLanguage } from '@shared/types/settings'
import type { SyncStatus } from '@shared/types/sync'

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const {
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    defaultExpenseCategoryId,
    setDefaultExpenseCategoryId,
    defaultIncomeCategoryId,
    setDefaultIncomeCategoryId
  } = useSettingsStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ endpointUrl: null, lastSyncedAt: null })
  const [endpointInput, setEndpointInput] = useState('')
  const [savingEndpoint, setSavingEndpoint] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    window.api.sync.getStatus().then((status) => {
      setSyncStatus(status)
      setEndpointInput(status.endpointUrl ?? '')
    })
  }, [])

  const handleSaveEndpoint = async (): Promise<void> => {
    setSavingEndpoint(true)
    try {
      const status = await window.api.sync.setEndpointUrl(endpointInput)
      setSyncStatus(status)
      message.success(t('common.save'))
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('common.loadFailed'))
    } finally {
      setSavingEndpoint(false)
    }
  }

  const handleSyncNow = async (): Promise<void> => {
    if (!syncStatus.endpointUrl) {
      message.warning(t('settings.syncEndpointRequired'))
      return
    }
    setSyncing(true)
    try {
      const result = await window.api.sync.syncNow()
      setSyncStatus((prev) => ({ ...prev, lastSyncedAt: result.exportedAt }))
      message.success(
        t('settings.syncSuccess', {
          categories: result.importedCategories,
          bills: result.importedBills,
          transactions: result.importedTransactions
        })
      )
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('common.loadFailed'))
    } finally {
      setSyncing(false)
    }
  }

  const expenseOptions = useMemo(
    () =>
      categories
        .filter((c) => c.type === 'expense')
        .map((c) => ({ value: c.id, label: categoryDisplayName(c, t) })),
    [categories, t]
  )
  const incomeOptions = useMemo(
    () =>
      categories
        .filter((c) => c.type === 'income')
        .map((c) => ({ value: c.id, label: categoryDisplayName(c, t) })),
    [categories, t]
  )

  return (
    <div>
      <Typography.Title level={3}>{t('settings.title')}</Typography.Title>
      <Card title={t('settings.language')} style={{ maxWidth: 480, marginBottom: 16 }}>
        <Typography.Paragraph type="secondary">{t('settings.languageDesc')}</Typography.Paragraph>
        <Radio.Group
          value={language}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="zh">中文</Radio.Button>
          <Radio.Button value="ja">日本語</Radio.Button>
          <Radio.Button value="en">English</Radio.Button>
        </Radio.Group>
      </Card>
      <Card title={t('settings.sound')} style={{ maxWidth: 480, marginBottom: 16 }}>
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 360 }}>
            {t('settings.soundDesc')}
          </Typography.Paragraph>
          <Switch checked={soundEnabled} onChange={setSoundEnabled} />
        </Space>
      </Card>
      <Card title={t('settings.defaultCategory')} style={{ maxWidth: 480 }}>
        <Typography.Paragraph type="secondary">
          {t('settings.defaultCategoryDesc')}
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Typography.Text style={{ display: 'block', marginBottom: 4 }}>
              {t('transaction.form.expense')}
            </Typography.Text>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder={t('transaction.form.selectCategory')}
              options={expenseOptions}
              value={defaultExpenseCategoryId ?? undefined}
              onChange={(value) => setDefaultExpenseCategoryId(value ?? null)}
            />
          </div>
          <div>
            <Typography.Text style={{ display: 'block', marginBottom: 4 }}>
              {t('transaction.form.income')}
            </Typography.Text>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder={t('transaction.form.selectCategory')}
              options={incomeOptions}
              value={defaultIncomeCategoryId ?? undefined}
              onChange={(value) => setDefaultIncomeCategoryId(value ?? null)}
            />
          </div>
        </Space>
      </Card>
      <Card title={t('settings.sync')} style={{ maxWidth: 480, marginTop: 16 }}>
        <Typography.Paragraph type="secondary">{t('settings.syncDesc')}</Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Typography.Text style={{ display: 'block', marginBottom: 4 }}>
              {t('settings.syncEndpoint')}
            </Typography.Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder={t('settings.syncEndpointPlaceholder')}
              />
              <Button loading={savingEndpoint} onClick={handleSaveEndpoint}>
                {t('common.save')}
              </Button>
            </Space.Compact>
          </div>
          <Typography.Text type="secondary">
            {syncStatus.lastSyncedAt
              ? t('settings.lastSyncedAt', {
                  time: new Date(syncStatus.lastSyncedAt).toLocaleString()
                })
              : t('settings.neverSynced')}
          </Typography.Text>
          <Button type="primary" loading={syncing} onClick={handleSyncNow}>
            {syncing ? t('settings.syncing') : t('settings.syncNow')}
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default SettingsPage
