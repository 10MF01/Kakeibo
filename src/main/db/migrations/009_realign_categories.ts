import type Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

// `seed_key` is a permanent identity marker for default categories, separate from `name_key`.
// `name_key` decides whether a category's label gets retranslated on language switch, and
// `updateCategory` intentionally nulls it the moment a user renames the category ("it's free
// text now"). But `syncService.ts`'s `mergeCategories` was using that same `name_key` (plus a
// (type, name) fallback) to recognize "this is the same default category on both devices" — a
// rename severs both signals at once, so the *other* device's still-unrenamed copy of that
// default gets treated as a brand new category and re-inserted as a duplicate on the next sync.
// `seed_key` fixes this by never being touched by a rename — see CLAUDE.md's "Realigned default
// category set" note for the full incident writeup (a live-data investigation of this exact
// desktop database found 3 rename-created duplicates the user had already deleted by hand).
export const migration009RealignCategories = `
ALTER TABLE categories ADD COLUMN seed_key TEXT NULL;
`

interface TargetSlot {
  type: 'expense' | 'income'
  name: string
  sortOrder: number
  color: string
}

// Final agreed-upon default category set (see CLAUDE.md). Order here is display order
// (sort_order); colors come from the now-14-color CATEGORY_COLOR_PALETTE, hand-assigned per
// slot to guarantee no two categories of the same type share a color.
const TARGET_ORDER: TargetSlot[] = [
  { type: 'expense', name: '饮食', sortOrder: 1, color: '#2a78d6' },
  { type: 'expense', name: '房租', sortOrder: 2, color: '#1baf7a' },
  { type: 'expense', name: '交通', sortOrder: 3, color: '#eda100' },
  { type: 'expense', name: '水电燃气', sortOrder: 4, color: '#008300' },
  { type: 'expense', name: '生活用品', sortOrder: 5, color: '#4a3aa7' },
  { type: 'expense', name: '娱乐', sortOrder: 6, color: '#e34948' },
  { type: 'expense', name: '购物', sortOrder: 7, color: '#e87ba4' },
  { type: 'expense', name: '话费', sortOrder: 8, color: '#eb6834' },
  { type: 'expense', name: '医疗', sortOrder: 9, color: '#17a2b8' },
  { type: 'expense', name: '社交', sortOrder: 10, color: '#a3a808' },
  { type: 'expense', name: '教育', sortOrder: 11, color: '#9c27b0' },
  { type: 'expense', name: '烟酒', sortOrder: 12, color: '#8a5a2b' },
  { type: 'expense', name: '理发', sortOrder: 13, color: '#607d8b' },
  { type: 'expense', name: '其他支出', sortOrder: 14, color: '#c2185b' },
  { type: 'income', name: '工资', sortOrder: 1, color: '#2a78d6' },
  { type: 'income', name: '奖金', sortOrder: 2, color: '#1baf7a' },
  { type: 'income', name: '副业', sortOrder: 3, color: '#eda100' },
  { type: 'income', name: '投资收益', sortOrder: 4, color: '#008300' },
  { type: 'income', name: '其他收入', sortOrder: 5, color: '#4a3aa7' }
]

export function realignCategories(db: Database.Database): void {
  const run = db.transaction(() => {
    // 1. Every category that still carries its original name_key gets seed_key copied over —
    // covers every default that was never renamed. Pure bookkeeping, no visible field changes,
    // so this doesn't bump updated_at.
    db.prepare(
      `UPDATE categories SET seed_key = name_key WHERE name_key IS NOT NULL AND seed_key IS NULL`
    ).run()

    // 2. The 3 defaults that got renamed (nulling name_key) before this fix existed: restore
    // name_key so they translate again, and set seed_key so sync recognizes them going forward.
    // Matched by (type, current name, name_key IS NULL, is_system=1) — a combination that only
    // matches these specific rename-bug leftovers in this database.
    const restoreRenamed = db.prepare(
      `UPDATE categories SET name_key = ?, seed_key = ?, updated_at = datetime('now')
       WHERE type = ? AND name = ? AND name_key IS NULL AND is_system = 1 AND deleted_at IS NULL`
    )
    restoreRenamed.run('category.housing', 'category.housing', 'expense', '房租')
    restoreRenamed.run('category.communication', 'category.communication', 'expense', '话费')
    restoreRenamed.run('category.sideIncome', 'category.sideIncome', 'income', '副业')

    // 3. "购物" was also renamed (to "生活用品") before this fix — the user wants both as
    // separate categories going forward, so "生活用品" gets a brand-new identity instead of
    // inheriting category.shopping (a fresh "购物" row is (re)created in step 5).
    db.prepare(
      `UPDATE categories SET name_key = 'category.dailySupplies', seed_key = 'category.dailySupplies',
       updated_at = datetime('now')
       WHERE type = 'expense' AND name = '生活用品' AND name_key IS NULL AND is_system = 1
         AND deleted_at IS NULL`
    ).run()

    // 4. "社交"/"烟酒" already exist as the user's own ad-hoc categories (is_system=0) —
    // promote them to official defaults with a real name_key/seed_key.
    const promote = db.prepare(
      `UPDATE categories SET is_system = 1, name_key = ?, seed_key = ?, updated_at = datetime('now')
       WHERE type = 'expense' AND name = ? AND is_system = 0 AND deleted_at IS NULL`
    )
    promote.run('category.socializing', 'category.socializing', '社交')
    promote.run('category.tobaccoAlcohol', 'category.tobaccoAlcohol', '烟酒')

    // 5. Re-create the standalone "购物" (its original slot became "生活用品") and add the
    // still-missing "理发". Existence-checked so this never double-inserts.
    const exists = db.prepare(
      `SELECT 1 FROM categories WHERE type = ? AND name = ? AND deleted_at IS NULL`
    )
    const insert = db.prepare(
      `INSERT INTO categories (uuid, type, name, name_key, seed_key, color, sort_order, is_system)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    )
    if (!exists.get('expense', '购物')) {
      insert.run(randomUUID(), 'expense', '购物', 'category.shopping', 'category.shopping', '#e87ba4', 7)
    }
    if (!exists.get('expense', '理发')) {
      insert.run(randomUUID(), 'expense', '理发', 'category.haircut', 'category.haircut', '#607d8b', 13)
    }

    // 6. Reassign sort_order/color for the full official list per the new agreed-upon order —
    // covers both the rows just touched above and the ones that were never renamed at all.
    const reorder = db.prepare(
      `UPDATE categories SET sort_order = ?, color = ?, updated_at = datetime('now')
       WHERE type = ? AND name = ? AND deleted_at IS NULL`
    )
    for (const item of TARGET_ORDER) {
      reorder.run(item.sortOrder, item.color, item.type, item.name)
    }

    // "衣物" is an extra personal category outside the official set (per user confirmation) —
    // just move it past the official 14 so it doesn't collide with their sort_order values.
    // Matched by name only (not is_system) — it was user-created (is_system=0) when this
    // investigation began, but had already been flipped to is_system=1 by an unrelated manual
    // edit before this migration ran, so gating on is_system=0 here would silently miss it.
    db.prepare(
      `UPDATE categories SET sort_order = 15, updated_at = datetime('now')
       WHERE type = 'expense' AND name = '衣物' AND deleted_at IS NULL`
    ).run()
  })
  run()
}
