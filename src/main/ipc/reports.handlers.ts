import { IPC } from '@shared/ipcChannels'
import { handle } from './ipcHandle'
import { getReportSummary } from '../services/reportService'
import { exportReportPdf } from '../services/exportPdfService'
import { exportReportExcel } from '../services/exportExcelService'

export function registerReportHandlers(): void {
  handle(IPC.reports.getSummary, (billId: number) => getReportSummary(billId))
  handle(IPC.reports.exportPdf, (billId: number) => exportReportPdf(billId))
  handle(IPC.reports.exportExcel, (billId: number) => exportReportExcel(billId))
}
