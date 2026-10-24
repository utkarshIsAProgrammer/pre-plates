# 03 — Software Requirements Specification (SRS)

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
**Standard followed:** IEEE 830 (adapted)

---

## 1. Introduction

### 1.1 Purpose
Specify the functional and non-functional requirements of QuickCanteen, a canteen pre-order system for a college canteen hall containing multiple sub-canteens. This document is the single source of truth for *what* the system must do.

### 1.2 Scope
QuickCanteen lets customers browse menus of all sub-canteens, search items, place multi-canteen orders (split into per-canteen sub-orders), track them in realtime, and pick up food by token number — eliminating queue time. Owners manage menus and process orders on a realtime dashboard. Admins govern canteens and users.

### 1.3 Definitions & Acronyms
| Term | Meaning |
|------|---------|
| Sub-canteen | One food stall/counter inside the canteen hall, with its own owner and menu |
| Sub-order | One canteen's portion of a split checkout; has its own token and payment |
| Order group | The set of sub-orders created by a single checkout |
| Token | Per-canteen daily sequence number (e.g. `A-12`) used for pickup |
| MVP | Minimum Viable Product (v1 scope) |
| Owner | Canteen owner — manages one sub-canteen |

### 1.4 References
Project Charter (01), Feasibility Study (02), System Design (04), Database Design (05), API Spec (06).

## 2. Overall Description

### 2.1 Product Perspective
Standalone web application replacing the manual queue process. Responsive web (mobile-first) — no native apps in v1.

### 2.2 User Classes

| User Class | Capabilities |
|-----------|--------------|
| **Customer** (customer/teacher) | Browse, search, cart, order, track, view history, manage notifications, edit profile |
| **Owner** | Manage own canteen's menu & availability, process own sub-orders, mark payments, view own day's sales |
| **Admin** | Create/edit sub-canteens, assign owners, open/close canteens, manage user accounts |

### 2.3 Operating Environment
- **Client:** Any modern browser (Chrome/Edge/Firefox/Safari), phone or desktop
- **Server:** Node.js 20+, Express 4+, MongoDB 7+
- **Network:** College campus Wi-Fi / mobile data

### 2.4 Assumptions & Dependencies
- Every sub-canteen has a smartphone/laptop for the owner dashboard
- Canteens accept cash/UPI at counter (no gateway in v1)
- Users have a Google/email account for signup
- Socket.io connection available (WebSocket-friendly hosting)

## 3. Functional Requirements

Priority scale: **H** = must have (MVP), **M** = should have, **L** = nice to have.

### 3.1 Authentication & Accounts (Module: AUTH)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AUTH-1 | Users can sign up with name, email, password; role defaults to `customer` | H |
| FR-AUTH-2 | Users can log in with email + password and receive a JWT | H |
| FR-AUTH-3 | Passwords stored hashed (bcrypt); never returned by any API | H |
| FR-AUTH-4 | JWT expires after 7 days; expired tokens rejected with 401 | H |
| FR-AUTH-5 | Users can view/edit profile (name, phone, department) | M |
| FR-AUTH-6 | Admin can change a user's role or deactivate an account | M |
| FR-AUTH-7 | Logged-in users can log out (client discards token) | H |

### 3.2 Canteen Management (Module: CN)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CN-1 | Admin can create a sub-canteen (name, hall location, photo, timings) | H |
| FR-CN-2 | Admin can assign exactly one owner to a sub-canteen | H |
| FR-CN-3 | Admin can toggle a canteen **open/closed**; closed canteens hidden from browsing and reject new orders | H |
| FR-CN-4 | Owners can update their own canteen's photo/timings | M |
| FR-CN-5 | All customers can list canteens with open/closed status and avg prep time | H |

### 3.3 Menu Management (Module: MN)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-MN-1 | Owners can create menu items: name, description, price, category (breakfast/lunch/snacks/beverages), veg/non-veg, photo, prep time | H |
| FR-MN-2 | Owners can edit and delete their own items only (enforced server-side) | H |
| FR-MN-3 | Owners can toggle item availability ("Sold out today") in one click | H |
| FR-MN-4 | Sold-out items remain visible but cannot be added to cart | H |
| FR-MN-5 | Customers can view any open canteen's menu grouped by category | H |

### 3.4 Search & Browse (Module: SRCH)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-SRCH-1 | Customers can search items by name across **all** canteens; results show canteen, price, availability | H |
| FR-SRCH-2 | Search matches partial names, case-insensitive | H |
| FR-SRCH-3 | Customers can filter a menu by veg/non-veg and category | M |
| FR-SRCH-4 | Customers can sort menu items by price | M |

### 3.5 Cart & Ordering (Module: ORD)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-ORD-1 | Cart is client-side (persisted in localStorage), supports multiple canteens' items simultaneously | H |
| FR-ORD-2 | Cart groups items visually by canteen before checkout | H |
| FR-ORD-3 | Items can have a customer note (e.g. "extra spicy", max 100 chars) | M |
| FR-ORD-4 | Checkout of a multi-canteen cart creates **one sub-order per canteen**, linked by a shared `groupId` | H |
| FR-ORD-5 | Each sub-order gets a unique token: per-canteen daily counter, format `<PREFIX>-<n>` (e.g. `A-12`) resetting each day | H |
| FR-ORD-6 | Orders can only be placed while the canteen is open and items are available; server validates, not just the client | H |
| FR-ORD-7 | Prices/totals are computed **server-side** from current menu prices | H |
| FR-ORD-8 | Customer sees immediate confirmation with all tokens + estimated ready times | H |
| FR-ORD-9 | Customer can view order history (all sub-orders, filterable by status) | H |
| FR-ORD-10 | Customer can cancel a sub-order only while status = `placed` | M |
| FR-ORD-11 | Customer can reorder a past sub-order (items re-added to cart) | M |
| FR-ORD-12 | Each sub-order is paid **separately** at the counter (cash/UPI); owner marks it paid on pickup | H |

### 3.6 Owner Order Processing (Module: OWN)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-OWN-1 | Owner dashboard shows live feed of new sub-orders for their canteen only, with sound alert | H |
| FR-OWN-2 | Owner can accept or reject (with reason: sold out / closing / other) a sub-order | H |
| FR-OWN-3 | Status flow enforced: `placed → preparing → ready → picked_up`; invalid transitions rejected | H |
| FR-OWN-4 | Rejected orders notify the customer immediately with the reason | H |
| FR-OWN-5 | Owner marks sub-order "Paid & Picked Up" when handing over food (confirms token) | H |
| FR-OWN-6 | Owner sees today's sub-orders list and a simple revenue summary (count + total) | M |

### 3.7 Notifications (Module: NTF)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-NTF-1 | Customer is notified in-app when: order accepted, rejected, preparing, ready, picked up | H |
| FR-NTF-2 | Owner is notified in-app when a sub-order is placed in their canteen | H |
| FR-NTF-3 | Notification arrives via Socket.io in realtime when user is online | H |
| FR-NTF-4 | Offline notifications are persisted and shown on next login | H |
| FR-NTF-5 | Unread count badge on the bell icon; mark-all-read action | H |

### 3.8 Tracking & Pickup (Module: TRK)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-TRK-1 | Customer sees live status of each sub-order (Placed → Preparing → Ready → Picked Up) | H |
| FR-TRK-2 | Status changes push to the customer's screen in realtime | H |
| FR-TRK-3 | "Ready" screen displays the token prominently for counter pickup | H |
| FR-TRK-4 | Estimated ready time shown at confirmation, computed from item prep times | M |

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | **Performance** | API p95 response < 300 ms; order→owner notification < 2 s |
| NFR-2 | **Capacity** | Support 300 concurrent users and 100 orders/hour (college peak) |
| NFR-3 | **Security** | bcrypt password hashing; JWT auth on all private routes; role-based access control server-side; input validation on every endpoint; NoSQL injection protection |
| NFR-4 | **Privacy** | Store only name/email/phone/department; no payment data in v1 |
| NFR-5 | **Usability** | Order placement in ≤ 3 interactions from menu item; responsive down to 360 px width |
| NFR-6 | **Reliability** | Order creation is atomic per sub-order; token uniqueness guaranteed per canteen per day |
| NFR-7 | **Availability** | ≥ 99% during 8:00–18:00 college hours (free-tier hosting accepted) |
| NFR-8 | **Maintainability** | Layered backend (routes/controllers/services/models); ESLint enforced |
| NFR-9 | **Compatibility** | Latest 2 versions of major browsers; Android Chrome & iOS Safari |
| NFR-10 | **Auditability** | Every order retains createdAt and all status timestamps |

## 5. Use Cases

### UC-1: Place a multi-canteen order (primary use case)
**Actor:** Customer
1. Customer logs in and opens search, types "coffee"
2. Results show Coffee at Canteen A (₹15) and Canteen C (₹20)
3. Customer adds Canteen A's samosa, Canteen C's coffee + sandwich to the same cart
4. Cart view groups items under Canteen A and Canteen C with separate subtotals
5. Customer taps **Place Order**
6. System splits into sub-orders: `A-12` (₹20) and `C-05` (₹35); shows confirmation with both tokens
7. Owner A and Owner C each receive a realtime alert for their own sub-order only
8. Customer gets "Ready" notifications separately and pays each canteen at its counter

### UC-2: Process an order (Owner)
1. Alert sounds; new sub-order card appears with items, note, token
2. Owner taps **Accept** → customer notified; **Preparing** → customer notified
3. Food done → **Ready** → customer notified, token displayed on their screen
4. Customer arrives, says "A-12"; owner verifies and taps **Paid & Picked Up**

### UC-3: Manage menu (Owner)
1. Owner logs into dashboard → Menu tab → **Add item**
2. Fills name, price, category, veg flag, prep time, photo
3. At 2 PM, dosa batter runs out → owner toggles **Sold out** → item unorderable instantly

### UC-4: Govern canteens (Admin)
1. Admin logs in → Canteens → **Add canteen** ("Juice Corner", Hall B)
2. Assigns owner (existing user or invites by email)
3. Canteen appears on the customer landing page

### 5.1 Use Case Summary Table

| UC | Actor | Goal |
|----|-------|------|
| UC-1 | Customer | Order from multiple canteens in one cart |
| UC-2 | Owner | Process & hand over an order |
| UC-3 | Owner | Maintain live, accurate menu |
| UC-4 | Admin | Onboard/govern canteens & users |

## 6. Acceptance Criteria (MVP exit)

1. A user can register, browse all seeded canteens, and place a 2-canteen order in under 2 minutes
2. Both owners receive their sub-order alerts within 2 seconds, seeing only their own order
3. Owner status changes reflect on the customer screen in realtime without refresh
4. Token numbers are unique per canteen per day across 100+ test orders
5. No authenticated action is possible with a mismatched role (verified by test cases in Doc 09)
6. App is usable on a 360 px-wide phone viewport

## 7. Future Requirements (Phase 2+, out of MVP)

- Online payment (Razorpay) per sub-order; refund-on-reject
- Ratings & reviews per item
- Advance ordering with pickup time slots
- Email/SMS/Push notifications
- Admin analytics (popular items, peak-hour heatmap)
- QR-code pickup verification
