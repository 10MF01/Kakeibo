import { CATEGORY_COLOR_PALETTE } from '@shared/categoryPalette'

// Seeded categories (002) never got a color, and pre-v2.1 user categories could
// also be created with color=NULL — the category tree rendered these as a flat
// gray dot, and the report pie chart used an unrelated palette keyed by id.
// Backfill every NULL color from the same shared palette the app now uses for
// new categories and the pie chart, ordered per-type so adjacent categories in
// the list get visually distinct colors rather than a repeating pattern by id.
const caseClauses = CATEGORY_COLOR_PALETTE.map((hex, i) => `WHEN ${i} THEN '${hex}'`).join('\n      ')

export const migration005BackfillCategoryColors = `
WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (PARTITION BY type ORDER BY sort_order, id) - 1) % ${CATEGORY_COLOR_PALETTE.length} AS palette_index
  FROM categories
  WHERE color IS NULL
)
UPDATE categories
SET color = (
  SELECT CASE ranked.palette_index
      ${caseClauses}
  END
  FROM ranked WHERE ranked.id = categories.id
)
WHERE id IN (SELECT id FROM ranked);
`
