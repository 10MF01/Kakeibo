import { createHashRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/Dashboard/DashboardPage'
import BillsListPage from './pages/Bills/BillsListPage'
import BillDetailPage from './pages/Bills/BillDetailPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import SettingsPage from './pages/Settings/SettingsPage'

const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/bills', element: <BillsListPage /> },
      { path: '/bills/:billId', element: <BillDetailPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/settings', element: <SettingsPage /> }
    ]
  }
])

function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router} />
}

export default AppRouter
