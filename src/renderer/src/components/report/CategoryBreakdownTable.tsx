import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CategoryBreakdownItem } from '@shared/types/report'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'
import { breakdownItemDisplayName } from '@renderer/utils/categoryName'

interface CategoryBreakdownTableProps {
  data: CategoryBreakdownItem[]
}

function CategoryBreakdownTable({ data }: CategoryBreakdownTableProps): React.JSX.Element {
  const { t } = useTranslation()
  const currency = useCurrencyFormatter()

  return (
    <Table
      size="small"
      rowKey="categoryId"
      dataSource={data}
      pagination={false}
      columns={[
        {
          title: t('report.table.category'),
          dataIndex: 'categoryName',
          render: (_: string, record: CategoryBreakdownItem) => breakdownItemDisplayName(record, t)
        },
        {
          title: t('report.table.amount'),
          dataIndex: 'total',
          align: 'right',
          render: (value: number) => currency.format(value)
        },
        {
          title: t('report.table.percentage'),
          dataIndex: 'percentage',
          align: 'right',
          render: (value: number) => `${value}%`
        },
        { title: t('report.table.count'), dataIndex: 'count', align: 'right' }
      ]}
    />
  )
}

export default CategoryBreakdownTable
