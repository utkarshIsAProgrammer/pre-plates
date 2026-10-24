# 11 — Risk Register

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Scale: Probability & Impact = Low / Med / High. **Exposure = P × I.** Review weekly.

| ID | Risk | P | I | Exposure | Mitigation | Contingency (if it happens) |
|----|------|---|---|----------|------------|------------------------------|
| R1 | **Duplicate token numbers** under concurrent checkouts | Med | High | 🔴 High | Atomic `$inc` counter collection (Doc 05 §2.6); concurrency test O4 in CI | Pause ordering, manual token book at counter, patch & redeploy |
| R2 | Team deadline slip (exams/clashes) | High | Med | 🔴 High | MVP scope locked (no payments/ratings); weekly milestone check vs Charter §7 | Drop to single-canteen orders (remove split feature — degrades gracefully) |
| R3 | Free-tier backend sleeps → slow first order at peak | High | Low | 🟡 Med | UptimeRobot pinging `/api/health` every 5 min | Accept cold start; communicate "may take 30s first time" |
| R4 | Socket.io connections fail on college Wi-Fi (proxy blocks WebSocket) | Med | High | 🔴 High | Socket.io auto-falls back to HTTP long-polling; connection banner + refetch on reconnect (UI §7) | Polling mode: client polls `/api/orders/mine` every 10s as fallback |
| R5 | Owners don't adopt dashboard; keep taking walk-up orders | Med | Med | 🟡 Med | 15-min onboarding; big-button UI (UI §4); pilot with 2 willing owners first | Run as "pre-order lane" alongside physical queue |
| R6 | MongoDB M0 512 MB cap / connection limit | Low | Med | 🟢 Low | TTL on notifications; no file storage in DB (images via URLs/Cloudinary free) | Upgrade M0→Shared (₹~400/mo) or purge old orders |
| R7 | Secret leak (JWT/Mongo URI committed) | Low | High | 🟡 Med | `.env` git-ignored; pre-commit scan; `.env.example` pattern | Rotate secrets immediately; Atlas user revoke/recreate |
| R8 | Scope creep ("can it also do payments/QR/ratings?") | High | Med | 🔴 High | Charter §4 lists out-of-scope explicitly; change requests → Phase 2 backlog only | Evaluate only after MVP acceptance criteria met |
| R9 | Mobile network outage during lunch rush | Low | High | 🟡 Med | Cart works offline in-memory; clear error states | Canteen falls back to physical queue (status quo — no worse than today) |
| R10 | Key member unavailable mid-project | Med | Med | 🟡 Med | Docs in `specs/` make handover possible; pair on the order service (most critical) | Lead absorbs the module; descope FR-M/FR-L priorities first |
| R11 | Spam/fake orders (no payment friction) | Med | Low | 🟢 Low | Rate limit on orders; cancel only while `placed`; admin can deactivate | Add phone-OTP signup in Phase 2 |
| R12 | Browser data-loss wipes localStorage cart | Low | Low | 🟢 Low | Cart in localStorage is a convenience only; re-adding is 2 taps | — |

## Top 3 Focus Risks

1. **R1 (tokens)** — correctness of the core promise; tested hardest (TC-O4).
2. **R4 (WebSockets on campus network)** — test on college Wi-Fi in week 3, not on demo day.
3. **R8 (scope creep)** — the most likely risk to actually kill the schedule.

## Change Control

Any new feature request during MVP → logged in `BACKLOG.md` with a one-line cost estimate → decided by project lead + guide **after** UAT. Nothing merges to `main` mid-sprint without a descope trade.
