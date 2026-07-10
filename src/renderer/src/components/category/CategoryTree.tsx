import { Button, Card, Empty, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { Category } from '@shared/types/category'
import { categoryDisplayName } from '@renderer/utils/categoryName'

interface CategoryTreeProps {
  categories: Category[]
  onEditPrimary: (category: Category) => void
  onDeletePrimary: (category: Category) => void
}

function CategoryTree({
  categories,
  onEditPrimary,
  onDeletePrimary
}: CategoryTreeProps): React.JSX.Element {
  const { t } = useTranslation()

  if (categories.length === 0) {
    return <Empty description={t('categories.empty')} />
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      {categories.map((category) => (
        <Card key={category.id} size="small" styles={{ body: { padding: 12 } }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: category.color ?? '#999'
                }}
              />
              <Typography.Text strong>{categoryDisplayName(category, t)}</Typography.Text>
            </Space>
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditPrimary(category)}
              />
              <Popconfirm
                title={t('categories.deleteConfirmTitle')}
                description={t('categories.deleteConfirmDesc')}
                onConfirm={() => onDeletePrimary(category)}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          </Space>
        </Card>
      ))}
    </Space>
  )
}

export default CategoryTree
