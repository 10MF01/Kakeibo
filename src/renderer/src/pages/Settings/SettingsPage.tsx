import { Typography } from 'antd'

function SettingsPage(): React.JSX.Element {
  return (
    <div>
      <Typography.Title level={3}>设置</Typography.Title>
      <Typography.Paragraph type="secondary">
        语言与货币切换将在 Phase 8 实现。
      </Typography.Paragraph>
    </div>
  )
}

export default SettingsPage
