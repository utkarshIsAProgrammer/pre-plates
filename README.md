# 🍽️ PrePlates — Smart Campus Dining & Pre-Ordering System

<div align="center">

```
    ____             ____  __      __           
   / __ \________   / __ \/ /___ _/ /____  _____
  / /_/ / ___/ _ \ / /_/ / / __ `/ __/ _ \/ ___/
 / ____/ /  /  __// ____/ / /_/ / /_/  __(__  ) 
/_/   /_/   \___//_/   /_/\__,_/\__/\___/____/  
                                                
   Campus dining, pre-ordered. Zero queues. Pure efficiency.
```

[![React](https://img.shields.io/badge/React-19.0+-20232a.svg?style=for-the-badge&logo=react&logoColor=61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0+-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash_REST-DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline_Shell-5A0FC8.svg?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Web Push](https://img.shields.io/badge/Notifications-Web_Push_VAPID-FF6B6B.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

[Overview](#-overview) • [How It Works](#-how-it-works) • [Architecture](#-system-architecture) • [Features](#-key-features) • [Quickstart](#-quickstart) • [Smoke Tests](#-smoke-tests) • [API Directory](#-api-routes) • [Deployment](#-deployment-render)

</div>

---

## 🥪 Overview

College cafeterias during peak lunch hours face severe queue congestion, delayed orders, and overwhelmed kitchen staff. Students spend 20–30 minutes waiting in line, often missing classes or meals.

**PrePlates** transforms campus dining into a zero-queue, pre-order ecosystem:
- **Students** browse menus from their classroom or hostel, place customized food orders, pay via amount-locked dynamic UPI QR codes or cash on delivery, and track live status.
- **Vendors** manage orders in real-time through an interactive kitchen dashboard equipped with audio alerts, step-by-step state transitions, inventory toggles, and daily revenue statistics.
- **Tokens** are minted atomically per canteen per day (`#001`, `#002`), ensuring dispute-free, rapid food collection at pickup counters.

---

## ⚡ How It Works

```
 1. Student Browses & Orders ───────► Selects canteen, customizes cart, selects payment mode
                                                  │
 2. Dynamic Payment Clearance                     ▼
    (Amount-locked UPI QR or Cash)     UPI deep-link locks exact order amount; student submits UTR
                                                  │
 3. Atomic Token Generation                       ▼
    (Mongoose Counter Sequence)       Daily sequence token generated (e.g. #042); Token slip issued
                                                  │
 4. Vendor Kitchen Dispatch                       ▼
    (Web Audio Chime + Live Queue)     Kitchen accepts order: PENDING ➔ VERIFIED ➔ PREPARING
                                                  │
 5. Instant Web Push Ready Alert                  ▼
    (VAPID Browser Push Notification)  Order marked READY; push alert triggers on student device:
                                       "Token #042 is ready for pickup at Main Canteen Counter!"
```

---

## ✨ Key Features

### 🎓 Student Mobile Experience
- **Canteen Marketplace**: Multi-canteen directory with real-time open/closed status indicators and distance/location data.
- **Digital Interactive Menus**: Dietary tagging (100% Veg Dot / Non-Veg signals), category filtering, real-time availability badges, and live cart adjustments.
- **Dynamic UPI Payment Gateway**: Generates amount-locked UPI deep links (`upi://pay?pa=...&am=...`) and dynamic QR codes with 12-digit UTR verification and payment status indicators.
- **Digital Token Slip**: High-contrast, clean token slip with order summary, timestamp, token number, and live status progress ring.
- **Native Web Push Notifications**: Service worker-driven VAPID notifications alert students when food is ready for pickup, even if their browser tab is closed.

### 🍳 Vendor Kitchen Operations
- **Live Order Board**: Real-time incoming queue organized by fulfillment stages (`pending`, `verified`, `preparing`, `ready`, `completed`, `cancelled`).
- **Web Audio Alert Synthesis**: Low-latency synthesized chimes via the browser Web Audio API alert kitchen staff to incoming orders without external audio assets.
- **Menu & Price Manager**: One-click in-stock/out-of-stock toggles, price updates, and item photo uploads via Cloudinary CDN.
- **Daily Performance Metrics**: Real-time breakdown of daily order volume, revenue totals, and average prep durations.

### 🛡️ Production-Grade Engineering & Infrastructure
- **Campus-NAT Safe Rate Limiting**: Traditional IP-based rate limiting fails on campus Wi-Fi where hundreds of students share a single gateway IP. PrePlates keys rate limits to Clerk user identities, falling back to IP only for anonymous traffic.
- **Upstash Redis Caching & Rate Limiting**: Ultra-fast REST-based caching with automatic cache invalidation on menu updates. Gracefully degrades to in-memory store if Redis credentials are not configured.
- **Atomic Sequential Token Minting**: Eliminates race conditions in token numbers using atomic MongoDB `$inc` sequences scoped per day and canteen.
- **Offline PWA Shell**: CacheFirst strategy for immutable static assets and NetworkFirst for API data with an ambient connection loss warning banner.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Student & Vendor Devices                 │
│         React 19 SPA + PWA Service Worker + Web Push        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             PrePlates Backend (Node + Express 5)            │
│                                                             │
│  ┌─────────────────────────┐     ┌───────────────────────┐  │
│  │ Clerk Auth Middleware   │ ◄─► │ Upstash Redis Store   │  │
│  │ (User-keyed Rate Limit) │     │ (Cache + Rate Limits) │  │
│  └────────────┬────────────┘     └───────────────────────┘  │
│               │                                             │
│               ▼                                             │
│  ┌─────────────────────────┐     ┌───────────────────────┐  │
│  │ Order & Token Engine    │ ◄─► │ Web Push Service      │  │
│  │ (Atomic Sequences)      │     │ (VAPID Notifications) │  │
│  └────────────┬────────────┘     └───────────────────────┘  │
└───────────────┼──────────────────────────────┬──────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Atlas           │ │       Cloudinary CDN       │
│ - User, Canteen, Menu, Order │ │ - Food & Canteen Images    │
│ - Counter (Token sequences)  │ └────────────────────────────┘
└──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind/CSS | High-performance responsive user interface |
| **Authentication** | Clerk (`@clerk/clerk-react`, `@clerk/express`)| Zero-friction authentication & identity |
| **Backend** | Node.js 20+, Express 5 | Next-generation asynchronous API routing |
| **Primary Database** | MongoDB Atlas, Mongoose 9 | Document database for orders, users, menus, and tokens |
| **Caching & Rate Limits**| Upstash Redis (REST API) | Serverless, multi-instance rate limiting and read cache |
| **Image Hosting** | Cloudinary CDN | High-availability optimized food photo storage |
| **Notifications** | Web Push (`web-push` + Service Worker)| Background native browser notifications via VAPID |
| **Audio** | HTML5 Web Audio API | Zero-asset kitchen audio synthesis |
| **Hosting Blueprint** | Render (`render.yaml`) | Automated unified infrastructure provisioning |

---

## 📁 Repository Structure

```
pre-plates/
├── client/                     # React 19 Frontend (SPA & PWA)
│   ├── public/                 # Static assets, Web App Manifest, Service Worker (sw.js)
│   ├── src/
│   │   ├── components/         # CartDrawer, TokenSlip, MenuManager, VendorDashboard...
│   │   ├── hooks/              # useTheme, useOverlayA11y
│   │   ├── context/            # CartContext, ProfileContext, CanteenContext
│   │   ├── lib/                # upi.js, sound.js, pwa.js, push.js, api.js
│   │   └── App.jsx             # Route orchestrator & connection monitor
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express 5 API Service
│   ├── src/
│   │   ├── controllers/        # Business logic for auth, orders, menus, canteen, push
│   │   ├── middlewares/        # Clerk auth guards, Redis rate limiters, validation
│   │   ├── models/             # Mongoose schemas (User, Canteen, Menu, Order, Counter)
│   │   ├── routes/             # REST endpoints (order, canteen, menu, push, upload)
│   │   └── lib/                # Redis client, web-push helper, Cloudinary client
│   ├── scripts/                # Automated smoke test verification scripts
│   └── package.json
├── render.yaml                 # Render Blueprint for automated full-stack deploy
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites
- **Node.js 20+**
- **MongoDB Atlas** database cluster
- **Clerk** account for user authentication
- *(Optional)*: **Upstash Redis** REST database and **Cloudinary** account

---

### 1. API Server Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in MONGO_URI, CLERK_SECRET_KEY, and CLIENT_URL (http://localhost:5173)

# Generate VAPID Keys for Web Push Notifications
node -e "console.log(JSON.stringify(require('web-push').generateVAPIDKeys()))"
# Copy publicKey and privateKey into server/.env as VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY

# Run API in development mode
npm run dev
```

The API starts on `http://localhost:5000`. Test endpoint:
```bash
curl http://localhost:5000/api/health
```

---

### 2. Client Application Setup

```bash
cd ../client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL=http://localhost:5000

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Smoke Tests

The server includes isolated contract smoke tests with zero network or database dependencies:

```bash
cd server
node scripts/redis-cache.smoke.js         # Tests cache invalidation contract (7 checks)
node scripts/ratelimit-contract.smoke.js  # Tests express-rate-limit v8 store contract (5 checks)
```

All 12 checks pass instantly to guarantee rate limiter and cache compatibility.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `PORT` | API listener port | `5000` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `MONGO_URI` | MongoDB Atlas connection string | **Required** |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `CLERK_SECRET_KEY` | Clerk backend API secret key | **Required** |
| `VAPID_PUBLIC_KEY` | VAPID public key for Web Push | **Required** |
| `VAPID_PRIVATE_KEY`| VAPID private key for Web Push | **Required** |
| `VAPID_SUBJECT` | Contact URI for push dispatch | `mailto:admin@preplates.app` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Optional (falls back to memory) |
| `UPSTASH_REDIS_REST_TOKEN`| Upstash Redis REST token | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage bucket name | Optional |

### Frontend (`client/.env`)

| Variable | Description |
| :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_URL` | Deployed backend URL (`http://localhost:5000` for dev) |

---

## 📡 API Routes

| Router | Method & Route | Access | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `GET /api/auth/me` | Clerk Auth | Get current authenticated profile & roles |
| **Canteens** | `GET /api/canteens` | Public | List all active campus canteens |
| | `GET /api/canteens/:id` | Public | Detailed canteen metadata & operating status |
| | `POST /api/canteens` | Admin | Register new canteen |
| **Menu** | `GET /api/menu/:canteenId` | Public | Get full menu with categories & stock |
| | `POST /api/menu/:canteenId` | Vendor/Admin | Add new dish to menu |
| | `PATCH /api/menu/:id/toggle` | Vendor/Admin | Toggle food item availability |
| **Orders** | `POST /api/orders` | Student | Place order and mint atomic token |
| | `GET /api/orders/my` | Student | View order history and active token slips |
| | `GET /api/orders/queue/:canteenId`| Vendor/Admin | View live kitchen queue |
| | `PATCH /api/orders/:id/status` | Vendor/Admin | Advance order state (`preparing` ➔ `ready` ➔ `completed`)|
| **Push** | `POST /api/push/subscribe` | Student | Register device push subscription |
| | `POST /api/push/test` | Authenticated | Trigger diagnostic test push alert |
| **Upload** | `POST /api/upload` | Vendor/Admin | Upload food photography to Cloudinary |

---

## 🚢 Deployment (Unified Architecture — Same as Knots)

PrePlates uses the **unified single-service deployment pattern** (matching Knots). Instead of deploying the frontend and backend as two separate services (which consumes double the free-tier allowance and causes CORS roundtrips), both the React Vite SPA and Express API run inside **one single container/service**.

### Why this is optimal for Free Tier:
- **Zero CORS Latency**: Because the frontend is served directly from the same origin, the browser never sends preflight `OPTIONS` requests. All API calls execute at native origin speed.
- **50% Free Resource Consumption**: Render and other cloud hosts provide 750 free hours/month. Two services burn 1500 hours and sleep/exceed limits halfway through the month; a single service uses only 750 hours and stays within free limits.
- **Instant Asset Delivery**: Built client assets (`/assets/*`) are served with 1-year immutable caching (`max-age=31536000, immutable`), while `index.html` and `sw.js` use `no-cache` to ensure instant updates.
- **Single Cold Start**: No desynchronization where the frontend loads but the backend is asleep. When the service awakens, both are immediately active.

---

### Option A: Deploy via Docker (Recommended)

PrePlates includes a multi-stage `Dockerfile` (identical to Knots) that compiles the frontend and packages the backend in an ultra-lightweight Alpine Linux runner (~140MB):

```bash
# 1. Build the production container
docker build -t preplates .

# 2. Run the production container
docker run -d -p 5000:5000 --env-file server/.env preplates
```

---

### Option B: Deploy Frontend to Vercel + Backend to Render

1. **Deploy Backend on Render**:
   - Create a **Web Service** pointing to `server/` with build `npm install` and start `npm start` (or use Blueprint with `render.yaml`).
   - Add environment variables (`MONGO_URI`, `CLERK_SECRET_KEY`, `VAPID_*`, `CLIENT_URL` pointing to your Vercel domain).
2. **Deploy Frontend on Vercel**:
   - Import repository on Vercel with root directory set to `client` (or use root with included `vercel.json`).
   - Add environment variables:
     - `VITE_CLERK_PUBLISHABLE_KEY`: your Clerk key
     - `VITE_API_URL`: your Render backend URL (e.g. `https://preplates.onrender.com`)
   - Deploy!

---

### Option C: Deploy to Render (1-Click Blueprint)

Deploy using the included `render.yaml`:
1. Push this repository to GitHub.
2. In the Render Dashboard, click **New → Blueprint** and connect your repository.
3. Configure your environment secrets in Render:
   - `MONGO_URI`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
   - *(Optional)*: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, Cloudinary credentials.
4. Render builds and provisions the single unified service.

---

### Option D: Manual Monorepo Build & Run

```bash
# Install dependencies for both client and server
npm run install:all

# Build frontend to client/dist
npm run build

# Start production server (serves API + static frontend)
npm start
```

For complete deployment details and free-tier tuning, see [`docs/deployment.md`](./docs/deployment.md).

---

## 📄 License

This project is licensed under the MIT License.  
Designed and built for real campus canteens by [Utkarsh Yadav](https://github.com/utkarshIsAProgrammer).
