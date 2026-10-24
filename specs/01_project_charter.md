# 01 — Project Charter

**Project:** QuickCanteen — Canteen Pre-Order System
**Version:** 1.0 | **Date:** 2026-09-21 | **Status:** Approved

---

## 1. Problem Statement

During lunch hours, customers and teachers spend **10–20+ minutes standing in queues** at sub-canteens inside the college canteen hall. This causes:

- Wasted break time and academic schedule overruns
- Crowding and rush at counters, especially peak-hour
- No visibility into what each sub-canteen sells until you physically walk there
- Canteen owners have no advance signal of demand — orders arrive as a sudden wave

## 2. Proposed Solution

A web application where:

1. Every sub-canteen in the hall has its **own digital menu** in one central place
2. Users browse, search, and **pre-order** items from one or many sub-canteens in a single cart
3. A single checkout is **automatically split into per-canteen sub-orders**
4. Each canteen owner sees only their own incoming orders in a **realtime dashboard** and prepares food in advance
5. Users are **notified in-app** when food is ready and pick it up using a **token number** — no queue

## 3. Objectives

| #   | Objective                         | Measurable Target                                             |
| --- | --------------------------------- | ------------------------------------------------------------- |
| O1  | Reduce customer wait time         | Avg. counter time < 1 minute (order already prepared)         |
| O2  | Digitize all sub-canteen menus    | 100% of sub-canteens listed with live menus                   |
| O3  | Give owners advance demand signal | Order reaches owner's dashboard within 2 seconds of placement |
| O4  | Smooth multi-canteen ordering     | One cart → N sub-orders with separate tokens & payments       |
| O5  | Complete order lifecycle tracking | Placed → Preparing → Ready → Picked Up, visible to user       |

## 4. Scope

### In Scope (v1 — Core MVP)

- JWT authentication with 3 roles: **customer, canteen owner, admin**
- Admin manages sub-canteens and assigns owners
- Owners manage their menu (items, prices, categories, veg/non-veg, availability)
- Browsing, per-canteen menus, global item search across canteens
- Multi-canteen cart → split checkout → per-canteen sub-orders with tokens
- Realtime owner dashboard (accept, preparing, ready) + in-app notifications
- Token-number based pickup; cash/UPI payment at counter per canteen
- Order history

### Out of Scope (v1)

- Online payment gateway (Phase 2: Razorpay)
- QR-code pickup verification (Phase 3)
- Ratings/reviews, wallet, loyalty points, advance scheduling, analytics
- Native mobile apps (responsive web only)

## 5. Stakeholders

| Stakeholder            | Role in Project                               |
| ---------------------- | --------------------------------------------- |
| Customers & teachers    | Primary users (customers)                     |
| Sub-canteen owners     | Secondary users; provide menu data & feedback |
| College administration | Approves rollout; acts as admin               |
| Development team       | Builds and maintains the system               |

## 6. Success Metrics

- ≥ 60% of lunch-hour orders in a pilot sub-canteen placed via the app after 2 weeks
- Order → owner notification latency < 2 seconds (Socket.io)
- Zero token collisions (duplicate token numbers per canteen per day)
- Customer rating of "queue avoided" experience ≥ 4/5 in a survey of 50 users

## 7. High-Level Milestones (4 weeks)

| Week | Milestone              | Deliverable                                                     |
| ---- | ---------------------- | --------------------------------------------------------------- |
| 1    | Foundation             | Auth + roles working; admin can create canteens & assign owners |
| 2    | Menus & Cart           | Menu CRUD; browse/search UI; multi-canteen cart                 |
| 3    | Ordering Core          | Split checkout, tokens, owner dashboard, Socket.io realtime     |
| 4    | Notifications & Polish | Notification center, order tracking, testing, deployment        |

## 8. Team & Roles

| Role                  | Responsibility                        |
| --------------------- | ------------------------------------- |
| Project lead          | Planning, SRS ownership, reviews      |
| Backend developer(s)  | Express APIs, MongoDB, Socket.io      |
| Frontend developer(s) | React UI, cart, dashboards            |
| Tester(s)             | Test plan execution, UAT coordination |

_(Map actual team members here.)_

## 9. Budget

₹0 — all infrastructure on free tiers (MongoDB Atlas, Render/Railway, Vercel). See Feasibility Study.

## 10. Approval

| Name | Role          | Signature | Date |
| ---- | ------------- | --------- | ---- |
|      | Project Guide |           |      |
|      | Project Lead  |           |      |
