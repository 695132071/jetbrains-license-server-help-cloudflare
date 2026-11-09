<div align="center">

# JetBrains License Server Help · Cloudflare Workers

**JetBrains 许可证服务器的 Cloudflare Workers 移植版**

TypeScript + Web Crypto 实现，**无服务器运行、无需 JVM**：RSA 签名 XML-RPC 许可证协议、
激活码生成、JRebel 兼容接口与静态 Vue 3 控制台，全部跑在一个 Worker 里。

[![CI](https://img.shields.io/github/actions/workflow/status/Blduu/jetbrains-license-server-help-cloudflare/deploy.yml?branch=main&label=CI&logo=github)](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/actions/workflows/deploy.yml)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-EPL--2.0-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[English](./README.en.md) ·
[JVM 版（Spring Boot）](https://github.com/Blduu/jetbrains-helper) ·
[文档中心](./docs/README.md) ·
[部署](./DEPLOY.md)

</div>

---

> **免责声明**
> 本项目仅供**学习、研究与个人技术交流**使用，不得用于任何商业用途。
> 请支持正版软件，遵守 JetBrains 及相关厂商的许可协议与当地法律法规。
> 因使用本项目产生的任何法律责任与后果，均由使用者自行承担。

---

## 目录

- [概述](#概述)
- [功能概览](#功能概览)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [本地运行](#本地运行)
- [部署方式](#部署方式)
- [项目结构](#项目结构)
- [API 摘要](#api-摘要)
- [npm 脚本](#npm-脚本)
- [文档导航](#文档导航)
- [参与贡献](#参与贡献)
- [安全](#安全)
- [版本与变更](#版本与变更)
- [许可证](#许可证)
- [相关仓库](#相关仓库)

## 概述

本仓库将 **[jetbrains-helper](https://github.com/Blduu/jetbrains-helper)**（Spring Boot / Java）
迁移为 **单个 Cloudflare Worker + 静态资源**：浏览器与 IDE 使用**同一域名**访问 Web 界面、
许可证 XML-RPC、激活码接口、类 JRebel 接口及 ja-netfilter 下载。

适合用 **Cloudflare 控制台连接 GitHub** 做持续部署，无需维护 JVM、容器或服务器。

## 功能概览

- **JetBrains 许可证服务协议** — `/rpc/*.action`（XML + RSA 签名），兼容 `GET` / `POST`。
- **激活码生成** — 与 Java 版路径对齐的 REST 接口（`/license-code/generate`、`/api/generateLicense` 等）。
- **JRebel 兼容** — `/jrebel/*`、`/agent/*`、`/guid`。
- **静态前端** — `public/` 下 Vue 3 单页控制台，经 `env.ASSETS` 同源提供。
- **运维友好** — `/api/health` 探活、安全响应头、只读 API 的 CORS、激活参数校验。

## 技术栈

| 层次 | 选型 |
| --- | --- |
| 运行时 | Cloudflare Workers |
| 语言 | TypeScript 5.x |
| 构建 / CLI | Wrangler 4.x（`wrangler.jsonc`） |
| 静态资源 | Workers Static Assets（`public/`） |
| 数据 | 内置 `src/data/product.json`、`plugin.json` |
| 加密 | Web Crypto API（RSA-SHA1 / SHA512），密钥构建期嵌入 `src/generated/pem.ts` |
| 测试 | Vitest（`test/`） |

## 环境要求

| 依赖 | 要求 |
| --- | --- |
| Node.js | ≥ 20（仓库含 `.nvmrc`，值为 22） |
| 必需文件 | `src/generated/pem.ts`（已在仓库中，CI 无需 `private/certs/`） |
| 必需文件 | `public/ja-netfilter.zip`（`/ja-netfilter` 下载依赖它） |

## 本地运行

```bash
git clone https://github.com/Blduu/jetbrains-license-server-help-cloudflare.git
cd jetbrains-license-server-help-cloudflare
npm ci

# 若缺少 pem.ts：先将证书放入 private/certs/，再执行
npm run embed-pem

npm run dev
```

浏览器打开终端输出的地址即可（默认 `http://127.0.0.1:8787`）。

## 部署方式

> **首次部署前**，需在 Cloudflare 安装 **Cloudflare Workers and Pages** GitHub App 并授予本仓库权限。
> Cloudflare 是通过该 App 读取仓库的，**仅公开仓库并不够**，否则会报
> **「无法获取存储库内容」**。处理步骤见
> [docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md#无法获取存储库内容)。

| 方式 | 说明 |
| --- | --- |
| **Cloudflare 控制台（推荐）** | [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **创建** → **从存储库导入**。构建命令 `npm ci && npm run build`，部署命令 `npx wrangler deploy`。**无需**在 GitHub 配置 Token。 |
| **wrangler CLI（无需 GitHub App）** | 本机执行 `npm ci && npx wrangler login && npx wrangler deploy`，直接上传发布。适合 Git 集成无法授权时。 |
| **GitHub Actions（可选）** | 工作流始终执行**构建 + 测试**；仅当 **Settings → Secrets and variables → Actions** 中同时配置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 时才发布。见 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。 |

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Blduu/jetbrains-license-server-help-cloudflare)

**项目名称：** 本仓库 GitHub 名已与 `wrangler.jsonc` 的 `name`（`jetbrains-license-server-help-cloudflare`）一致，
导入时一般无需再改。若 **fork** 后仓库名不同，请在 Cloudflare 将 Worker 名称改为与 `wrangler.jsonc` 一致。

逐步说明：[docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md) · 英文：[docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md) · 摘要：[DEPLOY.md](./DEPLOY.md)

### 健康检查

```bash
curl -s https://<你的域名>/api/health
```

返回 JSON（含 `ok`、`service`），`Cache-Control: no-store`。支持 `HEAD`。

## 项目结构

```
jetbrains-license-server-help-cloudflare/
├── public/              # 静态 UI、图标、ja-netfilter.zip、_headers
├── src/
│   ├── index.ts         # Worker 入口 + 错误边界
│   ├── router.ts        # HTTP 路由
│   ├── crypto/          # PEM、签名、许可证服务器 XML 签名
│   ├── license/         # 激活 XML、JRebel、激活码生成
│   ├── http/            # 安全响应头、CORS
│   ├── validation/      # 到期时间与字段校验
│   ├── data/            # product.json、plugin.json（+ catalog）
│   └── generated/       # pem.ts（已提交；由 scripts/embed-pem.mjs 重建）
├── scripts/embed-pem.mjs
├── test/                # Vitest 单元测试（源码，随仓库提交）
├── docs/zh-CN/          # 中文文档
├── docs/en-US/          # English docs
├── .github/workflows/   # CI 与发布
├── wrangler.jsonc
└── package.json
```

> `test/` 是**手写的单元测试源码**（4 个 `.test.ts`，共约 2.7 KB），不是构建产物，必须提交，
> CI 会执行 `npm run test:ci`。构建产物与本地缓存（`node_modules/`、`.wrangler/`、`dist/`、
> `coverage/`）已由 `.gitignore` 排除，不会进入仓库。

## API 摘要

完整说明：[docs/zh-CN/API.md](./docs/zh-CN/API.md) · [docs/en-US/API.md](./docs/en-US/API.md)

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 JSON（支持 `HEAD`） |
| `GET`/`HEAD` | `/api/products`、`/api/plugins` | 产品 / 插件目录（缓存 600s） |
| `GET` | `/ja-netfilter` | 下载 ja-netfilter ZIP |
| `GET` | `/api/generateLicense`、`/api/generatePluginLicense` | 生成激活码 |
| `GET`/`POST` | `/license-code/generate` | 生成激活码 |
| `*` | `/rpc/*.action` | JetBrains 许可证服务器 XML |
| `*` | `/jrebel/*`、`/agent/*`、`/guid` | JRebel 兼容接口 |

## npm 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | `embed-pem` + `wrangler dev` |
| `npm run deploy` | `embed-pem` + `wrangler deploy` |
| `npm run build` | `embed-pem` + `tsc --noEmit` |
| `npm run check` | 仅类型检查 |
| `npm run test` | `embed-pem` + Vitest |
| `npm run test:ci` | 仅 Vitest（CI 在 build 之后执行） |
| `npm run embed-pem` | 从 `private/certs/` 重新生成 `src/generated/pem.ts` |

## 文档导航

| 主题 | 中文 | English |
| --- | --- | --- |
| 部署 | [docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md) | [docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md) |
| 接口 | [docs/zh-CN/API.md](./docs/zh-CN/API.md) | [docs/en-US/API.md](./docs/en-US/API.md) |
| 开发 | [docs/zh-CN/DEVELOPMENT.md](./docs/zh-CN/DEVELOPMENT.md) | [docs/en-US/DEVELOPMENT.md](./docs/en-US/DEVELOPMENT.md) |
| 架构 | [docs/zh-CN/ARCHITECTURE.md](./docs/zh-CN/ARCHITECTURE.md) | [docs/en-US/ARCHITECTURE.md](./docs/en-US/ARCHITECTURE.md) |
| 索引 | [docs/README.md](./docs/README.md) | 同左 |

## 参与贡献

欢迎任何形式的贡献：报告问题、提出建议、改进文档、提交代码。

| 想做什么 | 去哪里 |
| --- | --- |
| 🐛 报告 Bug | [新建 Issue](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/issues/new/choose) |
| 💡 提出建议 | [Feature Request](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/issues/new/choose) |
| 🔧 提交代码 | 先读 [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 📖 改进文档 | 直接提 PR |

提交代码前请本地验证：

```bash
npm ci
npm run build     # tsc --noEmit
npm run test:ci   # vitest
```

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)；
- 接口变更需同步 `docs/zh-CN/API.md` 与 `docs/en-US/API.md`；
- 更新 `CHANGELOG.md` 的 `Unreleased` 段落；
- 请遵守 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)（Contributor Covenant 2.1）。

PR 检查清单见 [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)。

## 安全

**请勿通过公开 Issue 报告安全漏洞。** 请使用
[GitHub 私人漏洞报告](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/security/advisories/new)。

- 已启用基线安全响应头：`X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`、
  `Permissions-Policy`（见 `src/http/headers.ts` 与 `public/_headers`）；
- 因 Worker 无文件系统，RSA 私钥以**构建期内嵌**方式存放在 `src/generated/pem.ts`，
  请像对待上游项目一样谨慎管理仓库与 fork 的访问权限；
- 如需轮换密钥：更新 `private/certs/` 后执行 `npm run embed-pem` 并提交。

详细流程与响应时限见 [SECURITY.md](./SECURITY.md)。

## 版本与变更

- 版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)；
- 全部变更见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

本项目基于 **[Eclipse Public License 2.0](./LICENSE)**（SPDX: `EPL-2.0`）发布。
Copyright (c) 2026 BlueSky and individual contributors.

| 项目 | 内容 |
| --- | --- |
| 许可证 | Eclipse Public License 2.0 |
| SPDX 标识 | `EPL-2.0` |
| 完整文本 | [LICENSE](./LICENSE) |
| 第三方依赖 | [NOTICE](./NOTICE) |

- **允许**：商业与非商业使用、修改、分发；EPL-2.0 为弱 copyleft，仅约束本项目自身源码。
- **义务**：分发时保留 `LICENSE` 与 `NOTICE`；对外分发修改版时以 EPL-2.0 公开被修改部分的源码。
- 第三方组件（Wrangler、TypeScript、Vitest、ja-netfilter、CDN 库）遵循各自许可证，见 [NOTICE](./NOTICE)。
- JetBrains 及其产品名称、图标为 JetBrains s.r.o. 的商标，本项目与其无隶属或背书关系。

## 相关仓库

| 形态 | 仓库 | 说明 |
| --- | --- | --- |
| **Serverless（本仓库）** | [Blduu/jetbrains-license-server-help-cloudflare](https://github.com/Blduu/jetbrains-license-server-help-cloudflare) | Cloudflare Workers + 静态资源，零运维 |
| **JVM 版** | [Blduu/jetbrains-helper](https://github.com/Blduu/jetbrains-helper) | Spring Boot 3.5 / Java 21，功能完整，含插件目录缓存与 Docker 部署 |

<p align="center">
  <a href="https://github.com/Blduu/jetbrains-helper">
    <img src="https://img.shields.io/badge/JVM%20%E7%89%88-Spring%20Boot%20%2B%20Java%2021-6DB33F?logo=springboot&logoColor=white" alt="JVM 版" />
  </a>
</p>
