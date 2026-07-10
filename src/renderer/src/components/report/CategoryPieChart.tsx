import { Pie } from '@ant-design/plots'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CategoryBreakdownItem } from '@shared/types/report'
import { buildPieData } from '@renderer/utils/pieData'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[]
  height?: number
  /** Disable entrance animation — required for the print view so printToPDF doesn't
   *  capture the chart mid-sweep-in. */
  animate?: boolean
}

function CategoryPieChart({
  data,
  height = 320,
  animate = true
}: CategoryPieChartProps): React.JSX.Element {
  const { t } = useTranslation()
  const currency = useCurrencyFormatter()

  if (data.length === 0) {
    return <Empty description={t('report.noData')} style={{ padding: '48px 0' }} />
  }

  const pieData = buildPieData(data, t)

  return (
    <Pie
      data={pieData}
      angleField="value"
      colorField="name"
      radius={0.8}
      innerRadius={0.55}
      height={height}
      animate={animate ? undefined : false}
      scale={{
        color: {
          domain: pieData.map((d) => d.name),
          range: pieData.map((d) => d.color)
        }
      }}
      label={{
        text: (d: { name: string }) => d.name,
        style: { fontSize: 12 }
      }}
      legend={{
        color: { position: 'right', rowPadding: 4 }
      }}
      tooltip={{
        items: [
          {
            field: 'value',
            name: t('report.table.amount'),
            valueFormatter: (v: number) => v.toFixed(currency.precision)
          }
        ]
      }}
    />
  )
}

export default CategoryPieChart
