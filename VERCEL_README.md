# 出海诊断 H5 部署指南

## 快速部署到 Vercel

### 方式一：Git 联动（推荐）

1. 将项目推送到 GitHub/GitLab
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 点击 Deploy

### 方式二：CLI 部署

```bash
npm i -g vercel
vercel --prod
```

---

## 配置飞书多维表格

### 1. 创建飞书应用

1. 打开 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`

### 2. 开通权限

在应用权限管理中开通：
- `bitable:app` - 读写多维表格

### 3. 获取多维表格信息

打开你的多维表格，复制 URL：
```
https://xxx.feishu.cn/base/bascnXXXXXXXXXXXXX?table=tblXXXXXXXXXXXXX
```

- `app_token` = `bascnXXXXXXXXXXXXX`
- `table_id` = `tblXXXXXXXXXXXXX`

### 4. 添加应用到表格

在多维表格右上角 → 分享 → 添加应用 → 搜索你的应用 → 授予编辑权限

### 5. 配置环境变量

在 Vercel 项目 Settings → Environment Variables 中添加：

| 变量名 | 值 |
|-------|-----|
| `FEISHU_APP_ID` | 你的 App ID |
| `FEISHU_APP_SECRET` | 你的 App Secret |
| `FEISHU_APP_TOKEN` | 多维表格的 app_token |
| `FEISHU_TABLE_ID` | 多维表格的 table_id |

---

## 飞书多维表格字段要求

表格需要有这些列（字段名必须完全匹配）：

| 字段名 | 类型 |
|-------|------|
| 姓名 | 单行文本 |
| 电话 | 单行文本 |
| 微信 | 单行文本 |
| 提交时间 | 日期/时间 |
| 诊断类型 | 单行文本 |
| 画像标签 | 单行文本 |
| 产能底气 | 数字 |
| 市场嗅觉 | 数字 |
| 行动惯性 | 数字 |
| 决策算账 | 数字 |

---

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
