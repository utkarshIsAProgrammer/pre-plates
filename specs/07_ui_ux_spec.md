# 07 — UI/UX Specification

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Mobile-first responsive web. Stack: React + Tailwind CSS.

---

## 1. Design Principles

1. **3-tap order** — from seeing an item to placing it in ≤ 3 interactions
2. **Glanceable status** — order state readable from 1 meter (big tokens, color pills)
3. **Canteen-first mental model** — users think "where do I eat", so canteens are top-level, not buried in filters
4. **Owner = big targets** — dashboard buttons are thumb-sized; no typing needed during rush

## 2. Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | Orange `#F97316` | CTAs, active states (food-app warmth) |
| Secondary | Emerald `#10B981` | Veg indicators, "open" status |
| Danger | Red `#EF4444` | Sold out, closed, reject |
| Info | Blue `#3B82F6` | Links, "preparing" |
| Neutral | Slate scale | Text, backgrounds |
| Font | Inter / system stack | Headings semibold, body regular |
| Radius | `rounded-xl` cards, `rounded-full` pills | |
| Spacing | 4px grid | |
| Breakpoints | base (mobile) → `md` 768 → `lg` 1024 | Mobile: bottom nav; Desktop: sidebar/top nav |

**Status pill colors:** Placed = slate · Preparing = blue · Ready = green (+pulse) · Picked = neutral · Rejected = red

## 3. Screens — Customer

### S1 · Home / Canteen List (entry)
```
┌─────────────────────────────┐
│ QuickCanteen      🔔(3)  👤 │
│ [🔍 Search "samosa..."    ] │  ← global search, opens S2
│                             │
│ OPEN NOW                    │
│ ┌─────────┐ ┌─────────┐     │
│ │ 🍛 South │ │ 🥤 Juice │    │  ← cards: photo, name, hall,
│ │ Indian   │ │ Corner   │    │     "~8 min", green OPEN badge
│ │ ~8 min ● │ │ ~3 min ● │    │
│ └─────────┘ └─────────┘     │
│ CLOSED                      │
│ ┌─────────┐                 │  ← grayed, non-clickable order
│ │ 🥪 Deli  │                 │
│ └─────────┘                 │
│ [🏠][🛒(2)][📦][👤]          │  ← bottom nav (mobile)
└─────────────────────────────┘
```

### S2 · Search Results
- Type ≥ 2 chars → debounced results grouped by canteen
- Row: item photo, name, price, canteen name, availability
- Sold-out rows dimmed with "Sold out" tag; Add button hidden

### S3 · Canteen Menu
```
┌─────────────────────────────┐
│ ← South Indian Corner   ●   │  ← open/closed dot
│ Hall B · ~8 min · 4.2★(v2)  │
│ [Breakfast][Lunch][Snacks]  │  ← category chips
│ Veg only ○   Sort: Price ▾  │
│ ┌─────────────────────────┐ │
│ │ 🥞 Masala Dosa     ₹40  │ │
│ │ Crispy, 2 chutneys      │ │
│ │ [＋ Add]      veg 🟢     │ │
│ └─────────────────────────┘ │
│ …                           │
│ [🛒 View Cart · 2 · ₹75]    │  ← sticky bar appears when cart > 0
└─────────────────────────────┘
```

### S4 · Cart
- Items **grouped under canteen headings** with per-canteen subtotal (the split preview)
- Qty steppers, note field (≤100 chars) per line, per-line remove
- Sticky **Place Order** button with grand total
- If a canteen closed since adding → inline warning, can't place that group

### S5 · Order Confirmation
- Success animation + **all tokens in big type**: `A-12` · `C-05`
- Per sub-order: canteen, items, total, **estimated ready time**
- "Pay at each counter" hint text
- CTA: Track Orders → S6

### S6 · Order Tracking (live)
```
┌─────────────────────────────┐
│ My Orders          🔔       │
│ ┌─────────────────────────┐ │
│ │ A-12  South Indian      │ │
│ │ ●●●●○  READY ✨         │ │  ← 5-dot progress, green pulse
│ │ ₹40 · ready 12:09       │ │
│ │ [Show at counter]       │ │  ← opens token fullscreen
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ C-05  Juice Corner      │ │
│ │ ●●○○○  PREPARING        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```
- Realtime updates via `order.updated` socket — no refresh
- Token fullscreen: giant `A-12` + canteen name (readable at a counter)

### S7 · Profile — name, dept, phone; order history link; logout

## 4. Screens — Owner Dashboard

### S8 · Live Orders (default screen)
```
┌───────────────────────────────────────────┐
│ South Indian Corner · OPEN ●  [toggle]    │
│ NEW (2)              PREPARING (3)   READY│
│ ┌──────────────────────┐                  │
│ │ A-12 · just now 🔔   │  ← sound on new  │
│ │ 1× Masala Dosa       │                  │
│ │   note: extra chutney│                  │
│ │ ₹40 · Asha (CSE)     │                  │
│ │ [Accept] [Reject]    │                  │
│ └──────────────────────┘                  │
│ TODAY: 23 orders · ₹1,240                 │
└───────────────────────────────────────────┘
```
- Columns/cards per status; **Accept → Preparing → Ready → Paid & Picked** as single big buttons
- Reject opens reason picker (sold out / closing / other)
- New order: sound + card slides in (socket `order:new`)

### S9 · Menu Manager
- Table of items: photo, name, price, category, prep time, **availability switch**, edit, delete
- Add/edit modal with validation per Doc 06 §9

### S10 · Day Summary — orders count, revenue, by-status counts (today)

## 5. Screens — Admin Panel

### S11 · Canteens — table + create/edit form (name, prefix, hall, timings, **owner picker**), open/close toggle
### S12 · Users — table, role dropdown, activate/deactivate

## 6. Key User Flows

```
FLOW 1 — Order (happy path)
Login → S1 → search/tap canteen → S3 add items → S4 → Place → S5 tokens → S6 live tracking → pickup

FLOW 2 — Owner processes
S8 alert → Accept → Preparing → Ready ──(customer arrives, says token)──► Paid & Picked

FLOW 3 — Admin onboards canteen
S11 → Add → pick owner → save → canteen live on S1
```

## 7. Interaction & Edge Cases

| Case | UX Behavior |
|------|-------------|
| Socket disconnects | Banner "Reconnecting…"; on reconnect refetch current view |
| Item sold out while in cart | 409 at checkout → highlight item, offer remove |
| Canteen closes while cart has items | Cart group flagged, checkout blocked for it |
| Order rejected | Red notification with reason; order moves to Rejected in history |
| Empty states | Friendly illustration + CTA ("No orders yet — browse menus") |
| Loading | Skeletons, not spinners |
| Errors | Toast, non-blocking |

## 8. Accessibility

- Color is never the only signal (pills have text labels)
- 44px min touch targets; visible focus rings
- Alt text on food images; `aria-live` for status changes
