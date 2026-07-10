import { IPC } from '@shared/ipcChannels'
import type { Transaction, TransactionCreateInput, TransactionUpdateInput } from '@shared/types/transaction'
import { invoke } from './invoke'

export const transactionsApi = {
  listByBill: (billId: number) => invoke<Transaction[]>(IPC.transactions.listByBill, billId),
  listByDate: (billId: number, date: string) =>
    invoke<Transaction[]>(IPC.transactions.listByDate, billId, date),
  create: (input: TransactionCreateInput) =>
    invoke<Transaction>(IPC.transactions.create, input),
  update: (id: number, input: TransactionUpdateInput) =>
    invoke<Transaction>(IPC.transactions.update, id, input),
  delete: (id: number) => invoke<void>(IPC.transactions.delete, id)
}
