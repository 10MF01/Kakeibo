import { randomUUID } from 'crypto'
import { getDb } from '../db/connection'
import { AppError } from '@shared/types/error'
import type {
  Category,
  CategoryCreateInput,
  CategoryListFilter,
  CategoryReorderItem,
  CategoryUpdateInput
} from '@shared/types/category'

interface CategoryRow {
  id: number
  uuid: string
  type: 'income' | 'expense'
  name: string
  seed_key: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_system: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    uuid: row.uuid,
    type: row.type,
    name: row.name,
    seedKey: row.seed_key,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
    isSystem: !!row.is_system,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  }
}

export function listCategories(filter?: CategoryListFilter): Category[] {
  const db = getDb()
  let sql = 'SELECT * FROM categories WHERE deleted_at IS NULL'
  const params: unknown[] = []
  if (filter?.type) {
    sql += ' AND type = ?'
    params.push(filter.type)
  }
  sql += ' ORDER BY sort_order, id'
  const rows = db.prepare(sql).all(...params) as CategoryRow[]
  return rows.map(rowToCategory)
}

export function createCategory(input: CategoryCreateInput): Category {
  const db = getDb()

  try {
    const nextSortOrder =
      input.sortOrder ??
      ((
        db
          .prepare(
            'SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM categories WHERE type = ? AND deleted_at IS NULL'
          )
          .get(input.type) as { next: number }
      ).next)
    const result = db
      .prepare(
        `INSERT INTO categories (uuid, type, name, icon, color, sort_order, is_system)
         VALUES (?, ?, ?, ?, ?, ?, 0)`
      )
      .run(
        randomUUID(),
        input.type,
        input.name,
        input.icon ?? null,
        input.color ?? null,
        nextSortOrder
      )
    const row = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid) as CategoryRow
    return rowToCategory(row)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      throw new AppError(
        'CATEGORY_DUPLICATE_NAME',
        `category name "${input.name}" already exists for this type`
      )
    }
    throw err
  }
}

export function updateCategory(id: number, input: CategoryUpdateInput): Category {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
    | CategoryRow
    | undefined
  if (!existing) {
    throw new AppError('CATEGORY_NOT_FOUND', `category ${id} not found`)
  }

  const fields: string[] = []
  const params: unknown[] = []
  if (input.name !== undefined) {
    fields.push('name = ?')
    params.push(input.name)
  }
  if (input.icon !== undefined) {
    fields.push('icon = ?')
    params.push(input.icon)
  }
  if (input.color !== undefined) {
    fields.push('color = ?')
    params.push(input.color)
  }
  if (input.sortOrder !== undefined) {
    fields.push('sort_order = ?')
    params.push(input.sortOrder)
  }
  fields.push("updated_at = datetime('now')")
  params.push(id)

  try {
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      throw new AppError('CATEGORY_DUPLICATE_NAME', 'category name already exists at this level')
    }
    throw err
  }

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow
  return rowToCategory(row)
}

export function reorderCategories(updates: CategoryReorderItem[]): void {
  const db = getDb()
  const stmt = db.prepare("UPDATE categories SET sort_order = ?, updated_at = datetime('now') WHERE id = ?")
  const run = db.transaction((items: CategoryReorderItem[]) => {
    for (const item of items) stmt.run(item.sortOrder, item.id)
  })
  run(updates)
}

export function deleteCategory(id: number): void {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
    | CategoryRow
    | undefined
  if (!existing) {
    throw new AppError('CATEGORY_NOT_FOUND', `category ${id} not found`)
  }

  // Soft delete: the row stays (so its uuid keeps meaning across sync, and any historical
  // transactions can still resolve its name via the join), just hidden from lists/pickers.
  db.prepare(
    "UPDATE categories SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).run(id)
}
