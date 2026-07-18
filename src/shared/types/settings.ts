export type AppLanguage = 'zh' | 'ja' | 'en'

export interface AppSettings {
  language: AppLanguage
  soundEnabled: boolean
  defaultExpenseCategoryId: number | null
  defaultIncomeCategoryId: number | null
}
