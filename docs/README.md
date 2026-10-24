# Rush Bites — Documentation Index

Welcome to the technical and product documentation for **Rush Bites** (Campus dining, pre-ordered). This directory contains dedicated documentation files detailing every aspect of the project for academic review, stakeholder presentations, and engineering handoffs.

---

## Documentation Modules

| Document | Description | Key Topics |
| :--- | :--- | :--- |
| **[1. Project Objectives](file:///home/indiedev/Projects/college-bites/docs/objectives.md)** | Core purpose, problem statement, and goals. | Cafeteria congestion challenges, customer vs. vendor vs. institutional objectives, MVP project scope. |
| **[2. System Methodology](file:///home/indiedev/Projects/college-bites/docs/methodology.md)** | Architectural design, state machines, and algorithms. | Decoupled client-server design, order state machine, payment reconciliation, atomic daily token sequences, campus NAT rate limiting. |
| **[3. Technologies Used](file:///home/indiedev/Projects/college-bites/docs/technologies-used.md)** | Complete technology stack and technical rationales. | React 19, Vite 7, Clerk Auth, Web Audio API, Express 5, MongoDB Atlas, Mongoose 9, Cloudinary CDN, CSS custom properties. |
| **[4. Implementation Details](file:///home/indiedev/Projects/college-bites/docs/implementation.md)** | Schemas, API endpoints, and component architecture. | Data models (`User`, `Canteen`, `Menu`, `Order`, `Counter`, `Review`), REST API endpoints, client hierarchy, audio synthesis, dynamic UPI QR rendering. |
| **[5. Outcomes & Impact](file:///home/indiedev/Projects/college-bites/docs/outcomes.md)** | Results, performance metrics, and future roadmap. | Quantitative wait time reduction (~100%), order throughput gains (3×), zero-hardware adoption, user journey verification, future roadmap. |

---

## Quick Reference Links

- **Frontend Source Code**: [`client/src`](file:///home/indiedev/Projects/college-bites/client/src)
- **Backend Source Code**: [`server/src`](file:///home/indiedev/Projects/college-bites/server/src)
- **API Entrypoint**: [`server/src/server.js`](file:///home/indiedev/Projects/college-bites/server/src/server.js)
- **Application Shell**: [`client/src/App.jsx`](file:///home/indiedev/Projects/college-bites/client/src/App.jsx)
