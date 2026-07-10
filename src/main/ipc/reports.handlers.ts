import { IPC } from '@shared/ipcChannels'
import { handle } from './ipcHandle'
import { getReportSummary } from '../services/reportService'
import { exportReportPdf } from '../services/exportPdfService'
import { exportReportExcel } from '../services/exportExcelService'
import type { AppLanguage } from '@shared/types/settings'

export function registerReportHandlers(): void {
  handle(IPC.reports.getSummary, (billId: number) => getReportSummary(billId))
  handle(IPC.reports.exportPdf, (billId: number, language: AppLanguage) =>
    exportReportPdf(billId, language)
  )
  handle(IPC.reports.exportExcel, (billId: number, language: AppLanguage) =>
    exportReportExcel(billId, language)
  )
}
