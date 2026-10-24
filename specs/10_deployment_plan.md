# 10 — Deployment Plan

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Budget: ₹0 — free tiers only.

---

## 1. Environments

| Env | Purpose | Frontend | Backend | Database |
|-----|---------|----------|---------|----------|
| Local | development | Vite dev server (:5173) | nodemon (:5000) | Local or Atlas dev cluster |
| Production | real users | Vercel | Render (or Railway) | MongoDB Atlas M0 |

No staging environment for MVP — UAT runs against a **seeded demo dataset** on production before the pilot.

## 2. Hosting Setup

### Frontend — Vercel
- Build: `npm run build` (Vite) · Output: `dist/`
- Env vars: `VITE_API_URL=https://<api-host>`, `VITE_SOCKET_URL=https://<api-host>`
- SPA rewrite: all routes → `index.html`

### Backend — Render (free web service)
- Start: `node src/index.js` · Health check: `GET /api/health`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT`
- CORS: allow only `CLIENT_ORIGIN` in production
- Note: free tier sleeps after ~15 min idle → first request after idle is slow; mitigate with a college-hours uptime pinger (Phase 2) or accept it for MVP

### Database — MongoDB Atlas M0
- Create cluster → database user → network access from `0.0.0.0/0` (free-tier reality) with strong credentials
- Backups: M0 has none → run `mongodump` weekly script during pilot (or accept risk for MVP, noted in risk register)

## 3. Environment Variables

| Key | Where | Example |
|-----|-------|---------|
| `MONGODB_URI` | server | `mongodb+srv://user:pass@cluster/quickcanteen` |
| `JWT_SECRET` | server | 64-char random string (`openssl rand -hex 32`) |
| `CLIENT_ORIGIN` | server | `https://quickcanteen.vercel.app` |
| `VITE_API_URL` | client | `https://quickcanteen-api.onrender.com` |
| `VITE_SOCKET_URL` | client | same as API |

`.env` files are git-ignored; `.env.example` committed with empty values.

## 4. First Deployment Runbook

1. `git push` → Render auto-deploys server; Vercel auto-deploys client
2. Atlas: create indexes from Doc 05 §3 (one-time setup script `npm run seed:indexes`)
3. Seed: `npm run seed:demo` — 1 admin, 3 canteens + owners, ~20 menu items
4. Smoke test (from Doc 09 TC-AUTH/TC-ORDER): register → login → order → owner accept → ready
5. Verify Socket.io: two browsers, check R1/R2 latency < 2s

## 5. CI/CD

- GitHub Actions on every PR:
  1. `npm ci` (server & client)
  2. ESLint + Prettier check
  3. `npm test` (Jest/Vitest against `quickcanteen_test`)
  4. Client build must succeed
- Deploys: auto on merge to `main` (Render + Vercel default behavior)

## 6. Release & Rollback

- **Release:** tag `v0.1.0` etc.; changelog in RELEASES.md
- **Rollback:** Render & Vercel keep previous deploy — "Rollback" button to last good deploy
- **DB migrations:** MVP has none (schemaless); any future breaking change ships with a dual-read window

## 7. Monitoring & Maintenance

| Concern | Tool (free) |
|---------|-------------|
| Errors | Render log stream; add Sentry (free tier) in Phase 2 |
| Uptime | UptimeRobot ping `/api/health` every 5 min (also prevents idle sleep) |
| DB usage | Atlas dashboard (watch the 512 MB M0 cap) |

## 8. Pilot Day Checklist (deploy to demo)

- [ ] Both URLs up, smoke test passed
- [ ] Demo data seeded; tokens counters clean for the day
- [ ] Owner dashboards tested on the actual canteen phones
- [ ] Poster with app QR at canteen entrance
- [ ] Rollback path known (Render dashboard bookmarked)
