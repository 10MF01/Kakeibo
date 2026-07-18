import { Button, Card, Empty, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Category } from '@shared/types/category'
import { categoryDisplayName } from '@renderer/utils/categoryName'

interface CategoryTreeProps {
  categories: Category[]
  onEditPrimary: (category: Category) => void
  onDeletePrimary: (category: Category) => void
  onReorder: (orderedIds: number[]) => void
}

interface CategoryRowProps {
  category: Category
  onEditPrimary: (category: Category) => void
  onDeletePrimary: (category: Category) => void
}

function CategoryRow({ category, onEditPrimary, onDeletePrimary }: CategoryRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id
  })

  return (
    <Card
      ref={setNodeRef}
      size="small"
      styles={{ body: { padding: 12 } }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <Space align="center">
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', display: 'flex', color: 'rgba(0, 0, 0, 0.35)' }}
          >
            <HolderOutlined />
          </span>
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: category.color ?? '#999',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              position: 'relative',
              top: 3
            }}
          />
          <Typography.Text strong>{categoryDisplayName(category)}</Typography.Text>
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
  )
}

function CategoryTree({
  categories,
  onEditPrimary,
  onDeletePrimary,
  onReorder
}: CategoryTreeProps): React.JSX.Element {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (categories.length === 0) {
    return <Empty description={t('categories.empty')} />
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...categories]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered.map((c) => c.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onEditPrimary={onEditPrimary}
              onDeletePrimary={onDeletePrimary}
            />
          ))}
        </Space>
      </SortableContext>
    </DndContext>
  )
}

export default CategoryTree
