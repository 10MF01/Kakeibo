import { useEffect } from 'react'
import { DatePicker, Form, Input, Modal } from 'antd'
import type { Dayjs } from 'dayjs'

export interface BillFormValues {
  name?: string
  startDate: string
  endDate: string
}

interface BillFormProps {
  open: boolean
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: BillFormValues) => Promise<void> | void
}

function BillForm({ open, confirmLoading, onCancel, onSubmit }: BillFormProps): React.JSX.Element {
  const [form] = Form.useForm<{ name?: string; range: [Dayjs, Dayjs] }>()

  useEffect(() => {
    if (open) form.resetFields()
  }, [open, form])

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields()
    const [start, end] = values.range
    await onSubmit({
      name: values.name,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    })
  }

  return (
    <Modal
      title="新建账单"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="range"
          label="账单周期"
          rules={[{ required: true, message: '请选择账单起止日期' }]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="name" label="账单名称（可选）">
          <Input placeholder="默认使用日期范围作为名称" maxLength={30} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BillForm
