import { Card, Radio, Space, Switch, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/store/useSettingsStore'
import type { AppLanguage } from '@shared/types/settings'

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { language, setLanguage, soundEnabled, setSoundEnabled } = useSettingsStore()

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
      <Card title={t('settings.sound')} style={{ maxWidth: 480 }}>
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 360 }}>
            {t('settings.soundDesc')}
          </Typography.Paragraph>
          <Switch checked={soundEnabled} onChange={setSoundEnabled} />
        </Space>
      </Card>
    </div>
  )
}

export default SettingsPage
