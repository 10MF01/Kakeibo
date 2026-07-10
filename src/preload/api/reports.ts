import { ipcRenderer } from 'electron'
import { IPC } from '@shared/ipcChannels'
import type { ExportResult, ReportSummary } from '@shared/types/report'
import type { AppLanguage } from '@shared/types/settings'
import { invoke } from './invoke'

export const reportsApi = {
  getSummary: (billId: number) => invoke<ReportSummary>(IPC.reports.getSummary, billId),
  exportPdf: (billId: number, language: AppLanguage) =>
    invoke<ExportResult | null>(IPC.reports.exportPdf, billId, language),
  exportExcel: (billId: number, language: AppLanguage) =>
    invoke<ExportResult | null>(IPC.reports.exportExcel, billId, language),
  notifyPrintReady: (): void => ipcRenderer.send(IPC.print.ready)
}
