# 04 — System Design Document

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Covers: architecture, module design, data flow, sequence flows, state machines.

---

## 1. Architecture Overview

**Style:** 3-tier client–server, REST API + WebSocket layer.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER (React + Vite)               │
│                                                              │
│  Customer App          Owner Dashboard         Admin Panel   │
│  (browse/cart/order)   (live orders/menu)      (canteens)    │
│         │                    │                     │         │
│         └────────── Axios (REST) ──────────────────┘         │
│         └──────── socket.io-client (realtime) ─────────┐     │
└────────────────────────────────────────────────────────┼─────┘
                                                         │
┌────────────────────────────────────────────────────────┼─────┐
│                 APPLICATION TIER (Node.js + Express)    ▼     │
│                                                        ┌─────┐
│  REST Layer: /api/auth /api/canteens /api/menu          │ SIO │
│              /api/orders /api/notifications             └──┬──┘
│  Middleware: auth (JWT) → RBAC → validation (express-     │
│              validator) → controller                      │
│  Services:   orderService (split+tokens)                  │
│              notificationService (persist + emit)         │
└───────────────────────────────────────────────────────────┼───┘
                                                            │
┌───────────────────────────────────────────────────────────▼───┐
│                  DATA TIER (MongoDB via Mongoose)              │
│   users · canteens · menuitems · orders · notifications        │
└────────────────────────────────────────────────────────────────┘
```

**Key architectural rules**

1. **Business logic lives in services, not controllers** — controllers only parse/validate/respond.
2. **All authorization is server-side** (JWT + role checks); the client hides UI but never guards alone.
3. **Realtime is an add-on to REST** — every state change is written to MongoDB *first*, then emitted via Socket.io. The DB is the source of truth; sockets only push.
4. **One Socket.io room per canteen** (`canteen:<id>`) for owners, and one per user (`user:<id>`) for customers — keeps fan-out bounded.

## 2. Module Design

| Module | Responsibility | Key files (planned) |
|--------|----------------|---------------------|
| AUTH | Signup, login, JWT issuing, profile | `routes/auth.routes.js`, `controllers/auth.controller.js`, `middlewares/auth.js` |
| CN | Canteen CRUD (admin), open/close, listing | `routes/canteen.routes.js`, `controllers/canteen.controller.js` |
| MN | Menu item CRUD (owner), availability toggle | `routes/menu.routes.js`, `controllers/menu.controller.js` |
| SRCH | Cross-canteen item search | `controllers/search.controller.js` |
| CART | Client-side only (localStorage); no backend module | `client/src/context/CartContext.jsx` |
| ORD | Checkout splitting, token generation, status transitions | `services/orderService.js`, `controllers/order.controller.js` |
| OWN | Owner order feed, accept/reject, payment confirm | Reuses ORD endpoints + owner RBAC |
| NTF | Persist + emit notifications | `services/notificationService.js`, `sockets/index.js` |
| TRK | Order status read endpoints (realtime via NTF) | Reuses ORD endpoints |

### 2.1 Core Service: `orderService.placeOrder()`

Pseudocode of the heart of the system:

```
placeOrder(userId, cartItems[]):
  1. Group cart items by canteenId                → [ {canteen, items}, ... ]
  2. For each group:
     a. Validate canteen is open
     b. Re-fetch menu items from DB; validate availability
     c. Compute subtotal from CURRENT server prices
     d. Atomically allocate token:
        counter = counters.findOneAndUpdate(
           { canteenId, date: today }, { $inc: { seq: 1 } }, upsert: true )
        token = `${canteen.prefix}-${counter.seq}`
     e. Insert sub-order { groupId, userId, canteenId, items,
        total, token, status: "placed" }
     f. notificationService.notifyOwner(canteen.ownerId, subOrder)
  3. Return all sub-orders + groupId
```

Token uniqueness is guaranteed by the atomic `findOneAndUpdate` increment — no duplicate `A-12` even under concurrent checkouts.

## 3. Data Flow Diagrams

### Level 0 (Context diagram)

```
 Customer ──orders/search──► ┌──────────────┐ ──menus/tokens──► Customer
                             │ QuickCanteen │
 Owner ──status updates───► │    System    │ ──live orders───► Owner
                             └──────────────┘
 Admin ──canteen setup────►        ▲
                                   │
                             ┌─────┴─────┐
                             │  MongoDB  │
                             └───────────┘
```

### Level 1 (Order flow)

```
[Customer] --cart--> (P1: Validate & Split) --sub-orders--> (P2: Allocate Token) --order--> [D: orders]
                                                   │
                                                   ▼
                                     (P3: Notify Owner) --notification--> [D: notifications] --> [Owner]
                                                   │
[Owner] --status update--> (P4: Update Status) ────┘
                                   │
                                   ▼
                          (P5: Notify Customer) --> [Customer]
```

## 4. Sequence Diagram — Place Order (multi-canteen)

```
Client          API            orderService     MongoDB        Socket.io
  │  POST /orders │                  │              │              │
  ├──────────────►│ auth+validate    │              │              │
  │               ├─────────────────►│ group by canteen            │
  │               │                  ├─ validate items ─►│         │
  │               │                  ├─ $inc token counter ─►│     │
  │               │                  ├─ insert sub-orders ─►│      │
  │               │                  ├─ insert notifications ─►│    │
  │               │                  ├──────────────────────────────┼─► emit to canteen:A, canteen:C
  │ ◄──201 { groupId, A-12, C-05 }──┤              │              │
  │               │                  │              │      Owner A dashboard ◄─ new order
  │ ◄── socket: order.status=placed (to user room) ───────────────┤
```

## 5. Sequence Diagram — Status Update (Owner → Customer)

```
Owner            API            MongoDB      Socket.io      Customer
  │ PATCH /orders/:id {status:"ready"} │          │             │
  ├───────────────►│                   │          │             │
  │                ├─ validate owner + transition ─►│        │
  │                ├─ update + stamp readyAt ─►│    │             │
  │                ├─ insert notification ─►│     │             │
  │                ├──────────────────────────────┼─ emit user:<id> "order.updated"
  │ ◄─200 updated order ────────────────┤         │     ◄─ status pill → READY, token shown
```

## 6. State Machine — Sub-order

```
                ┌──────────┐  owner accepts   ┌───────────┐ owner starts cooking
 placed ───────►│ accepted │─────────────────►│ preparing │──────────────┐
                └──────────┘                  └───────────┘              ▼
      │                                                   ┌────────┐
      │ owner rejects (reason)                    ready ◄─┘
      ▼                                                   │ customer arrives,
 ┌──────────┐                                             ▼ owner confirms token+payment
 │ rejected │                                        ┌───────────┐
 └──────────┘                                        │ picked_up │  (final)
                                                     └───────────┘
```

Allowed transitions (enforced server-side, see FR-OWN-3):

| From | Allowed to |
|------|-----------|
| `placed` | `accepted`, `rejected` |
| `accepted` | `preparing`, `rejected` |
| `preparing` | `ready` |
| `ready` | `picked_up` |
| `rejected`, `picked_up` | — (final) |

*(In the UI, `accepted` and `preparing` may be merged into one "Preparing" step for simplicity; the DB keeps both for analytics.)*

## 7. Socket.io Event Design

| Event | Direction | Room/Payload | Purpose |
|-------|-----------|--------------|---------|
| `join` | client→server | `{ rooms: ["user:<id>", "canteen:<ownerCanteenId>"] }` | Join authorized rooms after login |
| `order:new` | server→owner room | sub-order object | Live order feed + sound |
| `order.updated` | server→user room | `{ orderId, status, token }` | Customer tracking |
| `notification` | server→user room | notification object | Bell badge updates |
| `canteen.status` | server→`public` | `{ canteenId, isOpen }` | Open/closed badge updates |

**Auth on sockets:** the client sends the JWT in the handshake; the server verifies before joining any room.

## 8. Security Design

- **AuthN:** JWT Bearer tokens (7-day expiry), bcrypt (10 rounds) password hashing
- **AuthZ:** middleware chain `requireAuth → requireRole('owner'|'admin')` on every protected route; owners scoped to `req.user.canteenId`
- **Input validation:** `express-validator` schemas on every route; Mongo query operators stripped
- **Rate limiting:** `express-rate-limit` on `/api/auth/*` (brute force) and `/api/orders` (spam orders)
- **CORS:** restricted to the frontend origin in production
- **Secrets:** `.env` only, never committed (see Doc 08)

## 9. Error Handling Design

| Case | Behavior |
|------|----------|
| Validation failure | 400 with `{ errors: [{field, msg}] }` |
| Auth missing/expired | 401 → client clears token, redirects to login |
| Role forbidden | 403 |
| Canteen closed / item sold out at checkout | 409 with per-item detail; client highlights affected cart entries |
| Unknown error | 500 + server log; client shows generic message |

## 10. Deployment View (summary — details in Doc 10)

- **Client:** static build on Vercel → talks to `api.<domain>`
- **API + sockets:** single Node service on Render/Railway
- **DB:** MongoDB Atlas M0 cluster
