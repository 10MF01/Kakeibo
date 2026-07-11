import { create } from 'zustand'
import i18n from '@renderer/i18n'
import type { AppLanguage, AppSettings } from '@shared/types/settings'

interface SettingsState {
  language: AppLanguage
  soundEnabled: boolean
  loaded: boolean
  hydrate: () => Promise<void>
  setLanguage: (language: AppLanguage) => Promise<void>
  setSoundEnabled: (soundEnabled: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'zh',
  soundEnabled: true,
  loaded: false,
  hydrate: async () => {
    const settings: AppSettings = await window.api.settings.get()
    await i18n.changeLanguage(settings.language)
    set({ language: settings.language, soundEnabled: settings.soundEnabled, loaded: true })
  },
  setLanguage: async (language: AppLanguage) => {
    const settings = await window.api.settings.update({ language })
    await i18n.changeLanguage(settings.language)
    set({ language: settings.language })
  },
  setSoundEnabled: async (soundEnabled: boolean) => {
    const settings = await window.api.settings.update({ soundEnabled })
    set({ soundEnabled: settings.soundEnabled })
  }
}))
