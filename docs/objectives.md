# Project Objectives — Rush Bites

## 1. Executive Summary

**Rush Bites** (College Bites) is a campus-first, pre-ordering and dining operations platform engineered to eliminate cafeteria congestion, streamline kitchen workflows, and modernize the campus dining experience. By creating a unified digital bridge between students, faculty, and campus canteen operators, the platform replaces chaotic physical counter queues with scheduled, seat-to-counter meal pickups.

---

## 2. Problem Statement

Campus dining halls and food counters face acute logistical and operational bottlenecks that recur daily during standard academic intervals:

1. **Peak Rush Hour Bottlenecks**:
   - Thousands of students and faculty members are dismissed for lunch or short breaks simultaneously within narrow 30-to-45-minute windows.
   - Physical queues at canteen counters routinely take 15 to 25 minutes simply to place an order, leaving inadequate time for dining and relaxation.

2. **Kitchen Disruption & Order Invisibility**:
   - Cafeteria staff face chaotic counter crowds shouting orders, leading to misheard dish requests, lost paper slips, and frequent fulfillment errors.
   - Kitchen staff have zero advance visibility into upcoming demand, resulting in either food shortages during sudden rushes or overproduction and food waste.

3. **Payment Friction & Reconciliation Disputes**:
   - Cash transactions slow counter lines drastically due to coin change shortages.
   - Static UPI QR codes taped to counters require customers to manually type amounts, causing transaction verification delays, mistaken payment amounts, or unpaid walkaways during peak crowds.

4. **Fragmented Vendor Landscape**:
   - Large campuses typically host multiple distinct canteens, food kiosks, and beverage counters across different buildings. Students have no centralized directory to view open counters, live menu availability, pricing, or wait times before walking across campus.

---

## 3. Primary Objectives

The core objectives of the Rush Bites platform are centered around three stakeholder pillars:

### 3.1. Customer Objectives (Students, Faculty, Campus Staff)
- **Eliminate Counter Waiting Lines**: Enable customers to browse menus, customize items, and place pre-orders directly from classrooms, libraries, or dormitories.
- **Transparent Wait Time Visibility**: Provide real-time queue intelligence showing the exact number of orders ahead in the kitchen queue and dynamic preparation estimates (`👤 X ahead · ready ~HH:MM`).
- **Frictionless Dual Payment Integration**: Support both cash-on-pickup and direct UPI QR payments, where the dynamic QR code is pre-locked with the exact transaction total to prevent payment errors.
- **One-Tap Reordering & Order History**: Offer instantaneous re-ordering of favorite meals with real-time stock re-validation.
- **Democratic Quality Feedback**: Implement order-verified 1–5 star reviews and qualitative ratings to foster food quality and service consistency across campus vendors.

### 3.2. Vendor Objectives (Canteen Owners & Kitchen Operators)
- **Zero-Hardware Operational Console**: Provide a complete kitchen operations hub accessible from any smartphone, tablet, or laptop without requiring proprietary Point of Sale (POS) hardware.
- **Automated Sequential Token Management**: Issue unique, atomic per-day order token numbers (`#1, #2, #3...`) that reset daily per canteen, keeping counter collection organized.
- **Lifecycle Queue Progression**: Allow kitchen staff to transition orders through structured operational states:
  $$\text{Pending} \longrightarrow \text{Accepted} \longrightarrow \text{Preparing} \longrightarrow \text{Ready} \longrightarrow \text{Completed}$$
- **Instant Audio & Visual Alerts**: Fire synthesized browser chimes and high-contrast banners upon new incoming orders so busy chefs never miss an order, even if running the console in the background.
- **Digital Counter Display & Token Slips**: Provide a full-screen "Now Serving" counter display mode for hanging monitors/tablets and one-click printable token slips for counter paper trails.
- **Financial Reconciliation & Debt Tracking**: Maintain distinct accounting views between settled revenue and outstanding payments (such as cash-on-pickup or unconfirmed UTRs).

### 3.3. Institutional & Campus Objectives
- **Decentralize Crowd Densities**: Smooth out physical campus congestion, adhering to institutional health and safety standards.
- **Data-Driven Menu Planning**: Enable canteen operators to track top-selling dishes and revenue trends to minimize kitchen food waste.
- **Open Onboarding & Vendor Autonomy**: Allow any verified campus seller to register their kiosk, set operating hours, upload menus, and start receiving orders within minutes.

---

## 4. Scope and MVP Boundaries

### In Scope (Delivered in MVP)
- Role-based authentication (Customer, Staff/Vendor, Admin) via Clerk.
- Multi-canteen marketplace directory with real-time queue lengths and item counts.
- Menu catalog management with categories, veg/non-veg flags, prep estimates, and Cloudinary CDN image uploads.
- Cart with single-vendor isolation and cross-canteen switching guards.
- Atomic token numbering and pickup estimation algorithm.
- Dynamic amount-locked UPI deep-links and QR code generation.
- Real-time kitchen queue polling with live state updates.
- Native Web Audio API alert synthesis for customer and vendor status events.
- Post-fulfillment star ratings and feedback loop.
- Responsive design system with persisted light/dark mode and campus network connection monitoring.

### Out of Scope (Future Phases)
- Multi-vendor combined checkout (orders from different canteens in a single transaction).
- Push notification service workers (SMS/WhatsApp integration).
- GPS-based geofenced campus delivery.
- RFID / student smartcard wallet balance deduction.
