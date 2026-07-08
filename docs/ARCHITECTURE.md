# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + API:** Supabase (Postgres + RLS + Storage)
- **PDF:** React-PDF or Puppeteer server-side route
- **AI (later):** OpenAI via server-side API route only

## What to Build Now vs Later
**Now:** form → DB record → generate text → preview → PDF download → list/edit/delete
**Later:** saved profiles, AI clause suggestions, auth, e-signature, email send

## Key User Action — Step by Step
1. Agent opens `/agreements/new` (no login required)
2. Fills form; client validates required fields
3. On submit: POST to `/api/agreements` server route
4. Server assembles agreement text from inputs, saves `agreements` row + junction rows
5. Server returns the new `agreement.id`
6. Browser redirects to `/agreements/[id]` — fetches record from Supabase and renders preview
7. Agent clicks Download PDF → `/api/agreements/[id]/pdf` renders and streams the file
8. Agreement appears in `/agreements` list via Supabase query

## Layer Plan
1. **Data first** — tables, constraints, RLS policies, seed data
2. **App logic** — form, server routes, agreement text assembly (runs without AI)
3. **Smart features** — AI clause drafting added on top; disabling it leaves the core intact

## Why the Core Runs Without AI
Agreement text is assembled from structured DB fields by a plain TypeScript template function. No LLM call is in the critical path. AI only proposes optional special conditions the agent can accept, edit, or ignore.
