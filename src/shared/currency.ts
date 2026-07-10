import type { AppLanguage } from './types/settings'

export const LANGUAGE_LOCALE_MAP: Record<AppLanguage, string> = {
  zh: 'zh-CN',
  ja: 'ja-JP',
  en: 'en-US'
}

export const LANGUAGE_CURRENCY_MAP: Record<AppLanguage, string> = {
  zh: 'CNY',
  ja: 'JPY',
  en: 'USD'
}
