import { Typography } from 'antd'

function BillsListPage(): React.JSX.Element {
  return (
    <div>
      <Typography.Title level={3}>账单</Typography.Title>
      <Typography.Paragraph type="secondary">
        自定义周期账单与逐日录入将在 Phase 4 实现。
      </Typography.Paragraph>
    </div>
  )
}

export default BillsListPage
