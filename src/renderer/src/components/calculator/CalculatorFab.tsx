import { useState } from 'react'
import { FloatButton, Popover } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'
import CalculatorPopover from './CalculatorPopover'

function CalculatorFab(): React.JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="topRight"
      title="计算器"
      content={<CalculatorPopover />}
    >
      <FloatButton icon={<CalculatorOutlined />} tooltip={open ? undefined : '计算器'} />
    </Popover>
  )
}

export default CalculatorFab
