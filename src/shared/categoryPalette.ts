/** Validated categorical palette (light mode) — see dataviz skill references/palette.md.
 * Shared between main (category default-color assignment, DB backfill migration) and
 * renderer (report pie chart) so a category's color is the same everywhere it appears.
 * Expanded from 8 to 14 colors — the default expense category set now has 14 entries, and 8
 * colors cycling via `% length` was producing visible collisions (e.g. two categories both
 * landing on the same blue). The extra 6 hues were chosen to sit in gaps between the original
 * 8 around the hue wheel, so no two colors in a single 14-item cycle look alike. Keep this in
 * sync with Kakeibo-mobile/src/shared/categoryPalette.ts. */
export const CATEGORY_COLOR_PALETTE = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // amber
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834', // orange
  '#17a2b8', // cyan
  '#a3a808', // olive
  '#9c27b0', // purple
  '#8a5a2b', // brown
  '#607d8b', // slate
  '#c2185b' // crimson
] as const
