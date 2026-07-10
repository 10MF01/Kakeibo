import { Card, Radio, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/store/useSettingsStore'
import type { AppLanguage } from '@shared/types/settings'

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { language, setLanguage } = useSettingsStore()

  return (
    <div>
      <Typography.Title level={3}>{t('settings.title')}</Typography.Title>
      <Card title={t('settings.language')} style={{ maxWidth: 480 }}>
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
    </div>
  )
}

export default SettingsPage
