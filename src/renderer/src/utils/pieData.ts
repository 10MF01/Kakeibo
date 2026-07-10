import type { CategoryBreakdownItem } from '@shared/types/report'
import { toDisplayAmount } from '@shared/amount'
import { colorForCategory, OTHER_SLICE_COLOR } from './chartPalette'

export interface PieDatum {
  name: string
  value: number
  color: string
}

const MAX_SLICES = 7

/** Past the token ceiling, fold the tail into "其他" rather than generating more hues. */
export function buildPieData(items: CategoryBreakdownItem[]): PieDatum[] {
  const sorted = [...items].sort((a, b) => b.total - a.total)

  if (sorted.length <= MAX_SLICES) {
    return sorted.map((item) => ({
      name: item.categoryName,
      value: toDisplayAmount(item.total),
      color: colorForCategory(item.categoryId)
    }))
  }

  const head = sorted.slice(0, MAX_SLICES - 1)
  const tail = sorted.slice(MAX_SLICES - 1)
  const otherTotal = tail.reduce((sum, item) => sum + item.total, 0)

  return [
    ...head.map((item) => ({
      name: item.categoryName,
      value: toDisplayAmount(item.total),
      color: colorForCategory(item.categoryId)
    })),
    { name: '其他', value: toDisplayAmount(otherTotal), color: OTHER_SLICE_COLOR }
  ]
}
