# Product Requirements — Tenancy Builder

## Problem
Letting agents manually draft a fresh tenancy agreement for every secured rental. Pulling together landlord IDs, tenant IDs, property details, rent, deposit, and duration into a correctly formatted legal document takes hours and is error-prone.

## Target User
A letting agent (solo or small team) who closes multiple rental deals per month and needs to produce a clean, complete tenancy agreement fast.

## Core Objects
| Object | Key fields |
|---|---|
| Landlord | full name, identity number, contact details |
| Tenant | full name, identity number, contact details |
| Property | address, type, description |
| Agreement | landlord(s), tenant(s), property, monthly rent, deposit, start date, end date, special conditions, status, generated document |

## MVP Must-Haves
- [ ] Create, edit, and delete landlord records
- [ ] Create, edit, and delete tenant records
- [ ] Create, edit, and delete property records
- [ ] Single agreement-generation form: select/enter all parties and terms in one screen
- [ ] On submit: persist agreement to DB and render a complete, correctly populated tenancy agreement
- [ ] PDF export of the generated agreement
- [ ] App works and is demoable without login

## Non-Goals (v1)
- E-signature or online signing
- Automated reminders or renewal alerts
- Multi-user team access / per-agent data isolation *(Sprint 5)*
- Custom template editing
- Payment tracking

## Success Criteria
**End-to-end scenario:** Agent opens the app, selects an existing landlord and tenant (or creates them inline), picks a property, enters rent GHS 2,500/month, deposit GHS 5,000, 1 March 2025 – 28 February 2026, clicks **Generate Agreement** — a fully formatted tenancy agreement appears on screen with all names, ID numbers, property address, financial terms, and duration correctly populated. Agent clicks **Download PDF** and receives a print-ready document. Total time: under 3 minutes.
