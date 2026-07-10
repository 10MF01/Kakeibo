import { useEffect } from 'react'
import { DatePicker, Form, Input, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      title={t('bills.form.title')}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="range"
          label={t('bills.form.period')}
          rules={[{ required: true, message: t('bills.form.periodRequired') }]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="name" label={t('bills.form.name')}>
          <Input placeholder={t('bills.form.namePlaceholder')} maxLength={30} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BillForm
