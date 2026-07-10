import { dialog, ipcMain } from 'electron'
import { writeFile } from 'fs/promises'
import { getPrintWindow, loadPrintRoute } from '../windows/printWindow'
import { getReportSummary } from './reportService'
import { IPC } from '@shared/ipcChannels'
import type { ExportResult } from '@shared/types/report'

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

function waitForPrintReady(webContentsId: number, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ipcMain.removeListener(IPC.print.ready, handler)
      reject(new Error('打印页面渲染超时'))
    }, timeoutMs)

    function handler(event: Electron.IpcMainEvent): void {
      if (event.sender.id === webContentsId) {
        clearTimeout(timer)
        ipcMain.removeListener(IPC.print.ready, handler)
        resolve()
      }
    }

    ipcMain.on(IPC.print.ready, handler)
  })
}

export async function exportReportPdf(billId: number): Promise<ExportResult | null> {
  const summary = getReportSummary(billId)
  const defaultPath = `${sanitizeFileName(summary.billName)}-消费报告.pdf`

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出 PDF 报告',
    defaultPath,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })
  if (canceled || !filePath) return null

  const win = getPrintWindow()
  const readyPromise = waitForPrintReady(win.webContents.id)
  await loadPrintRoute(win, `/print/report/${billId}`)
  await readyPromise

  const pdfBuffer = await win.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
  })

  await writeFile(filePath, pdfBuffer)
  return { filePath }
}
