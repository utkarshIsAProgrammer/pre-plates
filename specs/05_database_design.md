# 05 — Database Design

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Database: **MongoDB** (Atlas) with **Mongoose** ODM.

---

## 1. ER Overview

```
 users 1───* orders *───1 canteens 1───* menuItems
   │              │              │ 1
   │              │              └────1 users (owner)
   │              │
   └──────────────┴───* notifications (per user, references orderId)
```

- One **user** places many **orders**; each order belongs to one **canteen**
- One **canteen** has many **menuItems** and exactly one **owner** (a user with role `owner`)
- One checkout produces several orders sharing the same `groupId` (logical link, no separate collection needed)
- **notifications** reference the user and optionally an order

## 2. Collections

### 2.1 `users`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | auto | |
| `name` | String | required, trim | |
| `email` | String | required, unique, lowercase | login identifier |
| `passwordHash` | String | required | bcrypt hash, `select: false` |
| `role` | String | enum: `customer`, `owner`, `admin`; default `customer` | |
| `phone` | String | optional | |
| `department` | String | optional | e.g. "CSE 3rd Year" |
| `isActive` | Boolean | default `true` | admin deactivation |
| `timestamps` | — | createdAt, updatedAt | auto |

### 2.2 `canteens`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | auto | |
| `name` | String | required | e.g. "South Indian Corner" |
| `prefix` | String | required, unique, 1–2 chars uppercase | token prefix: `A`, `JU` |
| `hall` | String | required | location in canteen hall |
| `ownerId` | ObjectId → users | required, unique | one owner per canteen |
| `photoUrl` | String | — | |
| `isOpen` | Boolean | default `true` | master switch |
| `openTime` / `closeTime` | String | "HH:mm" | display + order-window checks |
| `avgPrepMinutes` | Number | default 10 | shown on landing page |
| `timestamps` | — | auto | |

### 2.3 `menuitems`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | auto | |
| `canteenId` | ObjectId → canteens | required, indexed | |
| `name` | String | required | |
| `description` | String | — | |
| `price` | Number | required, min 0, integer (paise avoided — college pricing is whole rupees) | |
| `category` | String | enum: `breakfast`, `lunch`, `snacks`, `beverages` | |
| `isVeg` | Boolean | required | |
| `imageUrl` | String | — | |
| `prepMinutes` | Number | default 5 | used for ETA |
| `isAvailable` | Boolean | default `true` | "Sold out today" toggle |
| `timestamps` | — | auto | |

### 2.4 `orders`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | auto | |
| `groupId` | ObjectId | required, indexed | links sub-orders of one checkout |
| `userId` | ObjectId → users | required, indexed | |
| `canteenId` | ObjectId → canteens | required, indexed | |
| `items` | Array | required | embedded (see below) |
| `items[].menuItemId` | ObjectId → menuitems | — | historical reference |
| `items[].name` | String | — | **snapshot** — menu rename doesn't corrupt history |
| `items[].price` | Number | — | **snapshot** at order time |
| `items[].qty` | Number | min 1 | |
| `items[].note` | String | max 100 | e.g. "less spicy" |
| `total` | Number | required | computed server-side |
| `token` | String | required | e.g. `A-12` |
| `tokenSeq` | Number | — | numeric part, for sorting |
| `status` | String | enum: `placed`, `accepted`, `preparing`, `ready`, `picked_up`, `rejected`; default `placed` | |
| `rejectReason` | String | — | only when rejected |
| `paymentStatus` | String | enum: `pending`, `paid`; default `pending` | cash/UPI at counter |
| `statusHistory` | Array of `{status, at}` | — | audit trail |
| `timestamps` | — | createdAt ≈ placedAt | |

> **Design note — embedding items:** order line items are embedded (not referenced) because they are always read with the order, never queried independently, and must snapshot name/price at purchase time. Classic embedding use-case.

### 2.5 `notifications`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | auto | |
| `userId` | ObjectId → users | required, indexed | recipient |
| `orderId` | ObjectId → orders | optional | deep-link target |
| `title` | String | required | e.g. "Order Ready" |
| `message` | String | required | "Token A-12 is ready at South Indian Corner" |
| `type` | String | enum: `order`, `system` | |
| `isRead` | Boolean | default `false` | |
| `createdAt` | Date | auto | |

### 2.6 `counters` (supporting collection — token allocation)

| Field | Type | Notes |
|-------|------|-------|
| `canteenId` | ObjectId | **compound unique index with `date`** |
| `date` | String | "YYYY-MM-DD" |
| `seq` | Number | current token sequence |

## 3. Indexes

| Collection | Index | Why |
|-----------|-------|-----|
| `users` | `{ email: 1 }` unique | login lookup |
| `canteens` | `{ ownerId: 1 }` unique | owner → canteen |
| `canteens` | `{ prefix: 1 }` unique | token prefix uniqueness |
| `menuitems` | `{ canteenId: 1, category: 1 }` | menu page queries |
| `menuitems` | `{ name: "text", description: "text" }` | global search |
| `orders` | `{ userId: 1, createdAt: -1 }` | order history |
| `orders` | `{ canteenId: 1, createdAt: -1 }` | owner dashboard |
| `orders` | `{ groupId: 1 }` | group lookups |
| `orders` | `{ canteenId: 1, tokenSeq: -1 }` | today's tokens |
| `notifications` | `{ userId: 1, isRead: 1, createdAt: -1 }` | bell dropdown |
| `counters` | `{ canteenId: 1, date: 1 }` unique | atomic token allocation |

## 4. Sample Documents

```js
// users
{ _id: "u1", name: "Asha R", email: "asha@college.edu", role: "customer",
  department: "CSE 3rd Year", isActive: true }

// canteens
{ _id: "c1", name: "South Indian Corner", prefix: "A", hall: "Hall B, Counter 2",
  ownerId: "u2", isOpen: true, openTime: "08:00", closeTime: "17:00", avgPrepMinutes: 8 }

// menuitems
{ _id: "m1", canteenId: "c1", name: "Masala Dosa", price: 40, category: "breakfast",
  isVeg: true, prepMinutes: 7, isAvailable: true }

// orders — two sub-orders from ONE checkout (same groupId)
{ _id: "o1", groupId: "g1", userId: "u1", canteenId: "c1",
  items: [{ menuItemId: "m1", name: "Masala Dosa", price: 40, qty: 1, note: "extra chutney" }],
  total: 40, token: "A-12", tokenSeq: 12, status: "ready", paymentStatus: "pending",
  statusHistory: [
    { status: "placed",    at: "2026-09-21T12:02:11Z" },
    { status: "accepted",  at: "2026-09-21T12:02:40Z" },
    { status: "preparing", at: "2026-09-21T12:03:02Z" },
    { status: "ready",     at: "2026-09-21T12:09:45Z" }] }

{ _id: "o2", groupId: "g1", userId: "u1", canteenId: "c3",
  items: [{ menuItemId: "m9", name: "Cold Coffee", price: 35, qty: 2 }],
  total: 70, token: "C-05", tokenSeq: 5, status: "placed", paymentStatus: "pending" }

// notifications
{ _id: "n1", userId: "u1", orderId: "o1", type: "order",
  title: "Order Ready", message: "Token A-12 is ready at South Indian Corner", isRead: false }

// counters
{ canteenId: "c1", date: "2026-09-21", seq: 12 }
```

## 5. Data Lifecycle & Housekeeping

- **Order retention:** kept indefinitely (small volume; useful for Phase 2 analytics)
- **Notifications:** TTL index `{ createdAt: 1 }, { expireAfterSeconds: 2592000 }` — auto-delete after 30 days
- **Counters:** old dates can be purged by a weekly cleanup (or left; negligible size)
- **User deletion:** remove user doc; orders retained (historical/financial record, user id kept for referential integrity)

## 6. Schema Choice Rationale

| Decision | Rationale |
|----------|-----------|
| Embed order items | Read-together + price snapshot semantics |
| Per-canteen token via `counters` | Atomic `$inc` prevents duplicates under concurrency |
| Separate `notifications` collection | Persisted offline delivery (SRS FR-NTF-4) + TTL cleanup |
| `statusHistory` embedded | Full audit without joins; small bounded size (≤6 entries) |
| Snapshot name/price in orders | Menu edits must never mutate purchase history |
