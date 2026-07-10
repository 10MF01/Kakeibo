import { useMemo } from 'react'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  TagsOutlined
} from '@ant-design/icons'
import CalculatorFab from '@renderer/components/calculator/CalculatorFab'

const { Sider, Content } = Layout

function resolveSelectedKey(pathname: string): string {
  if (pathname === '/') return '/'
  const match = ['/bills', '/categories', '/settings'].find((key) => pathname.startsWith(key))
  return match ?? '/'
}

function AppLayout(): React.JSX.Element {
  const { t } = useTranslation()
  const location = useLocation()
  const selectedKey = resolveSelectedKey(location.pathname)

  const menuItems: Required<MenuProps>['items'] = useMemo(
    () => [
      { key: '/', icon: <DashboardOutlined />, label: <Link to="/">{t('nav.dashboard')}</Link> },
      {
        key: '/bills',
        icon: <FileTextOutlined />,
        label: <Link to="/bills">{t('nav.bills')}</Link>
      },
      {
        key: '/categories',
        icon: <TagsOutlined />,
        label: <Link to="/categories">{t('nav.categories')}</Link>
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: <Link to="/settings">{t('nav.settings')}</Link>
      }
    ],
    [t]
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div style={{ padding: '20px 24px', fontSize: 18, fontWeight: 600, color: '#2f6f4f' }}>
          {t('app.title')}
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
      <CalculatorFab />
    </Layout>
  )
}

export default AppLayout
