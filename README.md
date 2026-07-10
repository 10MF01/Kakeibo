# Kakeibo（家計簿）

一款面向个人 / 家庭的桌面记账应用，用自定义账单周期取代死板的自然月，每日快速录入收支，月末（或任意周期结束时）一键生成含表格与饼图的消费报告，并可导出 PDF / Excel。

> 项目名 Kakeibo 取自日语「家計簿」（记账本）。

## 功能特性

- **收支总览**：首页实时显示当前进行中账单的收入 / 支出 / 盈余
- **自定义账单周期**：账单起止日期完全自由（例如 7/15 ~ 8/15），系统按天生成录入表单，不强制按自然月
- **两级分类**：一级分类必填、用于统计；二级分类选填，仅作备注（如「饮食」下的「牛肉饭」），不参与统计聚合
- **分类管理**：内置常用一级分类，支持自由增删改一级 / 二级分类，可自定义颜色标签
- **消费报告**：按账单生成分类占比饼图 + 明细表格，支持导出 **PDF**（含图表，适合打印分享）和 **Excel**（汇总 + 流水明细两个 sheet）
- **内置计算器**：任意页面右下角悬浮按钮唤起，四则运算，方便录入前心算
- **多语言**：中文 / 日本語 / English 三语切换，切换语言的同时联动金额显示的货币符号（¥ / ¥ / $）与小数位规则（日元不显示小数）

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面框架 | Electron 33 |
| 前端 | React 18 + TypeScript + Vite（经 `electron-vite` 集成） |
| UI 组件库 | Ant Design 5 + `@ant-design/plots`（饼图） |
| 状态管理 | Zustand |
| 路由 | React Router（Hash 模式） |
| 国际化 | react-i18next |
| 本地数据库 | SQLite（`better-sqlite3`，运行于 Electron 主进程） |
| 报告导出 | Electron `printToPDF`（PDF）/ `exceljs`（Excel） |
| 打包 | `electron-builder` |

## 项目结构

```
src/
  main/            Electron 主进程：SQLite 连接与迁移、IPC handler、报告/导出服务
  preload/         contextBridge 暴露的 window.api，按领域拆分（categories/bills/transactions/reports/settings）
  renderer/         React 应用（页面、组件、状态、i18n）
  shared/          主进程与渲染进程共用的类型定义、IPC channel 常量、金额与货币工具
```

## 本地开发

```bash
npm install
npm run dev        # 启动 electron-vite 开发模式（热更新）
```

首次 `npm install` 后会自动执行 `postinstall` 针对 Electron 的 Node ABI 重新编译 `better-sqlite3`；如果启动时遇到 `NODE_MODULE_VERSION` 报错，手动执行一次：

```bash
npx electron-rebuild -f -w better-sqlite3
```

## 构建与打包

```bash
npm run build       # 仅构建 main/preload/renderer 产物（out/ 目录）
npm run build:win   # 在构建基础上用 electron-builder 打出 Windows 安装包（dist/ 目录）
```

`npm run build:win` 需要生成 NSIS 安装包，这一步依赖创建符号链接的权限。如果本机没有开启「开发者模式」或没有以管理员身份运行终端，NSIS 打包这一步会失败（`Cannot create symbolic link`），但**不影响**前面 `dist/win-unpacked/` 下已经打包好的免安装版 `Kakeibo.exe` —— 这属于本机权限限制，不是代码问题。解决方法二选一：

- 在「设置 → 隐私和安全性 → 开发者选项」中打开「开发人员模式」，或
- 以管理员身份运行终端后再执行 `npm run build:win`

## 其他说明

- 本地数据保存在 SQLite 文件中（应用的 `userData` 目录下），不会上传到任何服务器
- `CLAUDE.md` 与 `.claude/` 目录为开发过程中的内部笔记，已在 `.gitignore` 中排除，不会出现在仓库中
