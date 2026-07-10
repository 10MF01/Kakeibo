import { IPC } from '@shared/ipcChannels'
import type { AppSettings } from '@shared/types/settings'
import { handle } from './ipcHandle'
import * as settingsService from '../services/settingsService'

export function registerSettingsHandlers(): void {
  handle(IPC.settings.get, () => settingsService.getSettings())
  handle(IPC.settings.update, (input: Partial<AppSettings>) =>
    settingsService.updateSettings(input)
  )
}
