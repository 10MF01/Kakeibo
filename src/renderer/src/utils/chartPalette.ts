/** Validated categorical palette (light mode) — see dataviz skill references/palette.md */
export const CATEGORICAL_PALETTE = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834' // orange
] as const

export const OTHER_SLICE_COLOR = '#898781'

/** Color follows the category entity (stable across reports), not its rank within one report. */
export function colorForCategory(categoryId: number): string {
  return CATEGORICAL_PALETTE[categoryId % CATEGORICAL_PALETTE.length]
}
