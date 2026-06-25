# Architecture — Tenancy Builder

## Stack
- **Frontend:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (Postgres + RLS)
- **Hosting:** Vercel
- **PDF:** Browser print stylesheet (`@media print`) + optional `react-pdf` for server-side export

## Now vs Later
| Now (v1) | Later |
|---|---|
| Landlord / Tenant / Property CRUD | Auth + per-agent RLS |
| Agreement builder & PDF output | AI clause suggestions |
| Standard clause library | Digital signature integration |
| Demo seed data, no login wall | Renewal reminders |

## Key Action Flow — "Generate Agreement"
1. **Enter** — agent fills agreement form (parties, property, amounts, dates)
2. **Validate** — client checks required fields; shows inline errors
3. **Persist** — `agreements` row + `agreement_parties` rows written to Supabase
4. **Render** — agreement detail page fetches and displays all fields in document layout
5. **Export** — agent clicks Print / Download PDF; browser generates file
6. **Update** — agent sets status to Ready or Signed via status button

## Layer Plan
1. **Data first** — tables, seed data, open RLS policies
2. **App logic** — CRUD forms, agreement builder, PDF layout
3. **Smart features** — AI clause drafting, confidence scoring (post-v1)

## Resilience
The agreement builder reads and writes plain Postgres rows. If the AI layer is unavailable, agents continue working — AI suggestions are optional overlays, never blockers.
