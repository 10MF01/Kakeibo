import { ipcRenderer } from 'electron'
import { IPC } from '@shared/ipcChannels'
import type { ExportResult, ReportSummary } from '@shared/types/report'
import { invoke } from './invoke'

export const reportsApi = {
  getSummary: (billId: number) => invoke<ReportSummary>(IPC.reports.getSummary, billId),
  exportPdf: (billId: number) => invoke<ExportResult | null>(IPC.reports.exportPdf, billId),
  exportExcel: (billId: number) => invoke<ExportResult | null>(IPC.reports.exportExcel, billId),
  notifyPrintReady: (): void => ipcRenderer.send(IPC.print.ready)
}
