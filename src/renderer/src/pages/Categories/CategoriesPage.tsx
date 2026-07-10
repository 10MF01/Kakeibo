import { useEffect, useState } from 'react'
import { Button, Card, Col, Row, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import CategoryTree from '@renderer/components/category/CategoryTree'
import CategoryForm, { type CategoryFormValues } from '@renderer/components/category/CategoryForm'
import { useCategoryStore } from '@renderer/store/useCategoryStore'
import type { Category, CategoryType } from '@shared/types/category'

const ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_DUPLICATE_NAME: '同级下已存在同名分类',
  CATEGORY_HAS_SUBCATEGORIES: '请先删除该分类下的二级分类',
  CATEGORY_IN_USE: '该分类已被流水记录引用，无法删除',
  CATEGORY_NOT_FOUND: '分类不存在，请刷新后重试'
}

function resolveErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code]
  return err instanceof Error ? err.message : '操作失败'
}

interface FormState {
  open: boolean
  mode: 'create-primary' | 'edit-primary'
  type: CategoryType
  category?: Category
}

function CategoriesPage(): React.JSX.Element {
  const { categories, fetch, refresh } = useCategoryStore()
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
      message.error(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePrimary = async (category: Category): Promise<void> => {
    try {
      await window.api.categories.delete(category.id)
      await refresh()
    } catch (err) {
      message.error(resolveErrorMessage(err))
    }
  }

  const handleAddSubcategory = async (parent: Category, name: string): Promise<void> => {
    try {
      await window.api.categories.create({ parentId: parent.id, type: parent.type, name })
      await refresh()
    } catch (err) {
      message.error(resolveErrorMessage(err))
    }
  }

  const handleDeleteSubcategory = async (category: Category): Promise<void> => {
    try {
      await window.api.categories.delete(category.id)
      await refresh()
    } catch (err) {
      message.error(resolveErrorMessage(err))
    }
  }

  return (
    <div>
      <Typography.Title level={3}>分类管理</Typography.Title>
      <Typography.Paragraph type="secondary">
        一级分类用于记账统计，二级分类仅作备注，不参与统计。
      </Typography.Paragraph>
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title="支出分类"
            extra={
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => openCreatePrimary('expense')}
              >
                新建一级分类
              </Button>
            }
          >
            <CategoryTree
              categories={expenseCategories}
              onEditPrimary={openEditPrimary}
              onDeletePrimary={handleDeletePrimary}
              onAddSubcategory={handleAddSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="收入分类"
            extra={
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => openCreatePrimary('income')}
              >
                新建一级分类
              </Button>
            }
          >
            <CategoryTree
              categories={incomeCategories}
              onEditPrimary={openEditPrimary}
              onDeletePrimary={handleDeletePrimary}
              onAddSubcategory={handleAddSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
            />
          </Card>
        </Col>
      </Row>
      <CategoryForm
        open={formState.open}
        title={formState.mode === 'create-primary' ? '新建一级分类' : '编辑分类'}
        initialValues={
          formState.category
            ? { name: formState.category.name, color: formState.category.color }
            : undefined
        }
        confirmLoading={submitting}
        onCancel={closeForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default CategoriesPage
