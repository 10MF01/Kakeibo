// Adds a `uuid` identity column to categories/bills/transactions, independent from the
// existing integer autoincrement `id`. The integer id stays the local primary key (foreign
// keys, indexes, existing code all keep working); `uuid` is purely the cross-device identity
// used to match "the same record" between the desktop DB and a future mobile DB during sync,
// so two independently-seeded SQLite files can merge without id collisions.
export const migration006AddSyncUuid = `
ALTER TABLE categories ADD COLUMN uuid TEXT NULL;
ALTER TABLE bills ADD COLUMN uuid TEXT NULL;
ALTER TABLE transactions ADD COLUMN uuid TEXT NULL;
CREATE UNIQUE INDEX idx_categories_uuid ON categories(uuid);
CREATE UNIQUE INDEX idx_bills_uuid ON bills(uuid);
CREATE UNIQUE INDEX idx_transactions_uuid ON transactions(uuid);
`
