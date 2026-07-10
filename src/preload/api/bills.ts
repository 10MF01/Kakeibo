import { IPC } from '@shared/ipcChannels'
import type { Bill, BillCreateInput, BillUpdateInput } from '@shared/types/bill'
import { invoke } from './invoke'

export const billsApi = {
  list: () => invoke<Bill[]>(IPC.bills.list),
  getActive: () => invoke<Bill | null>(IPC.bills.getActive),
  get: (id: number) => invoke<Bill>(IPC.bills.get, id),
  create: (input: BillCreateInput) => invoke<Bill>(IPC.bills.create, input),
  update: (id: number, input: BillUpdateInput) => invoke<Bill>(IPC.bills.update, id, input),
  delete: (id: number) => invoke<void>(IPC.bills.delete, id)
}
