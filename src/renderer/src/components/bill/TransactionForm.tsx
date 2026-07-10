import { useEffect, useMemo } from 'react'
import { Form, Input, InputNumber, Modal, Radio, Select } from 'antd'
import type { Category, CategoryType } from '@shared/types/category'

export interface TransactionFormValues {
  type: CategoryType
  categoryId: number
  subcategoryId?: number | null
  amount: number
  note?: string | null
}

interface TransactionFormInitialValues {
  type?: CategoryType
  categoryId?: number
  subcategoryId?: number | null
  amount?: number
  note?: string | null
}

interface TransactionFormProps {
  open: boolean
  date: string
  categories: Category[]
  initialValues?: TransactionFormInitialValues
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: TransactionFormValues) => Promise<void> | void
}

interface InternalFormValues {
  type: CategoryType
  categoryId: number
  subcategoryId?: number
  displayAmount: number
  note?: string
}

function TransactionForm({
  open,
  date,
  categories,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit
}: TransactionFormProps): React.JSX.Element {
  const [form] = Form.useForm<InternalFormValues>()
  const type = Form.useWatch('type', form)
  const categoryId = Form.useWatch('categoryId', form)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        type: initialValues?.type ?? 'expense',
        categoryId: initialValues?.categoryId,
        subcategoryId: initialValues?.subcategoryId ?? undefined,
        displayAmount: initialValues?.amount ? initialValues.amount / 100 : undefined,
        note: initialValues?.note ?? undefined
      })
    }
  }, [open, initialValues, form])

  const primaryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.parentId === null && c.type === type)
        .map((c) => ({ value: c.id, label: c.name })),
    [categories, type]
  )
  const subOptions = useMemo(
    () => categories.filter((c) => c.parentId === categoryId).map((c) => ({ value: c.id, label: c.name })),
    [categories, categoryId]
  )

  const handleTypeChange = (): void => {
    form.setFieldValue('categoryId', undefined)
    form.setFieldValue('subcategoryId', undefined)
  }
  const handleCategoryChange = (): void => {
    form.setFieldValue('subcategoryId', undefined)
  }

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields()
    await onSubmit({
      type: values.type,
      categoryId: values.categoryId,
      subcategoryId: values.subcategoryId ?? null,
      amount: Math.round(values.displayAmount * 100),
      note: values.note ?? null
    })
  }

  return (
    <Modal
      title={`记一笔 · ${date}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Radio.Group onChange={handleTypeChange}>
            <Radio.Button value="expense">支出</Radio.Button>
            <Radio.Button value="income">收入</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="categoryId"
          label="一级分类"
          rules={[{ required: true, message: '请选择一级分类' }]}
        >
          <Select options={primaryOptions} placeholder="选择分类" onChange={handleCategoryChange} />
        </Form.Item>
        <Form.Item name="subcategoryId" label="二级分类（选填，仅作备注）">
          <Select options={subOptions} placeholder="选择二级分类" allowClear disabled={!categoryId} />
        </Form.Item>
        <Form.Item
          name="displayAmount"
          label="金额"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="0.00" />
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input placeholder="选填" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransactionForm
