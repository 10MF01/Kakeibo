import { ipcRenderer } from 'electron'
import type { IpcResult } from '../../main/ipc/ipcHandle'

export async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = (await ipcRenderer.invoke(channel, ...args)) as IpcResult<T>
  if (result.ok) return result.data
  const error = new Error(result.error.message) as Error & { code: string }
  error.name = 'AppError'
  error.code = result.error.code
  throw error
}
