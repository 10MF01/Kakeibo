import type Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { migration001Init } from './migrations/001_init'
import { migration002SeedCategories } from './migrations/002_seed_categories'
import { migration003RemoveSubcategory } from './migrations/003_remove_subcategory'
import { migration004SingleActiveBill } from './migrations/004_single_active_bill'
import { migration005BackfillCategoryColors } from './migrations/005_backfill_category_colors'
import { migration006AddSyncUuid } from './migrations/006_add_sync_uuid'
import { migration007DedupeCategories } from './migrations/007_dedupe_categories'
import { migration008AddDeletedAt } from './migrations/008_add_deleted_at'
import { migration009RealignCategories, realignCategories } from './migrations/009_realign_categories'
import {
  migration010PruneAndRenumberCategories,
  pruneAndRenumberCategories
} from './migrations/010_prune_and_renumber_categories'

// Row ids are backfilled with a random uuid one-by-one (rather than in the migration's raw
// SQL) because SQLite has no built-in UUID generation function to call from a single UPDATE.
function backfillUuids(db: Database.Database): void {
  for (const table of ['categories', 'bills', 'transactions']) {
    const rows = db.prepare(`SELECT id FROM ${table} WHERE uuid IS NULL`).all() as {
      id: number
    }[]
    const stmt = db.prepare(`UPDATE ${table} SET uuid = ? WHERE id = ?`)
    for (const row of rows) stmt.run(randomUUID(), row.id)
  }
}

// Keeps the user's own added category over the built-in default when both exist under the same
// (type, name) — reassigns the loser's transactions to the survivor, then removes the loser.
// See migrations/007_dedupe_categories.ts for why this can happen despite the (type, name)
// unique index existing on desktop since migration 003.
function dedupeCategories(db: Database.Database): void {
  const groups = db
    .prepare('SELECT type, name FROM categories GROUP BY type, name HAVING COUNT(*) > 1')
    .all() as { type: string; name: string }[]
  if (groups.length === 0) return

  const findCandidatesStmt = db.prepare(
    `SELECT c.id, c.name_key, c.is_system, c.created_at,
            (SELECT COUNT(*) FROM transactions t WHERE t.category_id = c.id) as tx_count
     FROM categories c WHERE c.type = ? AND c.name = ?
     ORDER BY c.is_system ASC, tx_count DESC, c.created_at ASC`
  )
  const reassignTxStmt = db.prepare(
    'UPDATE transactions SET category_id = ? WHERE category_id = ?'
  )
  const adoptNameKeyStmt = db.prepare('UPDATE categories SET name_key = ? WHERE id = ?')
  const deleteStmt = db.prepare('DELETE FROM categories WHERE id = ?')

  const run = db.transaction(() => {
    for (const group of groups) {
      const candidates = findCandidatesStmt.all(group.type, group.name) as {
        id: number
        name_key: string | null
        is_system: number
        created_at: string
        tx_count: number
      }[]
      const [survivor, ...losers] = candidates
      if (!survivor || losers.length === 0) continue

      for (const loser of losers) {
        reassignTxStmt.run(survivor.id, loser.id)
        if (!survivor.name_key && loser.name_key) {
          adoptNameKeyStmt.run(loser.name_key, survivor.id)
        }
        deleteStmt.run(loser.id)
      }
    }
  })
  run()
}

const migrations: { version: number; sql: string; postRun?: (db: Database.Database) => void }[] = [
  { version: 1, sql: migration001Init },
  { version: 2, sql: migration002SeedCategories },
  { version: 3, sql: migration003RemoveSubcategory },
  { version: 4, sql: migration004SingleActiveBill },
  { version: 5, sql: migration005BackfillCategoryColors },
  { version: 6, sql: migration006AddSyncUuid, postRun: backfillUuids },
  { version: 7, sql: migration007DedupeCategories, postRun: dedupeCategories },
  { version: 8, sql: migration008AddDeletedAt },
  { version: 9, sql: migration009RealignCategories, postRun: realignCategories },
  {
    version: 10,
    sql: migration010PruneAndRenumberCategories,
    postRun: pruneAndRenumberCategories
  }
]

export function runMigrations(db: Database.Database): void {
  const currentVersion = db.pragma('user_version', { simple: true }) as number
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.exec(migration.sql)
      migration.postRun?.(db)
      db.pragma(`user_version = ${migration.version}`)
    }
  }
}
