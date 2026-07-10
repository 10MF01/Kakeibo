import { useEffect, useState } from 'react'
import { ColorPicker, Form, Input, Modal } from 'antd'

export interface CategoryFormValues {
  name: string
  color: string | null
}

interface CategoryFormProps {
  open: boolean
  title: string
  initialValues?: Partial<CategoryFormValues>
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: CategoryFormValues) => Promise<void> | void
}

const DEFAULT_COLOR = '#2f6f4f'

function CategoryForm({
  open,
  title,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit
}: CategoryFormProps): React.JSX.Element {
  const [form] = Form.useForm<{ name: string }>()
  const [color, setColor] = useState<string>(DEFAULT_COLOR)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: initialValues?.name ?? '' })
      setColor(initialValues?.color ?? DEFAULT_COLOR)
    }
  }, [open, initialValues, form])

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields()
    await onSubmit({ name: values.name, color })
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="例如：饮食" maxLength={20} />
        </Form.Item>
        <Form.Item label="颜色标签">
          <ColorPicker value={color} onChangeComplete={(c) => setColor(c.toHexString())} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CategoryForm
