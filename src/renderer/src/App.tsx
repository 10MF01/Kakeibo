import { useEffect, useState } from 'react'
import { ConfigProvider, Typography, List, Tag, Spin } from 'antd'
import type { Category } from '@shared/types/category'

function App(): React.JSX.Element {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.api.categories
      .list()
      .then(setCategories)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2f6f4f',
          borderRadius: 8,
          fontFamily:
            '"Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'
        }
      }}
    >
      <div style={{ padding: 48 }}>
        <Typography.Title level={2}>Kakeibo</Typography.Title>
        <Typography.Paragraph type="secondary">
          Phase 2 数据层验证：以下分类数据经 IPC 从主进程 SQLite 读取。
        </Typography.Paragraph>
        {error && <Typography.Text type="danger">加载失败：{error}</Typography.Text>}
        {!categories && !error && <Spin />}
        {categories && (
          <List
            size="small"
            bordered
            style={{ maxWidth: 480 }}
            dataSource={categories}
            renderItem={(item) => (
              <List.Item>
                <Tag color={item.type === 'income' ? 'green' : 'volcano'}>
                  {item.type === 'income' ? '收入' : '支出'}
                </Tag>
                {item.name}
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  #{item.id}
                </Typography.Text>
              </List.Item>
            )}
          />
        )}
      </div>
    </ConfigProvider>
  )
}

export default App
