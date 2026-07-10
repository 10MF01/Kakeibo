import { useState } from 'react'
import { Button, Card, Empty, Input, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import type { Category } from '@shared/types/category'

interface CategoryTreeProps {
  categories: Category[]
  onEditPrimary: (category: Category) => void
  onDeletePrimary: (category: Category) => void
  onAddSubcategory: (parent: Category, name: string) => void
  onDeleteSubcategory: (category: Category) => void
}

function CategoryTree({
  categories,
  onEditPrimary,
  onDeletePrimary,
  onAddSubcategory,
  onDeleteSubcategory
}: CategoryTreeProps): React.JSX.Element {
  const primaries = categories.filter((c) => c.parentId === null)
  const [addingFor, setAddingFor] = useState<number | null>(null)
  const [draftName, setDraftName] = useState('')

  if (primaries.length === 0) {
    return <Empty description="暂无分类" />
  }

  const commitDraft = (primary: Category): void => {
    const name = draftName.trim()
    if (name) onAddSubcategory(primary, name)
    setDraftName('')
    setAddingFor(null)
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      {primaries.map((primary) => {
        const subs = categories.filter((c) => c.parentId === primary.id)
        return (
          <Card key={primary.id} size="small" styles={{ body: { padding: 12 } }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: primary.color ?? '#999'
                  }}
                />
                <Typography.Text strong>{primary.name}</Typography.Text>
              </Space>
              <Space size={4}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEditPrimary(primary)}
                />
                <Popconfirm
                  title="删除该分类？"
                  description="若存在关联的流水或二级分类将无法删除"
                  onConfirm={() => onDeletePrimary(primary)}
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Space size={[6, 6]} wrap>
                {subs.map((sub) => (
                  <Tag
                    key={sub.id}
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      onDeleteSubcategory(sub)
                    }}
                  >
                    {sub.name}
                  </Tag>
                ))}
                {addingFor === primary.id ? (
                  <Input
                    size="small"
                    autoFocus
                    style={{ width: 120 }}
                    value={draftName}
                    placeholder="二级分类名称"
                    onChange={(e) => setDraftName(e.target.value)}
                    onPressEnter={() => commitDraft(primary)}
                    onBlur={() => commitDraft(primary)}
                  />
                ) : (
                  <Tag
                    onClick={() => setAddingFor(primary.id)}
                    style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                  >
                    <PlusOutlined /> 添加二级分类
                  </Tag>
                )}
              </Space>
            </div>
          </Card>
        )
      })}
    </Space>
  )
}

export default CategoryTree
