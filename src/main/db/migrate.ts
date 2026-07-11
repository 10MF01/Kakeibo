import type Database from 'better-sqlite3'
import { migration001Init } from './migrations/001_init'
import { migration002SeedCategories } from './migrations/002_seed_categories'
import { migration003RemoveSubcategory } from './migrations/003_remove_subcategory'
import { migration004SingleActiveBill } from './migrations/004_single_active_bill'
import { migration005BackfillCategoryColors } from './migrations/005_backfill_category_colors'

const migrations: { version: number; sql: string }[] = [
  { version: 1, sql: migration001Init },
  { version: 2, sql: migration002SeedCategories },
  { version: 3, sql: migration003RemoveSubcategory },
  { version: 4, sql: migration004SingleActiveBill },
  { version: 5, sql: migration005BackfillCategoryColors }
]

export function runMigrations(db: Database.Database): void {
  const currentVersion = db.pragma('user_version', { simple: true }) as number
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.exec(migration.sql)
      db.pragma(`user_version = ${migration.version}`)
    }
  }
}
