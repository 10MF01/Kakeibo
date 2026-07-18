// No schema change here (desktop has had the (type, name) unique index since migration 003).
// This is a defensive one-time cleanup: mobile shipped without that index until its own schema
// v2, so a device could sync in a category whose (type, name) collided with an existing local
// row under a different uuid, which historically surfaced as an uncaught
// `UNIQUE constraint failed: categories.type, categories.name` during import (see syncService.ts
// mergeCategories's new adopt-by-name fallback, which now prevents this going forward). This
// migration is a no-op if the local DB has no such duplicates.
export const migration007DedupeCategories = ``
