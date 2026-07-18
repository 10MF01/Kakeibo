import { getDb } from '../db/connection'
import type { AppLanguage, AppSettings } from '@shared/types/settings'

const DEFAULT_LANGUAGE: AppLanguage = 'zh'
const DEFAULT_SOUND_ENABLED = true

function getValue(key: string): string | undefined {
  const db = getDb()
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value
}

function setValue(key: string, value: string): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value)
}

function getNullableIdValue(key: string): number | null {
  const value = getValue(key)
  return value === undefined || value === '' ? null : Number(value)
}

function setNullableIdValue(key: string, value: number | null): void {
  setValue(key, value === null ? '' : String(value))
}

export function getSettings(): AppSettings {
  const soundEnabledValue = getValue('soundEnabled')
  return {
    language: (getValue('language') as AppLanguage) ?? DEFAULT_LANGUAGE,
    soundEnabled: soundEnabledValue === undefined ? DEFAULT_SOUND_ENABLED : soundEnabledValue === '1',
    defaultExpenseCategoryId: getNullableIdValue('defaultExpenseCategoryId'),
    defaultIncomeCategoryId: getNullableIdValue('defaultIncomeCategoryId')
  }
}

export function updateSettings(input: Partial<AppSettings>): AppSettings {
  if (input.language !== undefined) {
    setValue('language', input.language)
  }
  if (input.soundEnabled !== undefined) {
    setValue('soundEnabled', input.soundEnabled ? '1' : '0')
  }
  if (input.defaultExpenseCategoryId !== undefined) {
    setNullableIdValue('defaultExpenseCategoryId', input.defaultExpenseCategoryId)
  }
  if (input.defaultIncomeCategoryId !== undefined) {
    setNullableIdValue('defaultIncomeCategoryId', input.defaultIncomeCategoryId)
  }
  return getSettings()
}
