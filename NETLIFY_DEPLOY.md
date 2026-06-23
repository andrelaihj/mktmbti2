# 出海诊断 H5 - Netlify 部署指南

本说明仅覆盖“拖拽发布到 Netlify”这一步，以及现有飞书提交流程如何复用。

## 1. 本地准备：先构建出可部署文件夹

在项目根目录执行：

```bash
npm install
npm run build
```

完成后会生成：
- `dist/index.html`
- `dist/assets/*`
- `dist/api/submit.js`（需要你手动复制，见第 2 步）

> 当前项目默认构建脚本只输出页面，不会自动把 `api/` 复制进 `dist`。Netlify 拖拽部署时需要这个文件存在，所以必须手动补一下。

## 2. 复制接口文件到 dist

把根目录下的 `api/submit.js` 复制到：

```
dist/api/submit.js
```

如果没有 `dist/api` 文件夹，就先创建文件夹再复制。

## 3. 接口配置说明

提交表单当前调用的接口是：

```js
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
})
```

在 Netlify 上，这个路径会被自动映射到 `dist/api/submit.js`。如果后续需要改域名或加上 CORS，只在 `dist/api/submit.js` 里改即可，不需要改前端代码。

## 4. 拖拽发布步骤

1. 打开 https://app.netlify.com/drop
2. 把整个 `dist` 文件夹拖进页面
3. Netlify 会给你一个临时域名
4. 在 Site settings -> Environment variables 中补环境变量（如果后续改用环境变量注入飞书配置）

## 5. 飞书多维表格配置

如果你之前已经按 `VERCEL_README.md` 创建过飞书应用，Netlify 这一步不需要改接口代码，只需：

- 飞书应用继续保留
- 表格字段名和前端发送的字段保持一致
- 如果需要在 Netlify 侧存 `FEISHU_*` 变量，可在站点设置里加 Environment variables

表格字段（字段名必须一致）：

| 字段名 | 类型 |
|--------|------|
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

## 6. 下一步

- 部署完成后，你直接打开 Netlify 给出的网址就能用
- 如有需要，我可以继续帮你：
  - 把 Netlify 域名绑定到自定义域名
  - 把 `api/submit.js` 的代码改成从环境变量读取飞书配置，避免硬编码在代码里
