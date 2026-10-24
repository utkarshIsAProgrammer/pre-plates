# 08 — Coding Standards

**Project:** QuickCanteen | **Version:** 1.0 | **Date:** 2026-09-21
Goal: consistent, reviewable code across the team.

---

## 1. Repository Structure

```
quickcanteen/
├── client/                  # React + Vite
│   ├── src/
│   │   ├── api/             # axios instance + endpoint modules
│   │   ├── components/      # shared UI (Button, Modal, StatusPill…)
│   │   ├── context/         # AuthContext, CartContext, SocketContext
│   │   ├── pages/           # one folder per route (customer/ owner/ admin/)
│   │   ├── hooks/           # useOrders, useNotifications…
│   │   └── utils/
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # *.routes.js (thin)
│   │   ├── controllers/     # *.controller.js (parse/validate/respond)
│   │   ├── services/        # business logic (orderService, notificationService)
│   │   ├── middlewares/     # auth.js, rbac.js, validate.js, errorHandler.js
│   │   ├── sockets/         # index.js, auth.js
│   │   ├── validators/      # express-validator chains
│   │   └── utils/           # tokenCounter.js, logger.js
│   └── .env.example
└── specs/                   # this documentation package
```

## 2. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files (server) | kebab-case by role | `order.service.js`, `order.controller.js` |
| Files (client components) | PascalCase | `StatusPill.jsx` |
| React hooks | `use` prefix | `useCart()` |
| Variables/functions | camelCase | `getTodayOrders` |
| Constants | SCREAMING_SNAKE | `MAX_QTY = 20` |
| DB collections | lowercase plural | `menuitems` |
| API paths | lowercase, plural nouns, no verbs | `POST /orders` (never `/createOrder`) |
| Env vars | SCREAMING_SNAKE | `JWT_SECRET` |

## 3. Git Conventions

- Branch names: `feat/order-splitting`, `fix/token-duplicate`, `chore/eslint`
- Commits — [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: split checkout into per-canteen sub-orders`
  - `fix: prevent duplicate tokens under concurrent checkout`
  - `docs: update API spec for payment endpoint`
- Never commit: `.env`, `node_modules`, build output
- PRs reference the requirement ID they implement (e.g. "implements FR-ORD-4")

## 4. JavaScript / React Rules

- **ESLint + Prettier** enforced; no unused vars; `const` by default
- Async/await over `.then()` chains; every `await` inside `try/catch` (or Express error middleware)
- Server: **no business logic in controllers** — delegate to services
- Client: components < 200 lines; extract when bigger
- No inline styles — Tailwind classes only
- All user-facing strings from a constants file (easy to polish later)

## 5. Security Practices (mandatory in every PR)

1. Never trust client input — validate with express-validator / zod
2. Never return `passwordHash` (schema `select: false`)
3. Owner routes must filter by `req.user.canteenId` — never by client-supplied canteenId
4. Prices/totals computed server-side only (FR-ORD-7)
5. Sanitize strings that render as HTML (React escapes by default — don't bypass with `dangerouslySetInnerHTML`)
6. Rate-limit auth + order routes
7. Secrets from `process.env` only; `.env.example` documents keys with empty values

## 6. Error Handling Pattern

```js
// controller
const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id, req.user);
    res.json({ data: order });
  } catch (err) { next(err); }
};

// error middleware maps service errors → Doc 06 §1 codes
```

## 7. Definition of Done (per feature)

- [ ] Implements the SRS requirement ID(s)
- [ ] Validation + RBAC on server side
- [ ] Handles loading / error / empty states in UI
- [ ] ESLint clean, no console.logs left
- [ ] Tested manually per Doc 09 cases covering it
