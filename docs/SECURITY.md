# Security — Tenancy Builder

## Secret Handling
- `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ANON_KEY` stored in Vercel environment variables only — never in client-side code or committed to the repo.
- PDF generation and document assembly run in Next.js Server Actions — never in the browser.

## Permission Model
- **v1 (demo):** RLS policies are open (SELECT + ALL for all) so the app is demoable without login.
- **Sprint 5 (lock-down):** All open policies are dropped and replaced with `auth.uid() = user_id` owner-scoped policies. Each agent sees only their own landlords, tenants, properties, and agreements.
- Supabase client in the browser uses the `anon` key only; service-role key is server-side only.

## Approved-Tools Rule
Server actions call only the named tools in `AGENTIC_LAYER.md`. No `eval`, no dynamic SQL construction, no `run_any` escape hatch.

## Audit Principle
Every meaningful write (create, update, finalise, delete) inserts a row into `audit_logs` with the acting `user_id`, the action name, the affected table and record ID, and a JSON snapshot of changed fields. Audit rows are append-only — no update or delete policy is granted on `audit_logs`.

## Before Going Live
Before real landlord/tenant identity numbers are stored: complete Sprint 5 (auth + owner RLS), rotate to production Supabase keys, and confirm no row is readable by a different agent. If in doubt — stop and get a human to review the RLS policies.
