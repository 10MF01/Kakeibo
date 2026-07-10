import { Table } from 'antd'
import type { CategoryBreakdownItem } from '@shared/types/report'
import { toDisplayAmount } from '@shared/amount'

interface CategoryBreakdownTableProps {
  data: CategoryBreakdownItem[]
}

function CategoryBreakdownTable({ data }: CategoryBreakdownTableProps): React.JSX.Element {
  return (
    <Table
      size="small"
      rowKey="categoryId"
      dataSource={data}
      pagination={false}
      columns={[
        { title: '分类', dataIndex: 'categoryName' },
        {
          title: '金额',
          dataIndex: 'total',
          align: 'right',
          render: (value: number) => toDisplayAmount(value).toFixed(2)
        },
        {
          title: '占比',
          dataIndex: 'percentage',
          align: 'right',
          render: (value: number) => `${value}%`
        },
        { title: '笔数', dataIndex: 'count', align: 'right' }
      ]}
    />
  )
}

export default CategoryBreakdownTable
