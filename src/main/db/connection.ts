import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { runMigrations } from './migrate'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbDir = app.getPath('userData')
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
  const dbPath = join(dbDir, 'kakeibo.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)

  return db
}
