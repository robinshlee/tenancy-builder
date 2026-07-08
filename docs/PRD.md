# Tenancy Builder — Product Requirements

## Problem
Every time a letting agent secures a rental, they must produce a tenancy agreement from scratch — copying names, ID numbers, property details, rent, and dates into a document template. It takes hours and is error-prone.

## Target User
A letting agent (solo or small team) who handles multiple rentals and needs to produce a clean, legally complete tenancy agreement fast.

## Core Objects
| Object | Purpose |
|---|---|
| Landlord | Named party who owns the property |
| Tenant | Named party who will occupy |
| Property | The rental unit being let |
| Agreement | The generated tenancy document tying them together |
| Agreement Clause | AI-drafted special conditions attached to an agreement |

## MVP Must-Haves (v1)
- [ ] One form: enter landlord(s), tenant(s), property, rent, deposit, dates, payment day
- [ ] Submit → agreement record persisted to database
- [ ] Formatted agreement text generated server-side and stored
- [ ] On-screen preview of the full agreement
- [ ] Download agreement as PDF
- [ ] Agreements list page (newest first)
- [ ] Edit and delete any agreement
- [ ] Empty, loading, and error states on every screen
- [ ] 3 demo agreements visible on first load (no login needed)

## Non-Goals (v1)
- User accounts / login
- E-signatures
- Email delivery
- Renewal reminders
- Multi-agent teams
- Custom clause library / template editor

## Success Criteria
**Scenario:** Agent opens the app, clicks "New Agreement", fills in landlord Margaret Osei (ID: GHA-8821045-3), tenant James Boateng (ID: GHA-9900112-7), property 14 Cantonments Road, rent GHS 3,500, deposit GHS 7,000, lease 1 Feb 2025 – 31 Jan 2026, payment due day 1. Clicks Generate. Within 10 seconds a complete, correctly populated tenancy agreement is visible on-screen and downloadable as a PDF. The record appears in the agreements list after generation.

**Definition of Done:** The agreement preview contains every entered field, the PDF downloads without error, the record is in the database, and all this works without a login.
