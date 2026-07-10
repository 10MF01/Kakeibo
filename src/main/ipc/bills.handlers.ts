import { IPC } from '@shared/ipcChannels'
import type { BillCreateInput, BillUpdateInput } from '@shared/types/bill'
import { handle } from './ipcHandle'
import * as billService from '../services/billService'

export function registerBillHandlers(): void {
  handle(IPC.bills.list, () => billService.listBills())
  handle(IPC.bills.getActive, () => billService.getActiveBill())
  handle(IPC.bills.get, (id: number) => billService.getBill(id))
  handle(IPC.bills.create, (input: BillCreateInput) => billService.createBill(input))
  handle(IPC.bills.update, (id: number, input: BillUpdateInput) =>
    billService.updateBill(id, input)
  )
  handle(IPC.bills.delete, (id: number) => billService.deleteBill(id))
}
