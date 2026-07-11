import { useEffect } from 'react'
import { ConfigProvider, Spin, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import zhCN from 'antd/locale/zh_CN'
import jaJP from 'antd/locale/ja_JP'
import enUS from 'antd/locale/en_US'
import './i18n'
import { useSettingsStore } from './store/useSettingsStore'
import AppRouter from './router'
import type { AppLanguage } from '@shared/types/settings'

const ANTD_LOCALE: Record<AppLanguage, typeof zhCN> = {
  zh: zhCN,
  ja: jaJP,
  en: enUS
}

function App(): React.JSX.Element {
  const { t } = useTranslation()
  const { language, loaded, hydrateFailed, hydrate } = useSettingsStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <ConfigProvider
      locale={ANTD_LOCALE[language]}
      theme={{
        token: {
          colorPrimary: '#12A150',
          colorSuccess: '#12A150',
          colorError: '#F5222D',
          colorWarning: '#FAAD14',
          colorInfo: '#1677FF',
          colorText: 'rgba(0, 0, 0, 0.95)',
          colorTextSecondary: 'rgba(0, 0, 0, 0.85)',
          colorTextTertiary: 'rgba(0, 0, 0, 0.68)',
          colorBgLayout: '#e9ece9',
          borderRadius: 8,
          fontFamily:
            '"Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'
        }
      }}
    >
      {loaded ? (
        <AppRouter />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          {hydrateFailed ? (
            <>
              <span>{t('common.loadFailed')}</span>
              <Button onClick={() => hydrate()}>{t('common.retry')}</Button>
            </>
          ) : (
            <Spin size="large" />
          )}
        </div>
      )}
    </ConfigProvider>
  )
}

export default App
