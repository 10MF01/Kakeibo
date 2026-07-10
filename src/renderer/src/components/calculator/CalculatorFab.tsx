import { useState } from 'react'
import { FloatButton, Popover } from 'antd'
import { useTranslation } from 'react-i18next'
import { CalculatorOutlined } from '@ant-design/icons'
import CalculatorPopover from './CalculatorPopover'

function CalculatorFab(): React.JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="topRight"
      title={t('calculator.title')}
      content={<CalculatorPopover open={open} />}
    >
      <FloatButton icon={<CalculatorOutlined />} tooltip={open ? undefined : t('calculator.title')} />
    </Popover>
  )
}

export default CalculatorFab
