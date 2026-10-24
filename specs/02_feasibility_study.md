# 02 — Feasibility Study

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21

A feasibility study answers: _should we build this, can we build this, and will people use it?_

---

## 1. Technical Feasibility — ✅ Feasible

**Question:** Do we have the skills and technology to build it?

| Requirement                               | Our Answer                                                           |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Web app with login & roles                | MERN stack — mature, heavily documented                              |
| Realtime notifications                    | Socket.io on Node.js — native fit, ~50 lines for the core feature    |
| Flexible data (menus/orders evolve often) | MongoDB documents — no migration overhead during dev                 |
| Hosting with ₹0 budget                    | Vercel (frontend), Render/Railway (backend), MongoDB Atlas free tier |

**Risks & answer:** Team already knows JavaScript from coursework → one language across the stack reduces learning curve to zero. Realtime is the only "new" concept; Socket.io has official beginner tutorials and the usage here (rooms per canteen) is a standard pattern.

**Verdict:** Technically feasible.

## 2. Economic Feasibility — ✅ Feasible (₹0 infrastructure)

**Development cost:** Customer team time only.

**Running cost (per month):**

| Item             | Service                 | Free Tier Limit             | Our Expected Use                         |
| ---------------- | ----------------------- | --------------------------- | ---------------------------------------- |
| Database         | MongoDB Atlas M0        | 512 MB, shared              | Users + orders for one college ≪ limit   |
| Backend hosting  | Render free web service | 750 hrs/mo                  | 1 service, sleeps when idle (acceptable) |
| Frontend hosting | Vercel Hobby            | Unlimited static/serverless | Well within                              |
| Domain           | —                       | ₹0                          | Use provided subdomains                  |

**Benefit to canteens:** Time saved per customer (~10–15 min) → higher effective serving capacity during the 45-minute lunch window; fewer abandoned sales from people seeing long queues and leaving. No hardware purchase needed — works on existing phones.

**Verdict:** Economically feasible; zero recurring cost for a college-scale deployment.

## 3. Operational Feasibility — ✅ Feasible

**Question:** Will users actually adopt it, and can the canteen staff operate it?

- **Customers:** Ordering is 3 taps (search → add → place). Simpler than walking to the canteen. QR poster at canteen entrance links to the app.
- **Owners:** Dashboard is a single screen with big buttons (Accept → Preparing → Ready). No typing required to process an order. Menu set-up is a one-time ~15-minute task per canteen.
- **Admin (college):** Creates canteens once per semester at most.
- **Change management:** The token system does not change how food is handed over — owner still calls out a token, same as today. This keeps adoption friction low.

**Verdict:** Operationally feasible; minimal behavior change for owners.

## 4. Schedule Feasibility — ✅ Feasible (4 weeks)

| Week | Milestone                                        |
| ---- | ------------------------------------------------ |
| 1    | Auth, roles, admin canteen management            |
| 2    | Menu CRUD, browse/search, cart                   |
| 3    | Split checkout, tokens, realtime owner dashboard |
| 4    | Notifications, tracking UI, testing, deployment  |

Scope is deliberately cut to Core MVP (no payments gateway, no ratings), which keeps the schedule realistic for a customer team. Payment is cash-at-counter, removing the longest-lead-time integration.

**Verdict:** Schedule feasible with the MVP scope.

## 5. Legal & Data Feasibility — ✅ Feasible

- **Personal data collected:** name, email, phone, department. Stored for order fulfillment only.
- **Passwords:** hashed with bcrypt (never stored in plain text); JWTs signed server-side.
- **No payment data** is stored in v1 (cash/UPI at counter) — the heaviest compliance area (PCI) is avoided entirely.
- **Ownership:** Canteen owners own their menu data; the college owns user accounts. An account-deletion request can be honored by removing the user document (orders retain anonymized token records).

**Verdict:** No legal blockers for a college-internal deployment.

## 6. Behavioral / Solution Feasibility

Peak load modeling for a college of ~2,000 customers:

- Worst case: 300 concurrent users 12:30–13:30, ~100 orders in 60 min
- Node.js event loop + MongoDB easily handles this volume; Socket.io per-canteen rooms keep event fan-out bounded
- If adoption stalls, the fallback is the existing physical queue — the app adds no new mandatory process

## 7. Summary

| Type        | Verdict                    |
| ----------- | -------------------------- |
| Technical   | ✅ Feasible                |
| Economic    | ✅ Feasible (₹0 recurring) |
| Operational | ✅ Feasible                |
| Schedule    | ✅ Feasible (4 weeks)      |
| Legal       | ✅ Feasible                |

**Recommendation:** Proceed to requirements specification (SRS).
