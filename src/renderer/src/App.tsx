import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppRouter from './router'

function App(): React.JSX.Element {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2f6f4f',
          borderRadius: 8,
          fontFamily:
            '"Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'
        }
      }}
    >
      <AppRouter />
    </ConfigProvider>
  )
}

export default App
