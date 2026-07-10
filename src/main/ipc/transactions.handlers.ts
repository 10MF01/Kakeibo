import { IPC } from '@shared/ipcChannels'
import type { TransactionCreateInput, TransactionUpdateInput } from '@shared/types/transaction'
import { handle } from './ipcHandle'
import * as transactionService from '../services/transactionService'

export function registerTransactionHandlers(): void {
  handle(IPC.transactions.listByBill, (billId: number) =>
    transactionService.listTransactionsByBill(billId)
  )
  handle(IPC.transactions.listByDate, (billId: number, date: string) =>
    transactionService.listTransactionsByDate(billId, date)
  )
  handle(IPC.transactions.create, (input: TransactionCreateInput) =>
    transactionService.createTransaction(input)
  )
  handle(IPC.transactions.update, (id: number, input: TransactionUpdateInput) =>
    transactionService.updateTransaction(id, input)
  )
  handle(IPC.transactions.delete, (id: number) => transactionService.deleteTransaction(id))
}
