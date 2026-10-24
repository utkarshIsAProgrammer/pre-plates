# 🍔 Rush Bites — Campus Dining Pre-Ordering & Operations Platform

<div align="center">

```
    ____             __     ____  _ __            
   / __ \__  _______/ /_   / __ )(_) /____  _____ 
  / /_/ / / / / ___/ __ \ / __  / / __/ _ \/ ___/ 
 / _, _/ /_/ (__  ) / / // /_/ / / /_/  __(__  )  
/_/ |_|\__,_/____/_/ /_//_____/_/\__/\___/____/   
                                                  
Campus Dining, Pre-Ordered. Zero Counter Queues. Intelligent Kitchen Operations.
```

[![React](https://img.shields.io/badge/React-19.0+-20232a.svg?style=for-the-badge&logo=react&logoColor=61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0+-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Cloudinary](https://img.shields.io/badge/CDN-Cloudinary-3448C5.svg?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

[Problem Statement](#-problem-statement) • [Features](#-features) • [System Architecture](#-system-architecture) • [Engineering Specs](#-engineering-specifications) • [Quickstart](#-quickstart) • [API Directory](#-api-routes) • [Presentation](#-stakeholder-presentation)

</div>

---

## 📌 Executive Summary

**Rush Bites** is an end-to-end campus pre-ordering and kitchen operations management system designed to eliminate cafeteria congestion, streamline vendor workflows, and modernize the university dining experience. 

By replacing chaotic physical counter queues with scheduled, seat-to-counter meal pickups, Rush Bites enables thousands of students and faculty members to order meals from classrooms, libraries, or dormitories, pay via amount-locked UPI dynamic QR codes or cash, and collect their food using atomic daily tokens without standing in line.

---

## ⚠️ Problem Statement

University and college cafeterias face recurring bottlenecks during peak lunch rush hours (12:00 PM – 2:00 PM):
1. **Long Counter Queues**: 15 to 25 minute waits simply to place an order, resulting in missed meals or tardiness to lectures.
2. **Kitchen Chaos & Order Invisibility**: Verbal orders shouted over crowds create frequent fulfillment errors and lost paper tickets.
3. **Payment Reconciliation Disputes**: Static printed UPI QR codes require students to manually type amounts, resulting in manual verification delays, wrong transfer amounts, and unpaid walkaways.
4. **Campus Fragmented Dining**: Lack of centralized visibility into multi-canteen operating hours, menu availability, and live queue wait times across sprawling campuses.

---

## ✨ Features

### 🎓 Student & Faculty Experience
- **Campus Multi-Canteen Directory**: Unified portal displaying all active campus canteens, kiosks, and coffee bars with live open/closed indicators and estimated prep delays.
- **Visual Digital Menu**: High-contrast dietary indicators (100% Veg / Non-Veg dots), categories, instant search, and real-time inventory stock indicators.
- **Dynamic Amount-Locked UPI Payments**: Generates customized UPI deep-links and dynamic QR codes with transaction amounts pre-locked. Students enter the 12-digit bank UTR reference for instantaneous vendor verification.
- **High-Contrast Digital Token Slip**: Displays live order status, atomic daily pickup token (`#024`), ordered item breakdown, timestamp, and estimated prep time.
- **Verified Order Reviews**: 1–5 star reviews and qualitative feedback tied strictly to completed orders.

### 👨‍🍳 Vendor & Kitchen Management Dashboard
- **Real-Time Kanban Queue**: Instant order cards organized by fulfillment state: `pending`, `verified`, `preparing`, `ready`, `completed`, and `cancelled`.
- **Zero-Asset Web Audio Alerts**: Browser-native chime synthesis via the HTML5 Web Audio API signals new orders immediately without depending on external MP3 downloads.
- **Live Menu & Stock Switcher**: Real-time toggles to mark dishes out of stock instantly when ingredients run low.
- **Daily Performance Metrics**: Real-time sales totals, active order counts, and throughput tracking.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 19 + Vite)              │
│  - OrdersPage • MenuPage • CanteensPage • VendorDashboard   │
│  - Dynamic UPI QR Generator • Web Audio Chime Synthesizer   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend Layer (Node.js + Express 5)              │
│                                                             │
│  ┌────────────────────────┐      ┌────────────────────────┐ │
│  │ Clerk Auth Middleware  │      │ Campus-NAT Rate Limit  │ │
│  │ (Role verification)    │      │ (Keyed on User ID)     │ │
│  └───────────┬────────────┘      └───────────┬────────────┘ │
│              │                               │              │
│              ▼                               ▼              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Controllers: Orders • Canteen • Menu • Review • Upload │ │
│  │ - Atomic Daily Token Minting (Counter Model)           │ │
│  │ - Strict State Machine Transitions                     │ │
│  └───────────────────────────┬────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Atlas           │ │       Cloudinary CDN       │
│  - User, Canteen, Menu,      │ │  - Menu Item Photos        │
│  - Order, Counter, Review    │ │  - Vendor Banners          │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework**| React 19 + Vite 7 | Modern React architecture with fast bundling |
| **Authentication** | Clerk (`@clerk/clerk-react`)| Secure user authentication and role management |
| **Audio Synthesis** | Web Audio API | Client-synthesized audio tones for kitchen order alerts |
| **Backend Framework** | Node.js 20+ & Express 5 | High-throughput asynchronous REST API |
| **Database** | MongoDB Atlas, Mongoose 9 | Scalable document store with atomic sequences |
| **Image CDN** | Cloudinary | Cloud storage and optimized delivery for food images |
| **Styling** | Custom CSS Variables | Responsive design tokens with dark/light theme support |

---

## 📚 Engineering Specifications & Docs

Rush Bites includes a complete software engineering specification suite located in the [`specs/`](specs/) and [`docs/`](docs/) directories:

### Specification Documents (`specs/`)
- [`01_project_charter.md`](specs/01_project_charter.md) — Scope, vision, and stakeholder objectives.
- [`02_feasibility_study.md`](specs/02_feasibility_study.md) — Technical, economic, and operational feasibility analysis.
- [`03_srs.md`](specs/03_srs.md) — Complete Software Requirements Specification (SRS).
- [`04_system_design.md`](specs/04_system_design.md) — High and low-level architectural design.
- [`05_database_design.md`](specs/05_database_design.md) — Relational schema layouts, models, and index strategies.
- [`06_api_spec.md`](specs/06_api_spec.md) — Comprehensive REST API endpoint contract.
- [`07_ui_ux_spec.md`](specs/07_ui_ux_spec.md) — Wireframes, design tokens, and user flow maps.
- [`08_coding_standards.md`](specs/08_coding_standards.md) — Code style guides and linting rules.
- [`09_test_plan.md`](specs/09_test_plan.md) — Test strategies, unit tests, and validation matrices.
- [`10_deployment_plan.md`](specs/10_deployment_plan.md) — CI/CD pipelines, containerization, and hosting.
- [`11_risk_register.md`](specs/11_risk_register.md) — Technical and operational risk mitigation matrix.
- [`12_user_manual.md`](specs/12_user_manual.md) — Student and vendor step-by-step operating guide.

### Project Impact Docs (`docs/`)
- [`objectives.md`](docs/objectives.md) • [`methodology.md`](docs/methodology.md) • [`technologies-used.md`](docs/technologies-used.md) • [`implementation.md`](docs/implementation.md) • [`outcomes.md`](docs/outcomes.md)

---

## 🚀 Quickstart

### Prerequisites
- **Node.js 20+** & **npm**
- **MongoDB Atlas** cluster URI
- **Clerk** application publishable and secret keys
- *(Optional)*: **Cloudinary** credentials for menu photo uploads

---

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in MONGO_URI, CLERK_SECRET_KEY, and CLIENT_URL (http://localhost:5173)

# Start API in development mode
npm run dev
```

The server runs on `http://localhost:5000`. Test endpoint:
```bash
curl http://localhost:5000/api/health
```

---

### 2. Client Setup

```bash
cd ../client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Set VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL=http://localhost:5000

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PORT` | API server port (default: `5000`) | No |
| `NODE_ENV` | Environment (`development` or `production`) | No |
| `MONGO_URI` | MongoDB Atlas connection string | **Yes** |
| `CLIENT_URL` | Allowed frontend origin for CORS | **Yes** |
| `CLERK_SECRET_KEY` | Clerk backend secret key | **Yes** |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | Optional |

### Frontend (`client/.env`)

| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | **Yes** |
| `VITE_API_URL` | Backend API URL (`http://localhost:5000`) | **Yes** |

---

## 📡 API Routes

| Resource | Route | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile and role |
| **Canteens** | `/api/canteens` | `GET` | Public | List all active campus canteens |
| | `/api/canteens/:id` | `GET` | Public | Get single canteen details & hours |
| | `/api/canteens` | `POST` | Admin | Create a new canteen listing |
| **Menus** | `/api/menu/:canteenId`| `GET` | Public | Retrieve active menu items for canteen |
| | `/api/menu/:canteenId`| `POST` | Vendor/Admin | Add new dish item to menu |
| | `/api/menu/:id/toggle`| `PATCH`| Vendor/Admin | Instant toggle for dish availability |
| **Orders** | `/api/orders` | `POST` | Student | Place order and mint atomic sequence token |
| | `/api/orders/my` | `GET` | Student | Retrieve user active and historical orders |
| | `/api/orders/queue/:canteenId` | `GET` | Vendor/Admin | Live kitchen order queue |
| | `/api/orders/:id/status` | `PATCH`| Vendor/Admin | Transition order state (`pending` ➔ `ready`...) |
| **Reviews**| `/api/review/:canteenId` | `GET` | Public | Get verified canteen customer reviews |
| | `/api/review` | `POST` | Student | Submit 1–5 star review for completed order |
| **Uploads**| `/api/upload` | `POST` | Vendor/Admin | Upload image file to Cloudinary CDN |

---

## 📊 Stakeholder Presentation

A comprehensive presentation deck summarizing the system charter, feasibility analysis, user journey, and measurable impacts is included in the root directory:
- **`RushBites_Project_Presentation.pptx`**

---

## 📄 License

This project is licensed under the MIT License.  
Engineered for academic research and campus deployment by [Utkarsh Yadav](https://github.com/utkarshIsAProgrammer).
