export const IPC = {
  categories: {
    list: 'categories:list',
    create: 'categories:create',
    update: 'categories:update',
    delete: 'categories:delete'
  },
  bills: {
    list: 'bills:list',
    getActive: 'bills:getActive',
    get: 'bills:get',
    create: 'bills:create',
    update: 'bills:update',
    delete: 'bills:delete'
  },
  transactions: {
    listByBill: 'transactions:listByBill',
    listByDate: 'transactions:listByDate',
    create: 'transactions:create',
    update: 'transactions:update',
    delete: 'transactions:delete'
  },
  settings: {
    get: 'settings:get',
    update: 'settings:update'
  }
} as const
