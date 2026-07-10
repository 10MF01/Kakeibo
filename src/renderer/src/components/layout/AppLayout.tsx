import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  TagsOutlined
} from '@ant-design/icons'

const { Sider, Content } = Layout

const menuItems: Required<MenuProps>['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">首页</Link> },
  { key: '/bills', icon: <FileTextOutlined />, label: <Link to="/bills">账单</Link> },
  { key: '/categories', icon: <TagsOutlined />, label: <Link to="/categories">分类管理</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">设置</Link> }
]

function resolveSelectedKey(pathname: string): string {
  if (pathname === '/') return '/'
  const match = ['/bills', '/categories', '/settings'].find((key) => pathname.startsWith(key))
  return match ?? '/'
}

function AppLayout(): React.JSX.Element {
  const location = useLocation()
  const selectedKey = resolveSelectedKey(location.pathname)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div style={{ padding: '20px 24px', fontSize: 18, fontWeight: 600, color: '#2f6f4f' }}>
          Kakeibo
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
    </Layout>
  )
}

export default AppLayout
