# Architecture — Tenancy Builder

## Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth *(Sprint 5 only)* |
| Hosting | Vercel |
| PDF | `@react-pdf/renderer` or browser print stylesheet |

## Now vs Later
**Now:** landlord/tenant/property CRUD → agreement form → document assembly → PDF export 
**Next:** agreement dashboard with status, template editor, e-signature 
**Later:** reminders, team access, AI clause suggestions

## Key Action Flow — "Generate Agreement"
1. **Capture** — Agent fills the agreement form (parties, property, financial terms, dates).
2. **Validate** — Client + server checks: all required fields present, end date > start date.
3. **Persist** — Agreement row written to `agreements`; join rows to `agreement_landlords` and `agreement_tenants`.
4. **Assemble** — Server-side function merges DB record into the agreement HTML template.
5. **Store** — Rendered HTML saved back to `agreements.generated_document_html`.
6. **Show** — Preview rendered in-browser; PDF download available immediately.
7. **Audit** — Row inserted into `audit_logs`: action = `agreement.generated`, record_id = agreement ID.

## Layer Plan
1. **Data first** — All tables and constraints in Supabase before any UI.
2. **App logic** — Form, validation, template assembly, and PDF export in Next.js server actions.
3. **Smart features later** — AI clause drafting layered on top once core flow is stable.

## Core Without AI
The document assembly uses a deterministic Handlebars/string template. AI clause suggestions are additive. Remove them and the agreement still generates correctly.
