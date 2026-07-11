import { CATEGORY_COLOR_PALETTE } from '@shared/categoryPalette'

export const OTHER_SLICE_COLOR = '#898781'

/** Fallback only — normal path is reading the category's own stored color. */
export function colorForCategory(categoryId: number): string {
  return CATEGORY_COLOR_PALETTE[categoryId % CATEGORY_COLOR_PALETTE.length]
}
