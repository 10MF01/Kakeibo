export const migration001Init = `
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NULL REFERENCES categories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  name TEXT NOT NULL,
  name_key TEXT NULL,
  icon TEXT NULL,
  color TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX idx_categories_parent_name ON categories(parent_id, name);
CREATE INDEX idx_categories_type ON categories(type);

CREATE TABLE bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_date >= start_date)
);
CREATE INDEX idx_bills_date_range ON bills(start_date, end_date);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  note TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_transactions_bill_date ON transactions(bill_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`
