# 06 — API Specification

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Base URL: `/api` · Auth: `Authorization: Bearer <JWT>` on protected routes · Content type: JSON.

**Conventions**
- Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`
- Status codes: 200 OK · 201 Created · 400 validation · 401 unauthenticated · 403 wrong role · 404 not found · 409 conflict (closed/sold out/duplicate)
- List endpoints support `?page=1&limit=20` and return `{ data, page, total }`
- All authorization is enforced server-side; roles shown per endpoint

---

## 1. Auth — `/api/auth`

| Method | Path | Role | Body | Response |
|--------|------|------|------|----------|
| POST | `/register` | public | `{name, email, password}` | 201 `{token, user}` |
| POST | `/login` | public | `{email, password}` | 200 `{token, user}` |
| GET | `/me` | any logged-in | — | 200 `{user}` |
| PATCH | `/me` | any logged-in | `{name?, phone?, department?}` | 200 `{user}` |

## 2. Users (Admin) — `/api/users`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | admin | List users (search, filter by role) |
| PATCH | `/:id/role` | admin | `{role}` — change role |
| PATCH | `/:id/status` | admin | `{isActive}` — activate/deactivate |

## 3. Canteens — `/api/canteens`

| Method | Path | Role | Body / Query | Response |
|--------|------|------|--------------|----------|
| GET | `/` | public | `?open=true` | List with `isOpen`, `avgPrepMinutes`, item count |
| GET | `/:id` | public | — | 200 canteen + menu summary |
| POST | `/` | admin | `{name, prefix, hall, ownerId, openTime, closeTime}` | 201 |
| PATCH | `/:id` | admin | any canteen field | 200 |
| PATCH | `/:id/open-status` | admin, owner(own) | `{isOpen}` | 200 |
| DELETE | `/:id` | admin | — | 200 (soft: `isOpen=false` + unassign) |

## 4. Menu Items — `/api/menu`

| Method | Path | Role | Body / Query | Response |
|--------|------|------|--------------|----------|
| GET | `/canteen/:canteenId` | public | `?category=&veg=&sort=price` | Grouped menu |
| GET | `/:id` | public | — | 200 item |
| POST | `/` | owner(own canteen) | `{name, price, category, isVeg, description?, imageUrl?, prepMinutes?}` | 201 |
| PATCH | `/:id` | owner(own item) | any editable field | 200 |
| PATCH | `/:id/availability` | owner(own item) | `{isAvailable}` | 200 — the "sold out" toggle |
| DELETE | `/:id` | owner(own item), admin | — | 200 |

## 5. Search — `/api/search`

| Method | Path | Role | Query | Response |
|--------|------|------|-------|----------|
| GET | `/items` | public | `?q=samosa&veg=&maxPrice=` | 200 `[{item, canteen:{id,name,isOpen}, price, isAvailable}]` — cross-canteen results |

## 6. Orders — `/api/orders`

### 6.1 Place order (split checkout)
```
POST /orders          Role: customer (or any logged-in user)
Body: { items: [{ menuItemId, qty, note? }, ...] }   // mixed canteens allowed

201 Response:
{
  "groupId": "g1",
  "orders": [
    { "_id":"o1", "canteen":{"id":"c1","name":"South Indian Corner"},
      "token":"A-12", "total":40, "status":"placed",
      "estimatedReadyAt":"2026-09-21T12:11:00Z" },
    { "_id":"o2", "canteen":{"id":"c3","name":"Juice Corner"},
      "token":"C-05", "total":70, "status":"placed", ... }
  ]
}

409 Response (partial failure — nothing is created for failed canteens):
{ "error": { "code": "ORDER_CONFLICT",
  "details": [ {"menuItemId":"m9","reason":"sold_out"} ] } }
```

Server behavior: group by canteen → validate open/availability → price from DB → atomic token per canteen → insert sub-orders (shared `groupId`) → notify owners.

### 6.2 Read & manage

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/mine` | customer | Own orders, `?status=&groupId=` |
| GET | `/group/:groupId` | customer(own group) | All sub-orders of one checkout |
| GET | `/canteen/:canteenId` | owner(own) | Live feed, `?status=&date=today` |
| GET | `/:id` | customer(own), owner(own canteen), admin | Single order |
| PATCH | `/:id/status` | owner(own) | `{status, rejectReason?}` — validates transition (Doc 04 §6) |
| PATCH | `/:id/payment` | owner(own) | `{paymentStatus:"paid"}` — at pickup |
| PATCH | `/:id/cancel` | customer(own) | Only while `status=placed` |
| POST | `/:id/reorder` | customer(own) | Re-adds items to cart client-side suggestion; returns items |

### 6.3 Owner summary
| Method | Path | Role | Response |
|--------|------|------|----------|
| GET | `/canteen/:canteenId/summary?date=today` | owner(own) | `{orders, revenue, byStatus:{...}}` |

## 7. Notifications — `/api/notifications`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | any logged-in | Own notifications, newest first, `?unread=true` |
| GET | `/unread-count` | any logged-in | `{count}` |
| PATCH | `/read-all` | any logged-in | Mark all read |
| PATCH | `/:id/read` | any logged-in(own) | Mark one read |

## 8. Socket.io Events

**Handshake:** client connects with `auth: { token: <JWT> }`; server verifies and auto-joins `user:<userId>` plus `canteen:<ownerCanteenId>` if owner.

| Event | Emitted to | Payload | When |
|-------|-----------|---------|------|
| `order:new` | `canteen:<id>` | sub-order (populated) | Customer checkout |
| `order.updated` | `user:<id>` | `{orderId, groupId, status, token, rejectReason?}` | Owner status change |
| `notification` | `user:<id>` | notification object | Any persisted notification |
| `canteen.status` | broadcast | `{canteenId, isOpen}` | Admin/owner toggles open state |

Client→server: none — all mutations go through REST (single write path, sockets are read-only push). 

## 9. Validation Rules (summary)

| Field | Rule |
|-------|------|
| `email` | RFC-ish regex, lowercase |
| `password` | min 8 chars, 1 letter + 1 number |
| `price` | integer ≥ 0, ≤ 10000 |
| `qty` | integer 1–20 |
| `note` | ≤ 100 chars, sanitized |
| `status` | must be in allowed-transition map |
| `prefix` | `/^[A-Z]{1,2}$/`, unique |
