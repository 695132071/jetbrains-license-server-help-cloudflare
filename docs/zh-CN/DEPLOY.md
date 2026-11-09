# 在 Cloudflare 上部署

本仓库面向 **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** 官方 Git 集成：在 Cloudflare 控制台绑定 GitHub（或 GitLab）后，推送即构建与部署。**不需要**在 GitHub 仓库里配置 `CLOUDFLARE_API_TOKEN`（该路径下）；本地也**不必**对 Workers Builds 执行 `wrangler login`（仅需在控制台完成一次 Git 提供商授权）。

## 前置条件

1. Git 仓库内已包含：
   - **`src/generated/pem.ts`** — RSA 签名用嵌入密钥（见 [DEVELOPMENT.md](./DEVELOPMENT.md)）。
   - **`public/ja-netfilter.zip`** — 否则运行时 `GET /ja-netfilter` 会失败。
2. Cloudflare 账号。
3. **完成 GitHub 授权**：Cloudflare 通过 **Cloudflare Workers and Pages** GitHub App
   读取仓库（不是匿名抓取）。首次部署前需在控制台安装该 App 并授予本仓库权限，
   否则会报「无法获取存储库内容」。详见下文
   [「无法获取存储库内容」](#无法获取存储库内容)。

## 推荐：Workers「从存储库导入」

**不要**选用「仅静态站点」的 Pages 模板；本项目为 **Worker + 静态资源**。

1. 打开 [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)。
2. **创建应用** → **Import a repository** / 从存储库导入。
3. 授权 **GitHub**（或 GitLab），选择本仓库与分支（如 `main`）。
4. **构建配置**（与[官方构建说明](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)一致）：

   | 配置项 | 填写值 |
   |--------|--------|
   | 根目录 | `.` 或留空（含 `wrangler.jsonc` 的仓库根） |
   | **构建命令** | `npm ci && npm run build` |
   | **部署命令** | `npx wrangler deploy`（默认即可） |

   `npm run build` 会经 `prebuild` 执行 `embed-pem`（在已提交 `pem.ts`、无 `private/certs/` 时通常很快跳过），再执行 TypeScript 检查。

5. **项目名称（Worker name）**：界面上的「项目名称」通常**从 GitHub 仓库名预填**，**不会**自动读取 `wrangler.jsonc`。根据 [Workers name requirement](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/#workers-name-requirement)，控制台名称必须与 `wrangler.jsonc` → **`"name"`** 完全一致（本仓库为 **`jetbrains-license-server-help-cloudflare`**），否则构建失败。

   **本仓库**在 GitHub 上的地址为 [`jetbrains-license-server-help-cloudflare`](https://github.com/Blduu/jetbrains-license-server-help-cloudflare)，与 `wrangler.jsonc` 一致，导入时一般**无需**再改「项目名称」。

   **若您的 GitHub 仓库名不同**（例如 fork 后改了仓库名，或仍为混合大小写如 `My-Worker-Repo`）：

   - 在控制台将 **项目名称** 手动设为 **`jetbrains-license-server-help-cloudflare`**，**或**
   - 修改 `wrangler.jsonc` 中的 `"name"` 与所选 Worker 名一致，并与控制台保持同步，**或**
   - 使用 **[Deploy to Cloudflare](https://developers.cloudflare.com/workers/platform/deploy-buttons/)** 向导调整 **Worker 名称**。

6. 保存并部署。向**本账号**部署时，一般**无需**在项目中手动填写 Cloudflare API Token 类变量；由 Workers Builds 集成身份完成。
7. 使用控制台分配的 **\*.workers.dev** 访问；前端与 `/api/*`、`/rpc/*` 同源。

### 健康检查

使用 **`GET /api/health`** 或 **`HEAD /api/health`** 做探活；响应为 JSON（含 `ok`、`service`），`Cache-Control: no-store`。

### 预览分支

非默认分支可能使用 `npx wrangler versions upload` 生成预览版本而不直接上线生产，以控制台说明为准。

## 可选：GitHub Actions

若希望在 GitHub 侧执行 CI/CD：

1. 在 Cloudflare 创建具备 **Workers Scripts: Edit** 与 **Account Settings: Read** 的 API Token（[创建说明](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)）。
2. 在仓库 **Settings → Secrets and variables → Actions** 中添加 **`CLOUDFLARE_API_TOKEN`** 与 **`CLOUDFLARE_ACCOUNT_ID`**（CI 里执行 `wrangler deploy` **两者缺一不可**，否则会报非交互环境缺少 Token）。
3. 工作流文件：[`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)。

**行为说明：** 每次推送都会跑 **构建与测试**。**Deploy to Cloudflare** 步骤会执行，但脚本在检测到任一 Secret 未设置时 **跳过 `npm run deploy`**（GitHub 不允许在 `if:` 里使用 `secrets` 上下文）。若未配置 Secret，流水线仍为成功 —— 可改用上文 **Workers Builds** 在 Cloudflare 侧部署，或补全 Secret 以启用 Actions 部署。

与控制台「连接 Git」的构建流程可按需**二选一**（也可只用 Actions 做 CI、在控制台部署）。

## 轮换 PEM / 证书

从 Java 构建产物（`target/classes/external/certificate/`）复制 `private.key`、`public.key`、`code-ca.crt`、`server-child-ca.crt` 到本地 `private/certs/`，执行 `npm run embed-pem`，提交更新后的 **`src/generated/pem.ts`** 并推送。

## 「无法获取存储库内容」

点击 Deploy to Cloudflare 按钮，或在控制台粘贴仓库地址后，出现：

> 无法获取存储库内容

**原因**：`deploy.workers.cloudflare.com` 现在会 **307 跳转**到控制台的
「Deploy to Workers」流程：

```
https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers&repository=<repo>
```

该流程**通过 Cloudflare GitHub App 读取仓库**，而不是匿名抓取。
仓库即使已公开（浏览器可访问、`git clone` 正常、`codeload` 返回 200），
只要 App 未安装或未授予该仓库权限，仍会得到这个错误。

按顺序检查：

### 1. 安装 Cloudflare GitHub App

打开 [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)，
首次使用会提示 **Connect GitHub**，按引导安装 **Cloudflare Workers and Pages** App。

### 2. 补齐仓库授权范围

GitHub → **Settings → Applications → Cloudflare Workers and Pages → Configure**：

- **Repository access** 选 **All repositories**，或
- 选 **Only select repositories**，并在列表中勾选
  **`Blduu/jetbrains-license-server-help-cloudflare`**

> 若之前只授权了部分仓库（例如只选了 `jetbrains-helper`），本仓库就会读不到。

### 3. 确认 Cloudflare 绑定的是仓库所有者的 GitHub 账号

Cloudflare 侧授权的账号必须是 **`Blduu`**。若浏览器当时登录的是另一个账号，
即使是公开仓库也可能无法读取。

### 4. 改用控制台入口直接导入

绕开按钮跳转，直接访问
[Workers & Pages → Create → Import a repository](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)，
或按上文「推荐：Workers『从存储库导入』」操作。

### 5. 本地复现验证

下面命令用于确认**仓库侧没问题**（能返回 `200` 就说明不是仓库的锅）：

```bash
# 匿名读取仓库元数据
curl -s https://api.github.com/repos/Blduu/jetbrains-license-server-help-cloudflare | grep -E '"private"|"visibility"'
# 匿名拉取源码包（Cloudflare 侧走的就是这类接口）
curl -sI -L https://codeload.github.com/Blduu/jetbrains-license-server-help-cloudflare/tar.gz/refs/heads/main | head -1
```

### 6. 不走 Git 集成（见下节）

若暂时无法完成 App 授权，直接用 **wrangler CLI** 发布，完全不经过 GitHub App。

## 备选：本机 wrangler CLI 部署

不需要 GitHub App，也不需要 Workers Builds：

```bash
git clone https://github.com/Blduu/jetbrains-license-server-help-cloudflare.git
cd jetbrains-license-server-help-cloudflare

npm ci
npx wrangler login     # 浏览器授权一次
npx wrangler whoami    # 确认账号与权限（会列出 Account ID / 权限）
npx wrangler deploy    # 发布
```

发布成功后会输出访问地址，形如
`https://jetbrains-license-server-help-cloudflare.<subdomain>.workers.dev`。

部署前可先本地自检（不做任何线上变更）：

```bash
npm run build                                  # tsc 类型检查
npx wrangler deploy --dry-run --outdir /tmp/out # 只打包，不上传
```

> CLI 部署属于**直接上传**。若之后想改为「推送即部署」，
> 可在控制台该 Worker 的 **Settings → Build** 中再连接 Git 仓库。

## 故障排查

| 现象 | 处理 |
|------|------|
| 提示「无法获取存储库内容」 | Cloudflare GitHub App 未安装或未授权本仓库。见 [「无法获取存储库内容」](#无法获取存储库内容)。 |
| Worker 名称不一致 | 将控制台 Worker 名与 `wrangler.jsonc` → `name` 对齐，或改配置后重新提交。 |
| 缺少 `pem.ts` / embed 失败 | 提交 `src/generated/pem.ts`，或在 CI 中提供 `private/certs/`。 |
| 找不到 `wrangler` | 确认 `npm ci` 未用 `--omit=dev` 误删生产依赖；`wrangler` 在 `dependencies` 中。 |
| `/ja-netfilter` 404 | 提交 `public/ja-netfilter.zip`。 |
| 构建成功但运行 500 | 查看控制台 Worker **日志**；参见 `src/index.ts` 错误处理。 |
| 仅「全部产品」生成失败、单个 IDE 成功；指标 **exceededCpu** 或 **1102**；或 **500** `internal_error` | 未传 `productCode` 时 Worker 默认只包含 **product.json 中的 IDE 产品码**（体量小，适配 Free）。若需在**一条**激活码里包含全部付费插件码，须在请求里显式传入超长 `productCode` 列表，且通常需要 **Workers Paid** 与更高 CPU。`limits.cpu_ms` 仅 **Paid** 可用（Free 写入会报 **100328**）。运行 `node scripts/check-catalog-weight.mjs` 可对比 IDE-only 与「IDE+插件」JSON 长度。 |

## 相关链接

- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- 英文版：[../en-US/DEPLOY.md](../en-US/DEPLOY.md)
