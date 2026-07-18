import { registerCategoryHandlers } from './categories.handlers'
import { registerBillHandlers } from './bills.handlers'
import { registerTransactionHandlers } from './transactions.handlers'
import { registerSettingsHandlers } from './settings.handlers'
import { registerReportHandlers } from './reports.handlers'
import { registerSyncHandlers } from './sync.handlers'

export function registerIpc(): void {
  registerCategoryHandlers()
  registerBillHandlers()
  registerTransactionHandlers()
  registerSettingsHandlers()
  registerReportHandlers()
  registerSyncHandlers()
}
