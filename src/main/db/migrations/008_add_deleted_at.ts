// Adds soft-delete support so deletions can propagate through sync instead of being silently
// resurrected: a deleted row keeps existing (with `deleted_at` set) rather than being physically
// removed, so the other device can see the tombstone and apply it via the normal
// last-write-wins comparison on `updated_at` (see syncService.ts) instead of re-inserting a row
// it thinks is simply "new". The (type, name) unique index has to be rebuilt as a partial index
// (only covering non-deleted rows) or a deleted category would permanently block reusing its name.
export const migration008AddDeletedAt = `
ALTER TABLE categories ADD COLUMN deleted_at TEXT NULL;
ALTER TABLE bills ADD COLUMN deleted_at TEXT NULL;
ALTER TABLE transactions ADD COLUMN deleted_at TEXT NULL;
DROP INDEX idx_categories_type_name;
CREATE UNIQUE INDEX idx_categories_type_name ON categories(type, name) WHERE deleted_at IS NULL;
`
