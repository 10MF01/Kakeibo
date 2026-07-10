import { getDb } from '../db/connection'
import type { AppLanguage, AppSettings } from '@shared/types/settings'

const DEFAULT_LANGUAGE: AppLanguage = 'zh'

export function getSettings(): AppSettings {
  const db = getDb()
  const row = db.prepare("SELECT value FROM app_settings WHERE key = 'language'").get() as
    | { value: string }
    | undefined
  return { language: (row?.value as AppLanguage) ?? DEFAULT_LANGUAGE }
}

export function updateSettings(input: Partial<AppSettings>): AppSettings {
  const db = getDb()
  if (input.language !== undefined) {
    db.prepare(
      `INSERT INTO app_settings (key, value) VALUES ('language', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(input.language)
  }
  return getSettings()
}
