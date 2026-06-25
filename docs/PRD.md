# PRD — Tenancy Builder

## Problem
Preparing a tenancy agreement for each secured rental is a manual, error-prone process that takes an agent hours. Details (landlord, tenant, property, rent, dates, clauses) are scattered across notes and templates.

## Target User
Letting agent working independently or in a small agency.

## Core Objects
- **Landlord** — name, ID number, contact details
- **Tenant** — name, ID number, contact details
- **Property** — address, type, bedrooms
- **Agreement** — links landlord(s) + tenant(s) + property; stores rental amount, deposit, payment day, lease dates, special conditions, status
- **Clause** — reusable standard or custom clause text

## MVP Checklist (v1)
- [ ] Add / edit / delete landlords
- [ ] Add / edit / delete tenants
- [ ] Add / edit / delete properties
- [ ] Create agreement: select landlord(s), tenant(s), property; enter rental, deposit, dates, special conditions
- [ ] Agreement detail page renders a clean, print-ready document
- [ ] Download / print agreement as PDF
- [ ] Agreement list with status badges (Draft / Ready / Signed)
- [ ] App loads with demo data — no login required in v1

## Non-Goals (v1)
- Multi-tenant SaaS / agency-wide accounts
- Digital signatures
- Automated email delivery
- AI clause suggestions (later sprint)
- Auth / per-agent data isolation (later sprint)

## Success Criteria
An agent opens the app, selects an existing landlord, tenant, and property, fills in rent and dates, clicks **Generate Agreement**, and within 2 minutes has a formatted, print-ready tenancy document — no template editing, no copy-pasting.
