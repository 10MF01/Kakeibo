import { app, dialog, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { getDb } from './db/connection'
import { registerIpc } from './ipc/registerIpc'

// Only resolves in dev (out/main -> project root/resources); a packaged build's
// own .exe icon (baked in by electron-builder from resources/icon.png) is used
// automatically when this path doesn't exist inside the asar.
const iconPath = join(__dirname, '../../resources/icon.png')

function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: 'Kakeibo',
    ...(existsSync(iconPath) ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app
  .whenReady()
  .then(() => {
    app.setAppUserModelId('com.tenmf01.kakeibo')

    getDb()
    registerIpc()

    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })
  .catch((err) => {
    const message = err instanceof Error ? (err.stack ?? err.message) : String(err)
    console.error('Failed to start Kakeibo:', message)
    dialog.showErrorBox('Kakeibo failed to start', message)
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
