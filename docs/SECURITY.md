# Security — Tenancy Builder

## Secret Handling
- Supabase service-role key: server-side only (`SUPABASE_SERVICE_ROLE_KEY` in Vercel env, never in client bundle)
- Supabase anon key: public, safe for client reads under RLS
- OpenAI key (later): server-side API route only

## Permission Model
- **v1:** open RLS — all rows readable/writable by anyone (demo mode; no real tenant data yet)
- **Lock-down sprint:** `auth.uid() = user_id` policies on all tables; only the creating agent sees their own records
- Agent permissions inherit from the logged-in Supabase session; no elevated service-role calls from the browser

## Approved Tools Rule
Only named, scoped functions (see AGENTIC_LAYER.md) are called from the app. No `run_any` / `exec` / raw SQL from the frontend. All DB mutations go through typed Supabase client calls.

## Audit Principle
Every agreement create, update, delete, and status change writes a row to `audit_logs` with the actor's `user_id`, the object affected, and a before/after payload snapshot. Logs are append-only (no delete policy on `audit_logs`).
