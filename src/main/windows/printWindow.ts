import { BrowserWindow } from 'electron'
import { join } from 'path'

let printWindow: BrowserWindow | null = null

export function getPrintWindow(): BrowserWindow {
  if (printWindow && !printWindow.isDestroyed()) return printWindow

  printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  printWindow.on('closed', () => {
    printWindow = null
  })

  return printWindow
}

export function loadPrintRoute(window: BrowserWindow, hash: string): Promise<void> {
  const url = process.env.ELECTRON_RENDERER_URL
    ? `${process.env.ELECTRON_RENDERER_URL}#${hash}`
    : `file://${join(__dirname, '../renderer/index.html')}#${hash}`
  return window.loadURL(url)
}
