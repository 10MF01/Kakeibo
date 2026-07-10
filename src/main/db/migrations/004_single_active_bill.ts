// Prior to this migration every bill defaulted to status='active' and "the"
// active bill was derived by date range, so multiple rows could legitimately
// carry status='active' at once. Now that activation is an explicit, single
// user action, collapse any pre-existing multi-active state down to one —
// keep the most recently started bill active, close the rest.
export const migration004SingleActiveBill = `
UPDATE bills
SET status = 'closed', updated_at = datetime('now')
WHERE status = 'active'
  AND id NOT IN (
    SELECT id FROM bills WHERE status = 'active' ORDER BY start_date DESC, id DESC LIMIT 1
  );
`
