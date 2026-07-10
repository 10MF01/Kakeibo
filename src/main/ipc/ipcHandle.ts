import { ipcMain } from 'electron'
import { AppError } from '@shared/types/error'

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

export function handle<Args extends unknown[], R>(
  channel: string,
  fn: (...args: Args) => R | Promise<R>
): void {
  ipcMain.handle(channel, async (_event, ...args: Args): Promise<IpcResult<R>> => {
    try {
      const data = await fn(...args)
      return { ok: true, data }
    } catch (err) {
      if (err instanceof AppError) {
        return { ok: false, error: { code: err.code, message: err.message } }
      }
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: { code: 'UNKNOWN', message } }
    }
  })
}
