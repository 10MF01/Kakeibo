import type { TFunction } from 'i18next'
import type { Category } from '@shared/types/category'
import type { CategoryBreakdownItem } from '@shared/types/report'

function resolveName(name: string, nameKey: string | null, t: TFunction): string {
  if (nameKey) {
    const key = nameKey.replace(/^category\./, '')
    return t(`categories.seed.${key}`, name)
  }
  return name
}

/** Seed categories carry a name_key (e.g. "category.food") so their label can be
 *  retranslated on language switch; user-created categories are free text and stay as-is. */
export function categoryDisplayName(category: Pick<Category, 'name' | 'nameKey'>, t: TFunction): string {
  return resolveName(category.name, category.nameKey, t)
}

export function breakdownItemDisplayName(item: CategoryBreakdownItem, t: TFunction): string {
  return resolveName(item.categoryName, item.categoryNameKey, t)
}
