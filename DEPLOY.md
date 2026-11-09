# Deploy / 部署

This file is a **shortcut index**. Full guides:

- **English:** [docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md)
- **中文:** [docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md)

### One-liner（摘要）

| | |
|---|---|
| **Build** | `npm ci && npm run build` |
| **Deploy** | `npx wrangler deploy` |
| **CF path** | Dashboard → Workers & Pages → Create → **Import a repository** |

### 前置：Cloudflare GitHub App

Cloudflare 通过 **Cloudflare Workers and Pages** GitHub App 读取仓库，而不是匿名抓取。
首次部署前请安装该 App 并授予本仓库权限，否则会出现
**「无法获取存储库内容」** — 仅把仓库设为 public 并不够。

- 安装：<https://dash.cloudflare.com/?to=/:account/workers-and-pages> → **Connect GitHub**
- 补充授权：GitHub → Settings → Applications → Cloudflare Workers and Pages → Configure
  → 勾选 `Blduu/jetbrains-license-server-help-cloudflare`
- 详细步骤：[docs/zh-CN/DEPLOY.md#无法获取存储库内容](./docs/zh-CN/DEPLOY.md#无法获取存储库内容) ·
  [English](./docs/en-US/DEPLOY.md#cannot-fetch-repository-contents)

不想授权 App？直接在本机发布，不经过 Git 集成：

```bash
npm ci && npx wrangler login && npx wrangler deploy
```

Worker / **项目名称** must match `"name"` in [`wrangler.jsonc`](./wrangler.jsonc) (`jetbrains-license-server-help-cloudflare`).  
Canonical repo: [github.com/Blduu/jetbrains-license-server-help-cloudflare](https://github.com/Blduu/jetbrains-license-server-help-cloudflare) — GitHub name matches Wrangler; forks may need a manual name tweak. See [docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md) / [docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md).
