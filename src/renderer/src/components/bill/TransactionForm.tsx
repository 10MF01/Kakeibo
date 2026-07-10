import { useEffect, useMemo } from 'react'
import { Form, Input, InputNumber, Modal, Radio, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Category, CategoryType } from '@shared/types/category'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import { categoryDisplayName } from '@renderer/utils/categoryName'

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
  const { t } = useTranslation()
  const currency = useCurrencyFormatter()
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
        .map((c) => ({ value: c.id, label: categoryDisplayName(c, t) })),
    [categories, type, t]
  )
  const subOptions = useMemo(
    () =>
      categories
        .filter((c) => c.parentId === categoryId)
        .map((c) => ({ value: c.id, label: categoryDisplayName(c, t) })),
    [categories, categoryId, t]
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
      title={t('transaction.form.title', { date })}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="type" label={t('transaction.form.type')} rules={[{ required: true }]}>
          <Radio.Group onChange={handleTypeChange}>
            <Radio.Button value="expense">{t('transaction.form.expense')}</Radio.Button>
            <Radio.Button value="income">{t('transaction.form.income')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="categoryId"
          label={t('transaction.form.primaryCategory')}
          rules={[{ required: true, message: t('transaction.form.primaryRequired') }]}
        >
          <Select
            options={primaryOptions}
            placeholder={t('transaction.form.selectCategory')}
            onChange={handleCategoryChange}
          />
        </Form.Item>
        <Form.Item name="subcategoryId" label={t('transaction.form.subcategory')}>
          <Select
            options={subOptions}
            placeholder={t('transaction.form.selectSubcategory')}
            allowClear
            disabled={!categoryId}
          />
        </Form.Item>
        <Form.Item
          name="displayAmount"
          label={t('transaction.form.amount')}
          rules={[{ required: true, message: t('transaction.form.amountRequired') }]}
        >
          <InputNumber
            min={currency.precision > 0 ? 0.01 : 1}
            precision={currency.precision}
            style={{ width: '100%' }}
            placeholder={currency.precision > 0 ? '0.00' : '0'}
          />
        </Form.Item>
        <Form.Item name="note" label={t('transaction.form.note')}>
          <Input placeholder={t('transaction.form.notePlaceholder')} maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransactionForm
