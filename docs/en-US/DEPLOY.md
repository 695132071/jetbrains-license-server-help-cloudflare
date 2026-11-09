# Deploying on Cloudflare

This project is designed for **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)**: connect a GitHub (or GitLab) repository in the dashboard; pushes trigger build and deploy. You do **not** need `CLOUDFLARE_API_TOKEN` in GitHub Secrets for that path, and you do not need `wrangler login` on your laptop for Cloudflare-hosted builds (only one-time Git provider authorization in the dashboard).

## Prerequisites

1. A Git repository containing:
   - **`src/generated/pem.ts`** — embedded key material for RSA signing (see [DEVELOPMENT.md](./DEVELOPMENT.md)).
   - **`public/ja-netfilter.zip`** — otherwise `GET /ja-netfilter` will fail at runtime.
2. A Cloudflare account.
3. **GitHub authorization completed**: Cloudflare reads the repository through the
   **Cloudflare Workers and Pages** GitHub App — not anonymous fetches. Install the App
   and grant it access to this repository before the first deploy, otherwise you will see
   "Cannot fetch repository contents". See
   [Cannot fetch repository contents](#cannot-fetch-repository-contents).

## Recommended: Import repository (Workers)

Do **not** use the “static site only” Pages template. This app is a **Worker + Static Assets** bundle.

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
2. **Create application** → **Import a repository** (Get started).
3. Authorize **GitHub** (or GitLab) and select this repo and branch (e.g. `main`).
4. **Build settings** (see [official configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)):

   | Setting | Value |
   |---------|--------|
   | Root directory | `.` or empty (repository root containing `wrangler.jsonc`) |
   | **Build command** | `npm ci && npm run build` |
   | **Deploy command** | `npx wrangler deploy` (default is fine) |

   `npm run build` runs `prebuild` → `embed-pem` (no-op if `private/certs/` is absent but `pem.ts` exists), then `tsc --noEmit`.

5. **Project / Worker name:** Cloudflare usually **prefills the project name from your GitHub repository name**. It does **not** read `wrangler.jsonc` for that field. Per [Workers name requirement](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/#workers-name-requirement), the dashboard name must **exactly match** `wrangler.jsonc` → `"name"` (this repo: **`jetbrains-license-server-help-cloudflare`**), or the build fails.

   **This repository** uses the GitHub name [`jetbrains-license-server-help-cloudflare`](https://github.com/Blduu/jetbrains-license-server-help-cloudflare), so the prefilled name typically matches Wrangler with no manual edit.

   **If your GitHub repo name differs** (e.g. after a fork with another slug, or mixed-case like `My-Worker-Repo`):

   - Manually set **Project name** to **`jetbrains-license-server-help-cloudflare`**, **or**
   - Change `"name"` in `wrangler.jsonc` to match your chosen Worker name and keep the dashboard in sync, **or**
   - Use **[Deploy to Cloudflare](https://developers.cloudflare.com/workers/platform/deploy-buttons/)** and adjust **Worker name** in the wizard.

6. Save and deploy. Do **not** add manual API token env vars for Cloudflare to deploy *into your own account*; Workers Builds uses the integration identity.
7. Use the issued **\*.workers.dev** URL — UI and APIs share the same origin.

### Health checks

Use **`GET /api/health`** or **`HEAD /api/health`** for uptime checks. Response JSON includes `ok` and `service` name; `Cache-Control: no-store`.

### Preview branches

Non-production branches often use `npx wrangler versions upload` for previews instead of promoting to production — see your dashboard build docs.

## Optional: GitHub Actions

If you prefer CI on GitHub:

1. Create a Cloudflare **API token** with **Workers Scripts: Edit** and **Account Settings: Read** (see [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)).
2. In the repo: **Settings → Secrets and variables → Actions**, add **`CLOUDFLARE_API_TOKEN`** and **`CLOUDFLARE_ACCOUNT_ID`** (both required for `wrangler deploy` in CI).
3. Workflow: [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml).

**Behavior:** Every push runs **Build and test**. The **Deploy to Cloudflare** step always runs, but the script **skips `npm run deploy`** when either secret is unset (GitHub does not allow the `secrets` context in `if:` expressions). If secrets are missing, CI still passes — use [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) in the dashboard instead, or add the secrets to enable Actions deploy.

This is **independent** from dashboard Git integration — choose one deploy path (or use Actions for CI only).

## Rotating PEM / certificates

Copy `private.key`, `public.key`, `code-ca.crt`, `server-child-ca.crt` from the Java build output (`target/classes/external/certificate/`) into `private/certs/` locally, run `npm run embed-pem`, commit the updated **`src/generated/pem.ts`**, and push.

## Cannot fetch repository contents

Clicking the Deploy to Cloudflare button, or pasting the repository URL in the dashboard, fails with:

> Cannot fetch repository contents

**Cause**: `deploy.workers.cloudflare.com` now issues a **307 redirect** into the dashboard
"Deploy to Workers" flow:

```
https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers&repository=<repo>
```

That flow reads the repository **through the Cloudflare GitHub App**, not by anonymous cloning.
Even for a public repository (browser access OK, `git clone` OK, `codeload` returns 200),
the flow fails when the App is not installed or not granted access to this repository.

Check in order:

### 1. Install the Cloudflare GitHub App

Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
On first use it prompts **Connect GitHub** — install the **Cloudflare Workers and Pages** App.

### 2. Widen the repository scope

GitHub → **Settings → Applications → Cloudflare Workers and Pages → Configure**:

- **Repository access** → **All repositories**, or
- **Only select repositories** → include
  **`Blduu/jetbrains-license-server-help-cloudflare`**

> If the App was previously limited to other repos (e.g. only `jetbrains-helper`),
> this repository cannot be read.

### 3. Make sure the Cloudflare account is linked to the repo owner

The Cloudflare-side GitHub authorization must belong to **`Blduu`**.
If the browser session was authenticated as a different account, public repos may still fail.

### 4. Import from the dashboard directly

Skip the button redirect and use
[Workers & Pages → Create → Import a repository](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create),
or follow "Recommended: Import repository (Workers)" above.

### 5. Verify the repository side locally

These commands confirm the **repository is fine** (a `200` means the problem is not the repo):

```bash
# Anonymous metadata
curl -s https://api.github.com/repos/Blduu/jetbrains-license-server-help-cloudflare | grep -E '"private"|"visibility"'
# Anonymous source archive (same class of endpoint Cloudflare uses)
curl -sI -L https://codeload.github.com/Blduu/jetbrains-license-server-help-cloudflare/tar.gz/refs/heads/main | head -1
```

### 6. Skip Git integration

If App authorization is not possible right now, deploy with the **wrangler CLI** — it never
touches the GitHub App.

## Alternative: deploy with the wrangler CLI

No GitHub App and no Workers Builds required:

```bash
git clone https://github.com/Blduu/jetbrains-license-server-help-cloudflare.git
cd jetbrains-license-server-help-cloudflare

npm ci
npx wrangler login     # one browser authorization
npx wrangler whoami    # confirm account and scopes
npx wrangler deploy    # publish
```

On success Wrangler prints the URL, e.g.
`https://jetbrains-license-server-help-cloudflare.<subdomain>.workers.dev`.

Pre-flight checks that make no remote changes:

```bash
npm run build                                   # TypeScript type check
npx wrangler deploy --dry-run --outdir /tmp/out # bundle only, no upload
```

> CLI deploys are **direct uploads**. To switch to push-to-deploy later, connect a Git
> repository from that Worker's **Settings → Build** in the dashboard.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| "Cannot fetch repository contents" | Cloudflare GitHub App not installed or not granted access to this repo. See [Cannot fetch repository contents](#cannot-fetch-repository-contents). |
| Worker name mismatch | Align dashboard worker name with `wrangler.jsonc` → `name`, or change config and recommit. |
| Missing `pem.ts` / embed fails | Commit `src/generated/pem.ts` or provide `private/certs/` in CI. |
| `wrangler` not found | Ensure `npm ci` without `--omit=dev` stripping production deps; `wrangler` is in `dependencies`. |
| `/ja-netfilter` 404 | Commit `public/ja-netfilter.zip`. |
| Build OK but 500 at runtime | Check Worker **Logs** in the dashboard; see `src/index.ts` error handler. |
| "All products" fails; **exceededCpu** / **1102**; or **500** `internal_error` | When `productCode` is omitted, the Worker defaults to **IDE codes from `product.json` only** (small enough for Free). To pack **every paid plugin** into one activation code, pass an explicit long `productCode` list and usually **Workers Paid** + higher CPU. `limits.cpu_ms` is **Paid-only** (on Free, Wrangler deploy fails with **100328**). Run `node scripts/check-catalog-weight.mjs` to compare payload sizes. |

## Related

- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- Chinese version: [../zh-CN/DEPLOY.md](../zh-CN/DEPLOY.md)
