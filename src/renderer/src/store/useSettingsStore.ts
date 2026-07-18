import { create } from 'zustand'
import { message } from 'antd'
import i18n from '@renderer/i18n'
import type { AppLanguage, AppSettings } from '@shared/types/settings'

interface SettingsState {
  language: AppLanguage
  soundEnabled: boolean
  defaultExpenseCategoryId: number | null
  defaultIncomeCategoryId: number | null
  loaded: boolean
  hydrateFailed: boolean
  hydrate: () => Promise<void>
  setLanguage: (language: AppLanguage) => Promise<void>
  setSoundEnabled: (soundEnabled: boolean) => Promise<void>
  setDefaultExpenseCategoryId: (categoryId: number | null) => Promise<void>
  setDefaultIncomeCategoryId: (categoryId: number | null) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'zh',
  soundEnabled: true,
  defaultExpenseCategoryId: null,
  defaultIncomeCategoryId: null,
  loaded: false,
  hydrateFailed: false,
  hydrate: async () => {
    try {
      const settings: AppSettings = await window.api.settings.get()
      await i18n.changeLanguage(settings.language)
      set({
        language: settings.language,
        soundEnabled: settings.soundEnabled,
        defaultExpenseCategoryId: settings.defaultExpenseCategoryId,
        defaultIncomeCategoryId: settings.defaultIncomeCategoryId,
        loaded: true,
        hydrateFailed: false
      })
    } catch (err) {
      message.error(err instanceof Error ? err.message : i18n.t('common.loadFailed'))
      set({ hydrateFailed: true })
    }
  },
  setLanguage: async (language: AppLanguage) => {
    const settings = await window.api.settings.update({ language })
    await i18n.changeLanguage(settings.language)
    set({ language: settings.language })
  },
  setSoundEnabled: async (soundEnabled: boolean) => {
    const settings = await window.api.settings.update({ soundEnabled })
    set({ soundEnabled: settings.soundEnabled })
  },
  setDefaultExpenseCategoryId: async (categoryId: number | null) => {
    const settings = await window.api.settings.update({ defaultExpenseCategoryId: categoryId })
    set({ defaultExpenseCategoryId: settings.defaultExpenseCategoryId })
  },
  setDefaultIncomeCategoryId: async (categoryId: number | null) => {
    const settings = await window.api.settings.update({ defaultIncomeCategoryId: categoryId })
    set({ defaultIncomeCategoryId: settings.defaultIncomeCategoryId })
  }
}))
