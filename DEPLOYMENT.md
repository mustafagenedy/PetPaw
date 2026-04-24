# PetPaw — Launch Runbook

This is the step-by-step guide to get PetPaw into production safely. Follow the sections in order the first time; use as a reference afterwards.

## 0. Prerequisites

- GitHub repository already initialized and pushed (this repo, `master` branch).
- A MongoDB Atlas account (free tier is fine to start).
- Accounts on the hosts you choose below.
- A domain you control (optional for v1, required before you enable HSTS preload).

## 1. Pick a hosting shape

### Option A — Simple (recommended for v1)

- **Client** on Vercel (auto-preview per PR, auto-deploy on merge)
- **Server** on Render (or Railway / Fly.io)
- **Database** on MongoDB Atlas

Trade-off: simplest ops, but client and server are on different eTLD+1 domains (e.g. `petpaw.vercel.app` + `petpaw-api.onrender.com`), so session cookies need `SameSite=None`.

### Option B — Same-site (recommended once you own a domain)

- **Client** on Vercel / Cloudflare Pages at `petpaw.com`
- **Server** on Render / Fly.io at `api.petpaw.com`
- **Database** on MongoDB Atlas

Trade-off: a bit more DNS work, but you can use `SameSite=Lax` for cookies, which is stricter and CSRF-safer by default.

Both are supported by this codebase via the `COOKIE_SAMESITE` env var.

## 2. Database — MongoDB Atlas

1. Create a free-tier Atlas cluster in the region closest to your users (for Cairo, choose an EU or ME region).
2. Create a **database user** with a long random password.
3. Network access: add your deploy host's egress IPs (or `0.0.0.0/0` as a last resort with a very strong DB password). Render/Fly.io IPs aren't static — most teams use `0.0.0.0/0` + strong creds for small projects.
4. Copy the connection string — it looks like `mongodb+srv://<user>:<pass>@<cluster>.xxxx.mongodb.net/petpaw?retryWrites=true&w=majority`. This becomes `MONGO_URI`.
5. **Backups**: Atlas paid tiers have continuous backup. On free tier, set up a weekly `mongodump` → S3/GCS with a cron script or a small GitHub Actions scheduled workflow. First restore test: do it within the first month.

## 3. Secrets (generate once, then store in your host's secret manager — never in git)

| Secret | How to generate | Where it goes |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 32` | Render/Fly env (server) |
| MongoDB user password | during Atlas user creation | embedded in `MONGO_URI` |
| `ADMIN_PASSWORD` | `openssl rand -base64 24` | Render/Fly env (server, one-time use for seed) |

## 4. Environment variables

### Server (Render / Fly.io / VPS)

| Variable | Required | Example | Notes |
|---|---|---|---|
| `NODE_ENV` | ✅ | `production` | Enables `Secure` cookies, quiets error logs |
| `PORT` | ✅ | `5000` | Render sets this automatically |
| `MONGO_URI` | ✅ | `mongodb+srv://…` | From Atlas |
| `JWT_SECRET` | ✅ | 32+ byte random | Boot fails if missing/short/placeholder |
| `CORS_ORIGIN` | ✅ | `https://petpaw.com` | Comma-separated; include any preview domains |
| `COOKIE_SAMESITE` | ✅ for cross-site deploys | `none` (Option A) or `lax` (Option B) | — |

Rotation: rotate `JWT_SECRET` quarterly or immediately if leaked. Rotation invalidates all existing sessions — users re-login. Rotate Atlas password via Atlas UI; update `MONGO_URI` in env.

### Client (Vercel build-time env)

| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_API_URL` | ✅ in prod | `https://petpaw-api.onrender.com` (Option A) or `https://api.petpaw.com` (Option B) | Baked into the build. Change → redeploy |

## 5. Seed the first admin (one-time)

On the server host (Render's "Shell" tab or SSH), with env vars set:

```bash
ADMIN_EMAIL=owner@example.com \
ADMIN_PASSWORD='<generated-strong-password>' \
ADMIN_NAME='Owner' \
node addAdmin.js
```

Then store the credentials in your password manager and delete the env vars from your shell history. Log in once to confirm, then reset the password through a future profile page (or by re-running the script).

## 6. Deploy — Option A (Vercel + Render)

### 6a. Server on Render

1. New Web Service → connect GitHub → pick the `master` branch.
2. Root directory: `server`. Build: `npm ci`. Start: `node server.js`. Node version: `20`.
3. Add env vars from §4. Set `COOKIE_SAMESITE=none` (cross-site) and `NODE_ENV=production`.
4. Deploy. Verify `https://petpaw-api.onrender.com/` returns `PetPaw API is running`.

### 6b. Client on Vercel

1. New Project → import the repo.
2. Framework preset: **Vite**. Root directory: `client`. Build: `npm run build`. Output: `dist`.
3. Env var: `VITE_API_URL=https://petpaw-api.onrender.com`.
4. Deploy. Verify the site loads and `/api/gallery` works through the Network tab.

### 6c. Back-fill CORS_ORIGIN

Once the Vercel URL is live, update Render: `CORS_ORIGIN=https://petpaw.vercel.app` (plus any preview domains you need). Redeploy the server.

## 7. Deploy — Option B (same-site, once you have a domain)

1. Buy a domain (e.g. `petpaw.com`).
2. Client → Vercel, add custom domain `petpaw.com`. Vercel provisions a cert automatically.
3. Server → Render, add custom domain `api.petpaw.com`. Render provisions a cert.
4. Update env:
   - Server: `CORS_ORIGIN=https://petpaw.com`, `COOKIE_SAMESITE=lax`.
   - Client: `VITE_API_URL=https://api.petpaw.com`. Rebuild.
5. Verify login → book flow on the production domain.

## 8. HSTS (do this AFTER you're sure HTTPS is stable on the final domain)

The server already sets HSTS via `helmet()` on the API. Once the full site is stable for at least a week:

1. Change helmet's `strictTransportSecurity` to `maxAge: 63072000, includeSubDomains: true, preload: true` in `server.js`.
2. Submit the domain to https://hstspreload.org/ (browser vendors).

**Warning:** preload is effectively irreversible for a year+. Do not submit until you are certain about using HTTPS on the apex and every subdomain.

## 9. CI/CD

### CI (already configured)

`.github/workflows/ci.yml` runs on every PR and push to `master`:
- **Client**: `npm ci` → `npm run lint` → `npm run build` → `npm audit --audit-level=high`
- **Server**: `npm ci` → `node --check` over every `.js` → `npm audit --audit-level=high`
- **Secrets hygiene**: fails if any `.env` file is tracked

### CD (via host auto-deploy)

Vercel and Render both auto-deploy on push to `master`. Vercel also creates preview deployments per PR — open the PR checks to find the preview URL. No GitHub Actions needed for deploy itself.

### Branch protection (do this in the GitHub UI, one time)

Settings → Branches → Add rule for `master`:
- ✅ Require pull request before merging
- ✅ Require status checks (`Client — lint + build + audit`, `Server — syntax + audit`, `No .env committed`)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

Also enable in Settings → Code security:
- **Secret scanning** (free on public repos; push protection catches leaked credentials before they land)
- **Dependabot alerts** + **security updates** (auto-PRs for vulnerable deps)

## 10. Observability

Add these post-launch:

### Uptime
- [Better Stack](https://betterstack.com/) or [UptimeRobot](https://uptimerobot.com/) — free tiers are fine.
- Monitor: `GET https://petpaw.com/`, `GET https://api.petpaw.com/api/services` (public endpoint, reveals DB health).
- Alert to email + Slack/Discord.

### Error tracking
- [Sentry](https://sentry.io) — free tier covers this project. Add the Sentry SDK to the Express server (auto-captures 5xx) and to the React client (captures uncaught JS errors).
- Configure PII stripping: don't send user emails, phone, or messages to Sentry breadcrumbs.

### Analytics (privacy-respecting)
- [Plausible](https://plausible.io) or [Umami](https://umami.is/) (self-hostable). No cookies, GDPR-compliant by default.
- Don't use Google Analytics without a consent banner; it requires one in the EU.

## 11. Post-launch checklist (day-of)

- [ ] Client loads on the production domain over HTTPS. No mixed-content warnings in DevTools.
- [ ] `/api/services` returns an array over HTTPS from the client's origin.
- [ ] Register a test user → cookies `token` (HttpOnly, Secure) + `csrf` (not HttpOnly, Secure) are set on the response.
- [ ] Login → book a fake appointment → visible in `/dashboard`.
- [ ] Admin login → see booking in `/admin` → mark completed → customer's dashboard reflects the new status.
- [ ] Contact form submit (logged out) succeeds on a fresh browser.
- [ ] `POST /api/auth/login` with bad creds ×6 → 6th returns **429**.
- [ ] `POST /api/bookings` without `X-CSRF-Token` → **403**.
- [ ] View source / Network → no `token` ever visible in `localStorage` or response body.
- [ ] Verify `CORS_ORIGIN` is set to your production client origin only (not `*` or localhost).
- [ ] Verify `JWT_SECRET` is the production value, not the dev one. (Different secret invalidates dev sessions — intended.)
- [ ] Point Better Stack / UptimeRobot at the site. First check passes.
- [ ] Sentry receives a test exception.
- [ ] Take a manual Atlas backup. Note the timestamp. Do one restore into a scratch DB within the first week.

## 12. Runbook: "something's broken in prod"

| Symptom | First check |
|---|---|
| Login succeeds locally, fails in prod | DevTools → Network → is `Set-Cookie` present? If the cookie has `SameSite=Lax` but client and server are cross-site, set `COOKIE_SAMESITE=none` on the server. |
| All authenticated requests return 403 CSRF | Is the `csrf` cookie being set? Is the client's interceptor reading it? (Check `document.cookie` in the browser console.) If the client is on a different domain, `withCredentials: true` must be set on every request AND CORS `credentials: true` on the server — both are already in the code. |
| Server crashes on boot with "FATAL: JWT_SECRET…" | Your `JWT_SECRET` env var is missing, < 32 chars, or still the placeholder. Generate a new one with `openssl rand -base64 32`. |
| 429 on every request | Someone's hitting the rate limiter. Look at the `x-ratelimit-*` response headers for the window, and consider raising the limits in `routes/auth.js` / `routes/contact.js` if legitimate. |
| Mongo won't connect | Atlas network access → confirm your deploy host's IP is allowed, or you have `0.0.0.0/0`. Check the password in `MONGO_URI` hasn't rotated. |

---

*This runbook supersedes the previous deployment doc. Keep it current as the stack evolves.*
