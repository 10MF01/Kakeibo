import { IPC } from '@shared/ipcChannels'
import { handle } from './ipcHandle'
import * as syncService from '../services/syncService'

export function registerSyncHandlers(): void {
  handle(IPC.sync.getStatus, () => syncService.getSyncStatus())
  handle(IPC.sync.setEndpointUrl, (url: string) => syncService.setSyncEndpointUrl(url))
  handle(IPC.sync.syncNow, () => syncService.syncNow())
}
