import { useEffect, useState } from 'react'
import { Button, Card, Col, Row, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import CategoryTree from '@renderer/components/category/CategoryTree'
import CategoryForm, { type CategoryFormValues } from '@renderer/components/category/CategoryForm'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import { categoryDisplayName } from '@renderer/utils/categoryName'
import type { Category, CategoryType } from '@shared/types/category'
import { CATEGORY_COLOR_PALETTE } from '@shared/categoryPalette'
import type { TFunction } from 'i18next'

const ERROR_CODES = ['CATEGORY_DUPLICATE_NAME', 'CATEGORY_IN_USE', 'CATEGORY_NOT_FOUND'] as const

function resolveErrorMessage(err: unknown, t: TFunction): string {
  const code = (err as { code?: string } | undefined)?.code
  if (code && (ERROR_CODES as readonly string[]).includes(code)) {
    return t(`categories.errors.${code}`)
  }
  return err instanceof Error ? err.message : t('categories.errors.default')
}

interface FormState {
  open: boolean
  mode: 'create-primary' | 'edit-primary'
  type: CategoryType
  category?: Category
}

function CategoriesPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { categories, fetch, refresh, reorder } = useCategoryStore()
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState<FormState>({
    open: false,
    mode: 'create-primary',
    type: 'expense'
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  const nextColorFor = (type: CategoryType): string => {
    const count = categories.filter((c) => c.type === type).length
    return CATEGORY_COLOR_PALETTE[count % CATEGORY_COLOR_PALETTE.length]
  }

  const openCreatePrimary = (type: CategoryType): void => {
    setFormState({ open: true, mode: 'create-primary', type })
  }
  const openEditPrimary = (category: Category): void => {
    setFormState({ open: true, mode: 'edit-primary', type: category.type, category })
  }
  const closeForm = (): void => setFormState((s) => ({ ...s, open: false }))

  const handleFormSubmit = async (values: CategoryFormValues): Promise<void> => {
    setSubmitting(true)
    try {
      if (formState.mode === 'create-primary') {
        await window.api.categories.create({
          type: formState.type,
          name: values.name,
          color: values.color
        })
      } else if (formState.category) {
        await window.api.categories.update(formState.category.id, {
          name: values.name,
          color: values.color
        })
      }
      await refresh()
      closeForm()
    } catch (err) {
      message.error(resolveErrorMessage(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePrimary = async (category: Category): Promise<void> => {
    try {
      await window.api.categories.delete(category.id)
      await refresh()
    } catch (err) {
      message.error(resolveErrorMessage(err, t))
    }
  }

  return (
    <div>
      <Typography.Title level={3}>{t('categories.title')}</Typography.Title>
      <Typography.Paragraph type="secondary">{t('categories.subtitle')}</Typography.Paragraph>
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={t('categories.expense')}
            extra={
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => openCreatePrimary('expense')}
              >
                {t('categories.createPrimary')}
              </Button>
            }
          >
            <CategoryTree
              categories={expenseCategories}
              onEditPrimary={openEditPrimary}
              onDeletePrimary={handleDeletePrimary}
              onReorder={reorder}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={t('categories.income')}
            extra={
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => openCreatePrimary('income')}
              >
                {t('categories.createPrimary')}
              </Button>
            }
          >
            <CategoryTree
              categories={incomeCategories}
              onEditPrimary={openEditPrimary}
              onDeletePrimary={handleDeletePrimary}
              onReorder={reorder}
            />
          </Card>
        </Col>
      </Row>
      <CategoryForm
        open={formState.open}
        title={
          formState.mode === 'create-primary' ? t('categories.createPrimary') : t('categories.editTitle')
        }
        initialValues={
          formState.mode === 'edit-primary' && formState.category
            ? { name: categoryDisplayName(formState.category), color: formState.category.color }
            : { color: nextColorFor(formState.type) }
        }
        confirmLoading={submitting}
        onCancel={closeForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default CategoriesPage
