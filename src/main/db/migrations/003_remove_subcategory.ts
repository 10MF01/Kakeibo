export const migration003RemoveSubcategory = `
DELETE FROM categories WHERE parent_id IS NOT NULL;
DROP INDEX IF EXISTS idx_categories_parent_name;
ALTER TABLE categories DROP COLUMN parent_id;
CREATE UNIQUE INDEX idx_categories_type_name ON categories(type, name);
ALTER TABLE transactions DROP COLUMN subcategory_id;
`
