import { Typography } from 'antd'

function DashboardPage(): React.JSX.Element {
  return (
    <div>
      <Typography.Title level={3}>首页</Typography.Title>
      <Typography.Paragraph type="secondary">
        实时盈余总览将在 Phase 5 实现。
      </Typography.Paragraph>
    </div>
  )
}

export default DashboardPage
