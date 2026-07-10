import { useEffect } from 'react'
import { ConfigProvider, Spin } from 'antd'
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
  const { language, loaded, hydrate } = useSettingsStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <ConfigProvider
      locale={ANTD_LOCALE[language]}
      theme={{
        token: {
          colorPrimary: '#2f6f4f',
          borderRadius: 8,
          fontFamily:
            '"Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'
        }
      }}
    >
      {loaded ? (
        <AppRouter />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      )}
    </ConfigProvider>
  )
}

export default App
