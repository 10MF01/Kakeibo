import { createHashRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/Dashboard/DashboardPage'
import BillsListPage from './pages/Bills/BillsListPage'
import BillDetailPage from './pages/Bills/BillDetailPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import SettingsPage from './pages/Settings/SettingsPage'
import ReportPage from './pages/Report/ReportPage'
import ReportPrintView from './pages/Report/ReportPrintView'

const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/bills', element: <BillsListPage /> },
      { path: '/bills/:billId', element: <BillDetailPage /> },
      { path: '/bills/:billId/report', element: <ReportPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/settings', element: <SettingsPage /> }
    ]
  },
  // Not user-navigable: only loaded inside the hidden print BrowserWindow for PDF export.
  { path: '/print/report/:billId', element: <ReportPrintView /> }
])

function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router} />
}

export default AppRouter
