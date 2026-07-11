import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { PieSeriesOption } from 'echarts/charts'
import type { LegendComponentOption, TooltipComponentOption } from 'echarts/components'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CategoryBreakdownItem } from '@shared/types/report'
import { buildPieData } from '@renderer/utils/pieData'
import { useCurrencyFormatter } from '@renderer/hooks/useCurrencyFormatter'

echarts.use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])

type PieOption = ComposeOption<PieSeriesOption | LegendComponentOption | TooltipComponentOption>

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
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  const pieData = useMemo(() => (data.length === 0 ? [] : buildPieData(data, t)), [data, t])

  useEffect(() => {
    if (!containerRef.current) return
    const chart = echarts.init(containerRef.current)
    chartRef.current = chart
    const handleResize = (): void => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || pieData.length === 0) return

    const option: PieOption = {
      animation: animate,
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params
          const value = typeof p.value === 'number' ? p.value.toFixed(currency.precision) : p.value
          return `${p.marker ?? ''}${p.name}<br/>${t('report.table.amount')}: ${value} (${p.percent}%)`
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        icon: 'circle'
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '68%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          label: {
            formatter: '{b}',
            fontSize: 12,
            width: 80,
            overflow: 'break'
          },
          labelLine: {
            show: true
          },
          data: pieData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          }))
        }
      ]
    }

    chart.setOption(option, true)
  }, [pieData, animate, currency.precision, t])

  if (data.length === 0) {
    return <Empty description={t('report.noData')} style={{ padding: '48px 0' }} />
  }

  return <div ref={containerRef} style={{ width: '100%', height }} />
}

export default CategoryPieChart
