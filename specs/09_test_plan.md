# 09 — Test Plan

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21

---

## 1. Scope & Strategy

**In scope:** all MVP functional requirements (SRS §3) + key non-functional checks (§4).
**Levels:**

| Level | Tool | Coverage target |
|-------|------|-----------------|
| Unit (server) | Jest + Supertest | services & validators — critical paths 100%: order splitting, token allocation, status transitions |
| Unit (client) | Vitest + React Testing Library | cart grouping, note length, cart merge logic |
| Integration/API | Supertest against test DB | every endpoint's happy path + RBAC |
| Manual/Exploratory | Checklist below (2 phones + 1 laptop) | full user journeys |
| UAT | 5 customers + 2 owners + 1 admin, real lunch hour | acceptance criteria (SRS §6) |

**Test DB:** separate MongoDB database (`quickcanteen_test`), seeded before each run.

## 2. Environment Matrix

| Browser/Device | Priority |
|----------------|----------|
| Android Chrome (small phone, 360px) | P0 — primary device |
| Desktop Chrome | P0 |
| iOS Safari | P1 |
| Desktop Firefox | P2 |

## 3. Test Cases — Critical (P0)

### TC-AUTH
| ID | Case | Expected |
|----|------|----------|
| A1 | Register with valid data | 201, JWT issued, role=customer |
| A2 | Register duplicate email | 409, clear message |
| A3 | Login wrong password (5×) | 429 after limit (rate limit works) |
| A4 | Access `/api/orders/mine` without token | 401 |
| A5 | Customer calls owner endpoint | 403 |

### TC-ORDER (the heart — most rigorous)
| ID | Case | Expected |
|----|------|----------|
| O1 | Cart with items from 2 canteens → checkout | 201; **2** sub-orders, same groupId, separate tokens, correct per-canteen totals |
| O2 | Checkout when one canteen closed | 409; **no** order created for that canteen; other canteen's items still orderable |
| O3 | Checkout with a sold-out item | 409 with `details` naming the item |
| O4 | **Concurrency:** 50 parallel checkouts same canteen | All succeed, tokens strictly sequential, **zero duplicates** |
| O5 | Client sends tampered price (`price: 1`) | Ignored; server price used |
| O6 | Status transition `ready → preparing` (backwards) | 400, transition rejected |
| O7 | Owner of canteen A updates canteen C's order | 403 |
| O8 | Customer cancels while `preparing` | 400 (only `placed` cancellable) |
| O9 | Empty cart checkout | 400 |
| O10 | Note > 100 chars | 400 |
| O11 | Token resets next day | New date → seq starts at 1; prefix correct |

### TC-REALTIME
| ID | Case | Expected |
|----|------|----------|
| R1 | Owner places status → Ready; customer app open | Customer screen updates < 2s, no refresh |
| R2 | Customer checks out; owner dashboard open | New order card + sound < 2s |
| R3 | Owner A connected; order for canteen C placed | Owner A receives **nothing** (isolation) |
| R4 | Socket killed mid-tracking, then reconnect | State refetched correctly; banner cleared |
| R5 | Notification while logged out → login | Notification present in bell (persistence) |

### TC-MENU / TC-CANTEEN
| ID | Case | Expected |
|----|------|----------|
| M1 | Owner toggles sold out; item already in others' carts | Checkout rejects that item only (O3 covers order side) |
| M2 | Owner edits another canteen's item | 403 |
| M3 | Admin creates canteen with duplicate prefix | 409 |
| M4 | Closed canteen hidden from landing page | Not listed under OPEN NOW |

### TC-UI (manual, mobile-first)
| ID | Case | Expected |
|----|------|----------|
| U1 | Full order journey on 360px phone | No horizontal scroll; all targets tappable |
| U2 | Cart grouping UI | Items visually grouped per canteen with subtotals |
| U3 | Ready token screen | Giant token readable at arm's length |
| U4 | Offline mid-order | Friendly error, no crash |

## 4. Non-Functional Checks

| Check | Method | Target |
|-------|--------|--------|
| API latency p95 | k6/Artillery on `/api/menu/:id`, `POST /orders` | < 300 ms |
| Peak simulation | 300 virtual users browse, 100 orders in 10 min | no 5xx, tokens unique |
| Security scan | `npm audit`; manual JWT/role probing | no highs; 401/403 matrix correct |
| Responsiveness | Chrome DevTools device toolbar | 360–1920 px OK |

## 5. Defect Severity & Exit Criteria

| Severity | Definition | Examples |
|----------|-----------|----------|
| S1 | Blocks core flow, no workaround | duplicate tokens; order lost; wrong total charged |
| S2 | Major feature broken, workaround exists | realtime updates fail (refresh works) |
| S3 | Minor/UX | misaligned pill, slow image |

**Exit criteria (MVP):** 0 × S1 open · 0 × S2 open in order/realtime flows · all P0 test cases pass · UAT acceptance criteria (SRS §6) met.

## 6. UAT Script (lunch-hour pilot, 30 min)

1. 5 customers create accounts, browse, and place a 2-canteen order each
2. 2 owners accept, prepare, and mark Ready; hand over food by token
3. Admin toggles one canteen closed; verify it disappears from browsing
4. Collect feedback: "Would this replace standing in the queue tomorrow?" (target ≥ 4/5)
