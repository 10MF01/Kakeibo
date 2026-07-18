import type { Category } from '@shared/types/category'
import type { CategoryBreakdownItem } from '@shared/types/report'

export function categoryDisplayName(category: Pick<Category, 'name'>): string {
  return category.name
}

export function breakdownItemDisplayName(item: CategoryBreakdownItem): string {
  return item.categoryName
}
