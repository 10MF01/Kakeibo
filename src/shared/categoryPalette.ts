/** Validated categorical palette (light mode) — see dataviz skill references/palette.md.
 * Shared between main (category default-color assignment, DB backfill migration) and
 * renderer (report pie chart) so a category's color is the same everywhere it appears. */
export const CATEGORY_COLOR_PALETTE = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834' // orange
] as const
