import { IPC } from '@shared/ipcChannels'
import type { SyncResult, SyncStatus } from '@shared/types/sync'
import { invoke } from './invoke'

export const syncApi = {
  getStatus: () => invoke<SyncStatus>(IPC.sync.getStatus),
  setEndpointUrl: (url: string) => invoke<SyncStatus>(IPC.sync.setEndpointUrl, url),
  syncNow: () => invoke<SyncResult>(IPC.sync.syncNow)
}
