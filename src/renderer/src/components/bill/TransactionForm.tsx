import { useEffect, useMemo } from 'react'
import { Form, Input, InputNumber, Modal, Radio, Select } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Category, CategoryType } from '@shared/types/category'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import { categoryDisplayName } from '@renderer/utils/categoryName'

export interface TransactionFormValues {
  type: CategoryType
  categoryId: number
  amount: number
  note?: string | null
}

interface TransactionFormInitialValues {
  type?: CategoryType
  categoryId?: number
  amount?: number
  note?: string | null
}

interface TransactionFormProps {
  open: boolean
  date: string
  categories: Category[]
  initialValues?: TransactionFormInitialValues
  defaultExpenseCategoryId?: number | null
  defaultIncomeCategoryId?: number | null
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: TransactionFormValues) => Promise<void> | void
}

interface InternalFormValues {
  type: CategoryType
  categoryId: number
  displayAmount: number
  note?: string
}

function TransactionForm({
  open,
  date,
  categories,
  initialValues,
  defaultExpenseCategoryId,
  defaultIncomeCategoryId,
  confirmLoading,
  onCancel,
  onSubmit
}: TransactionFormProps): React.JSX.Element {
  const { t } = useTranslation()
  const currency = useCurrencyFormatter()
  const [form] = Form.useForm<InternalFormValues>()
  const type = Form.useWatch('type', form)

  const resolveDefaultCategoryId = (forType: CategoryType): number | undefined => {
    const defaultId = forType === 'expense' ? defaultExpenseCategoryId : defaultIncomeCategoryId
    if (!defaultId) return undefined
    return categories.some((c) => c.id === defaultId && c.type === forType) ? defaultId : undefined
  }

  useEffect(() => {
    if (open) {
      const initialType = initialValues?.type ?? 'expense'
      form.setFieldsValue({
        type: initialType,
        categoryId: initialValues?.categoryId ?? resolveDefaultCategoryId(initialType),
        displayAmount: initialValues?.amount ? initialValues.amount / 100 : undefined,
        note: initialValues?.note ?? undefined
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues, form])

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.type === type)
        .map((c) => ({ value: c.id, label: categoryDisplayName(c, t) })),
    [categories, type, t]
  )

  const handleTypeChange = (e: RadioChangeEvent): void => {
    form.setFieldValue('categoryId', resolveDefaultCategoryId(e.target.value as CategoryType))
  }

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields()
    await onSubmit({
      type: values.type,
      categoryId: values.categoryId,
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
          <Radio.Group className="type-toggle" onChange={handleTypeChange}>
            <Radio.Button value="expense">{t('transaction.form.expense')}</Radio.Button>
            <Radio.Button value="income">{t('transaction.form.income')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="categoryId"
          label={t('transaction.form.primaryCategory')}
          rules={[{ required: true, message: t('transaction.form.primaryRequired') }]}
        >
          <Select options={categoryOptions} placeholder={t('transaction.form.selectCategory')} />
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
