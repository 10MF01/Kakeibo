import type Database from 'better-sqlite3'
import { migration001Init } from './migrations/001_init'
import { migration002SeedCategories } from './migrations/002_seed_categories'

const migrations: { version: number; sql: string }[] = [
  { version: 1, sql: migration001Init },
  { version: 2, sql: migration002SeedCategories }
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
