import type Database from 'better-sqlite3'

// Prunes the default category set down to only what actually has real transaction history (per
// a live-data review the user requested), renumbers the survivors to a tidy sequential `id`
// (purely cosmetic — sync identity is `uuid`/`seed_key`, never `id`, so this has no cross-device
// meaning, but the user explicitly asked for it anyway), and drops `name_key` entirely — category
// names are no longer retranslated per app language, so the column serves no purpose once
// `categoryDisplayName` stops consulting it (see categoryName.ts on both platforms).
export const migration010PruneAndRenumberCategories = `
-- schema-only change; the DROP COLUMN happens in postRun, after the data work, since SQLite
-- requires the column to still exist while the queries below reference it
`

interface TargetSlot {
  type: 'expense' | 'income'
  name: string
  newId: number
  sortOrder: number
  color: string
}

// Categories with zero live (non-deleted) transactions get soft-deleted — they never
// accumulated real usage, so they're dropped from the official default set going forward. The
// user can still add any of these back by hand later; nothing here is a hard delete.
const PRUNE_LIST: { type: 'expense' | 'income'; name: string }[] = [
  { type: 'expense', name: '购物' },
  { type: 'expense', name: '理发' },
  { type: 'expense', name: '衣物' },
  { type: 'income', name: '奖金' },
  { type: 'income', name: '副业' },
  { type: 'income', name: '投资收益' },
  { type: 'income', name: '其他收入' }
]

// Final 13-category set, in display order. `newId` starting at 1 is what the user asked for —
// purely a local-database cosmetic (see module comment) — colors come from
// CATEGORY_COLOR_PALETTE, cycled per type same as migration 009.
const TARGET_ORDER: TargetSlot[] = [
  { type: 'expense', name: '饮食', newId: 1, sortOrder: 1, color: '#2a78d6' },
  { type: 'expense', name: '房租', newId: 2, sortOrder: 2, color: '#1baf7a' },
  { type: 'expense', name: '交通', newId: 3, sortOrder: 3, color: '#eda100' },
  { type: 'expense', name: '水电燃气', newId: 4, sortOrder: 4, color: '#008300' },
  { type: 'expense', name: '生活用品', newId: 5, sortOrder: 5, color: '#4a3aa7' },
  { type: 'expense', name: '娱乐', newId: 6, sortOrder: 6, color: '#e34948' },
  { type: 'expense', name: '话费', newId: 7, sortOrder: 7, color: '#e87ba4' },
  { type: 'expense', name: '医疗', newId: 8, sortOrder: 8, color: '#eb6834' },
  { type: 'expense', name: '社交', newId: 9, sortOrder: 9, color: '#17a2b8' },
  { type: 'expense', name: '教育', newId: 10, sortOrder: 10, color: '#a3a808' },
  { type: 'expense', name: '烟酒', newId: 11, sortOrder: 11, color: '#9c27b0' },
  { type: 'expense', name: '其他支出', newId: 12, sortOrder: 12, color: '#8a5a2b' },
  { type: 'income', name: '工资', newId: 13, sortOrder: 1, color: '#2a78d6' }
]

// Renumbering existing PRIMARY KEY ids requires care: the *target* ids overlap with *other*
// surviving rows' *current* ids (e.g. "房租"'s target id=2 collides with "交通"'s current id=2),
// so a single UPDATE pass would hit the primary key uniqueness constraint. Two passes — first to
// a definitely-unused temporary range, then to the final compact range — avoids any collision.
const TEMP_ID_OFFSET = 100000

export function pruneAndRenumberCategories(db: Database.Database): void {
  db.pragma('foreign_keys = OFF')
  const run = db.transaction(() => {
    const pruneStmt = db.prepare(
      `UPDATE categories SET deleted_at = datetime('now'), updated_at = datetime('now')
       WHERE type = ? AND name = ? AND deleted_at IS NULL`
    )
    for (const p of PRUNE_LIST) pruneStmt.run(p.type, p.name)

    const findId = db.prepare(
      `SELECT id FROM categories WHERE type = ? AND name = ? AND deleted_at IS NULL`
    )
    const survivors = TARGET_ORDER.map((slot) => {
      const row = findId.get(slot.type, slot.name) as { id: number } | undefined
      if (!row) throw new Error(`migration 010: expected surviving category not found: ${slot.type}/${slot.name}`)
      return { ...slot, oldId: row.id }
    })

    const moveCategoryId = db.prepare('UPDATE categories SET id = ? WHERE id = ?')
    const moveTransactionCategoryId = db.prepare(
      'UPDATE transactions SET category_id = ? WHERE category_id = ?'
    )

    // Pass 1: every survivor's old id -> temp id (guaranteed free, since no category has ever had
    // an id anywhere near this range).
    for (const s of survivors) {
      const tempId = s.oldId + TEMP_ID_OFFSET
      moveCategoryId.run(tempId, s.oldId)
      moveTransactionCategoryId.run(tempId, s.oldId)
    }

    // Pruned/pre-existing tombstoned categories can still be squatting on an id inside the target
    // 1..N range (e.g. the just-pruned "奖金"/"副业" happened to already have ids 12/13, right in
    // the middle of this migration's target range) — soft-deleting a row doesn't free its id.
    // Relocate any such blocker to the same temp range before writing final ids, or pass 2 below
    // would hit the primary key constraint.
    const maxNewId = Math.max(...survivors.map((s) => s.newId))
    const blockers = db
      .prepare(`SELECT id FROM categories WHERE id BETWEEN 1 AND ?`)
      .all(maxNewId) as { id: number }[]
    for (const b of blockers) {
      const tempId = b.id + TEMP_ID_OFFSET
      moveCategoryId.run(tempId, b.id)
      moveTransactionCategoryId.run(tempId, b.id)
    }

    // Pass 2: temp id -> final compact id (target range is now fully clear).
    for (const s of survivors) {
      const tempId = s.oldId + TEMP_ID_OFFSET
      moveCategoryId.run(s.newId, tempId)
      moveTransactionCategoryId.run(s.newId, tempId)
    }

    const reorder = db.prepare('UPDATE categories SET sort_order = ?, color = ? WHERE id = ?')
    for (const s of survivors) reorder.run(s.sortOrder, s.color, s.newId)

    db.exec('ALTER TABLE categories DROP COLUMN name_key;')
  })
  run()
  db.pragma('foreign_keys = ON')
}
