<div align="center">

# JetBrains License Server Help · Cloudflare Workers

**JetBrains license server ported to a single Cloudflare Worker**

Signed XML-RPC license protocol, activation codes, JRebel-compatible endpoints and a static
Vue 3 console — all served from one Worker. No JVM, no container, no server to maintain.

[![CI](https://img.shields.io/github/actions/workflow/status/Blduu/jetbrains-license-server-help-cloudflare/deploy.yml?branch=main&label=CI&logo=github)](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/actions/workflows/deploy.yml)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-EPL--2.0-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[中文](./README.md) ·
[JVM 版 (Spring Boot)](https://github.com/Blduu/jetbrains-helper) ·
[Docs](./docs/README.md)

</div>

---

> **Disclaimer**
> For learning and research only. Support genuine software and comply with the JetBrains
> license agreement and your local laws. Use at your own risk.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Quick start (local)](#quick-start-local)
- [Deploy](#deploy)
- [Repository layout](#repository-layout)
- [API summary](#api-summary)
- [npm scripts](#npm-scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Overview

This repository ports **[jetbrains-helper](https://github.com/Blduu/jetbrains-helper)**
(Spring Boot / Java) to **one Cloudflare Worker** with **static assets**: same-origin web UI plus
XML-RPC license server, activation codes, JRebel-style JSON endpoints, and ja-netfilter download.
Ideal for **Git-connected deploys** on Cloudflare without running a JVM.

## Features

- **JetBrains license server protocol** — `GET`/`POST` compatible `/rpc/*.action` responses (signed XML).
- **Activation codes** — REST endpoints aligned with the original Java app (`/license-code/generate`, `/api/generateLicense`, etc.).
- **JRebel-style API** — `/jrebel/*`, `/agent/*`, `/guid` as in upstream.
- **Static SPA** — Vue 3 UI from `public/` via `env.ASSETS`.
- **Ops-friendly** — `/api/health`, security headers, CORS on public read APIs, validation on activation inputs.

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Cloudflare Workers |
| Language | TypeScript |
| Config / CLI | Wrangler 4.x (`wrangler.jsonc`) |
| Static files | Workers Static Assets (`public/`) |
| Data | Bundled `src/data/product.json`, `plugin.json` |
| Crypto | Web Crypto API (RSA-SHA1 / SHA512) keys embedded at build (`src/generated/pem.ts`) |

## Requirements

- **Node.js** ≥ 20
- **Committed** `src/generated/pem.ts` (so CI / Git builds need no `private/certs/` checkout)
- **Committed** `public/ja-netfilter.zip` for the download route

## Quick start (local)

```bash
git clone https://github.com/Blduu/jetbrains-license-server-help-cloudflare.git
cd jetbrains-license-server-help-cloudflare
npm ci
# If pem.ts is missing: copy keys into private/certs/ then:
npm run embed-pem
npm run dev
```

Open the URL Wrangler prints (e.g. `http://127.0.0.1:8787`).

## Deploy

> Before the first dashboard / button deploy, install the **Cloudflare Workers and Pages**
> GitHub App and grant it access to this repository. Cloudflare reads the repo through the App,
> not by anonymous cloning — a public repo alone is **not** enough, otherwise you get
> **"Cannot fetch repository contents"**.
> Fix: [docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md#cannot-fetch-repository-contents).

| Path | Description |
| --- | --- |
| **Cloudflare Dashboard (recommended)** | [Workers Builds — Import a repository](https://developers.cloudflare.com/workers/ci-cd/builds/). Build: `npm ci && npm run build`. Deploy: `npx wrangler deploy`. **No GitHub Secrets** required. |
| **wrangler CLI (no GitHub App)** | `npm ci && npx wrangler login && npx wrangler deploy`. Use this when Git integration cannot be authorized. |
| **GitHub Actions** | Optional — the workflow always **builds + tests**; **deploy** runs only if both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set under **Settings → Secrets and variables → Actions**. See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml). |

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Blduu/jetbrains-license-server-help-cloudflare)

**Project name vs GitHub:** the GitHub repository name matches `wrangler.jsonc` → `name`
(`jetbrains-license-server-help-cloudflare`), so Cloudflare's default worker name usually needs no
edit. If you **fork** under another name, set the dashboard Worker name to match `wrangler.jsonc`.

Full steps: [**docs/en-US/DEPLOY.md**](./docs/en-US/DEPLOY.md) · [**docs/zh-CN/DEPLOY.md**](./docs/zh-CN/DEPLOY.md) · shortcut: [**DEPLOY.md**](./DEPLOY.md)

## Repository layout

```
jetbrains-license-server-help-cloudflare/
├── public/              # Static UI, images, ja-netfilter.zip, _headers
├── src/
│   ├── index.ts         # Worker entry + error boundary
│   ├── router.ts        # HTTP routing
│   ├── crypto/          # PEM, signing, license-server XML signatures
│   ├── license/         # Activation XML, JRebel, code generation
│   ├── http/            # Security headers, CORS
│   ├── validation/      # Expiry & field limits
│   ├── data/            # product.json, plugin.json (+ catalog)
│   └── generated/       # pem.ts (committed; rebuilt by scripts/embed-pem.mjs)
├── scripts/embed-pem.mjs
├── test/                # Vitest unit tests (source, committed)
├── docs/en-US/          # English docs
├── docs/zh-CN/          # Chinese docs
├── wrangler.jsonc
└── package.json
```

## API summary

Detailed reference: [**docs/en-US/API.md**](./docs/en-US/API.md) · [**docs/zh-CN/API.md**](./docs/zh-CN/API.md)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health JSON (`HEAD` supported) |
| GET/HEAD | `/api/products`, `/api/plugins` | Catalog JSON (cached 600s) |
| GET | `/ja-netfilter` | ZIP attachment |
| GET | `/api/generateLicense`, `/api/generatePluginLicense` | Activation string |
| GET/POST | `/license-code/generate` | Activation string |
| * | `/rpc/*.action` | JetBrains license server XML |
| * | `/jrebel/*`, `/agent/*`, `/guid` | JRebel-compatible JSON/HTML |

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | `embed-pem` + `wrangler dev` |
| `npm run deploy` | `embed-pem` + `wrangler deploy` |
| `npm run build` | `embed-pem` + `tsc --noEmit` |
| `npm run check` | Typecheck only |
| `npm run test` | Embed + Vitest |
| `npm run test:ci` | Vitest only (after build in CI) |
| `npm run embed-pem` | Regenerate `src/generated/pem.ts` from `private/certs/` |

## Documentation

| Topic | English | 中文 |
| --- | --- | --- |
| Deploy | [docs/en-US/DEPLOY.md](./docs/en-US/DEPLOY.md) | [docs/zh-CN/DEPLOY.md](./docs/zh-CN/DEPLOY.md) |
| API | [docs/en-US/API.md](./docs/en-US/API.md) | [docs/zh-CN/API.md](./docs/zh-CN/API.md) |
| Development | [docs/en-US/DEVELOPMENT.md](./docs/en-US/DEVELOPMENT.md) | [docs/zh-CN/DEVELOPMENT.md](./docs/zh-CN/DEVELOPMENT.md) |
| Architecture | [docs/en-US/ARCHITECTURE.md](./docs/en-US/ARCHITECTURE.md) | [docs/zh-CN/ARCHITECTURE.md](./docs/zh-CN/ARCHITECTURE.md) |
| Index | [docs/README.md](./docs/README.md) | 同左 |

## Contributing

Bug reports, feature requests and pull requests are welcome.

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
2. Verify locally before opening a PR:

```bash
npm ci
npm run build     # tsc --noEmit
npm run test:ci   # vitest
```

3. Keep `CHANGELOG.md` (`Unreleased` section) up to date.
4. **Do not** report security issues in public — see [SECURITY.md](./SECURITY.md).

## Security

- Baseline headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy` (see `src/http/headers.ts`, `public/_headers`).
- PEM material is **embedded at build time** in `src/generated/pem.ts`, because Workers have no
  filesystem. Treat the repository and its forks accordingly, and rotate the key pair if needed
  (`npm run embed-pem`).
- Report vulnerabilities privately via
  [GitHub Security Advisories](https://github.com/Blduu/jetbrains-license-server-help-cloudflare/security/advisories/new).

## License

Released under the **[Eclipse Public License 2.0](./LICENSE)** (SPDX: `EPL-2.0`).
Copyright (c) 2026 BlueSky and individual contributors.

- **You may** use, modify and redistribute this project commercially or otherwise;
  EPL-2.0 is a *weak* copyleft license, so it only covers this project's own source.
- **You must** keep `LICENSE` and [NOTICE](./NOTICE) when redistributing, and publish the source
  of any modified version of this project you distribute.
- Third-party components (Wrangler, TypeScript, Vitest, ja-netfilter, CDN libraries) keep their
  own licenses — see [NOTICE](./NOTICE).
- JetBrains and its product names/icons are trademarks of JetBrains s.r.o.
  This project is not affiliated with or endorsed by JetBrains.
