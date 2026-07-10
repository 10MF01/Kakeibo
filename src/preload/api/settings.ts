import { IPC } from '@shared/ipcChannels'
import type { AppSettings } from '@shared/types/settings'
import { invoke } from './invoke'

export const settingsApi = {
  get: () => invoke<AppSettings>(IPC.settings.get),
  update: (input: Partial<AppSettings>) => invoke<AppSettings>(IPC.settings.update, input)
}
