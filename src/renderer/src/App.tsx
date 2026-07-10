import { ConfigProvider, Typography } from 'antd'

function App(): React.JSX.Element {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2f6f4f',
          borderRadius: 8,
          fontFamily:
            '"Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'
        }
      }}
    >
      <div style={{ padding: 48 }}>
        <Typography.Title level={2}>Kakeibo</Typography.Title>
        <Typography.Paragraph type="secondary">
          脚手架启动成功，后续阶段将在此基础上搭建完整功能。
        </Typography.Paragraph>
      </div>
    </ConfigProvider>
  )
}

export default App
