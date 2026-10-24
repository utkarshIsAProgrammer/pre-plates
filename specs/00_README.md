# QuickCanteen — SDLC Documentation Package

> **Project:** Canteen Pre-Order System for College Canteen Halls
> **Working title:** QuickCanteen _(rename as needed)_
> **Stack:** MERN (MongoDB, Express, React, Node.js) + Socket.io
> **Status:** Pre-development (documentation phase complete)

---

## Purpose

This folder contains every document prepared during the Software Development Life Cycle (SDLC) for the QuickCanteen project, following the standard phase order:

```
Planning ──► Requirements ──► Design ──► Implementation ──► Testing ──► Deployment ──► Maintenance
```

## Document Index

| #   | Document                                               | SDLC Phase     | Description                                                              |
| --- | ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| 01  | [Project Charter](01_project_charter.md)               | Planning       | Problem, objectives, scope, stakeholders, milestones                     |
| 02  | [Feasibility Study](02_feasibility_study.md)           | Planning       | Technical, economic, operational, schedule, legal feasibility            |
| 03  | [Software Requirements Specification (SRS)](03_srs.md) | Requirements   | Functional & non-functional requirements, use cases, acceptance criteria |
| 04  | [System Design Document](04_system_design.md)          | Design         | Architecture, module design, DFDs, sequence diagrams, state machine      |
| 05  | [Database Design](05_database_design.md)               | Design         | ER overview, collections, schemas, indexes, sample documents             |
| 06  | [API Specification](06_api_spec.md)                    | Design         | REST endpoints + Socket.io events                                        |
| 07  | [UI/UX Specification](07_ui_ux_spec.md)                | Design         | Screens, wireframes, user flows, design system                           |
| 08  | [Coding Standards](08_coding_standards.md)             | Implementation | Naming, structure, Git conventions, security practices                   |
| 09  | [Test Plan](09_test_plan.md)                           | Testing        | Strategy, test cases, UAT plan, defect severity                          |
| 10  | [Deployment Plan](10_deployment_plan.md)               | Deployment     | Environments, hosting, CI/CD, rollback, monitoring                       |
| 11  | [Risk Register](11_risk_register.md)                   | All phases     | Risks with probability, impact, mitigation                               |
| 12  | [User Manual](12_user_manual.md)                       | Maintenance    | End-user guides for all 3 roles, FAQ, troubleshooting                    |

## Reading Order

- **For reviewers/examiners:** 01 → 02 → 03 → 04 → 07
- **For developers:** 03 → 04 → 05 → 06 → 08
- **For testers:** 03 → 09 → 12
- **For end users:** 12 only

## Key Decisions (locked)

| Decision            | Choice                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| Payment             | Cash/UPI at counter — no payment gateway in v1                                 |
| Cart                | Multi-canteen cart; checkout **splits into one sub-order per canteen**         |
| Notifications       | Per-canteen owners notified only of their own sub-orders                       |
| Pickup verification | Token number (per-canteen daily counter, e.g. `A-12`)                          |
| Scope               | Core MVP only (auth, menus, ordering, realtime owner dashboard, notifications) |
| Realtime            | Socket.io for order status + new-order alerts                                  |

## Maintenance of these Documents

- Each document is updated when its phase artifacts change.
- The SRS is the single source of truth for _what_ to build; the System Design is the source of truth for _how_.
- Status of each doc is tracked here — update the table above as docs are reviewed/approved.
