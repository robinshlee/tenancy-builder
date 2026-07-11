# Tasks & Sprints

## Sprint 1 — Database + Agreement Engine ✦ v1 functional milestone
**Goal:** A real user can generate a tenancy agreement end-to-end against the database.

- [ ] Run migration SQL (all tables, RLS, seed data)
- [ ] `/agreements` list page — reads from DB, shows 3 demo agreements
- [ ] Empty state: "No agreements yet. Create your first one."
- [ ] `/agreements/new` — full form (landlord fields, tenant fields, property fields, rent, deposit, dates, payment day)
- [ ] Client-side validation: required fields, date range check
- [ ] POST `/api/agreements` — server route: validate → assemble `generated_text` → insert rows → return id
- [ ] `/agreements/[id]` — preview page: fetch from DB, render full agreement text
- [ ] Loading spinner, error boundary, 404 for unknown id
- [ ] Edit agreement: form pre-filled from DB, PATCH route, UI updates
- [ ] Delete agreement: confirmation dialog, DELETE route, removed from list

**Definition of Done:** Agent fills the new-agreement form, submits, sees the formatted agreement on `/agreements/[id]`, and the row exists in Supabase. Edit and delete also persist. All screens handle loading/empty/error. Works without login.

---

## Sprint 2 — PDF Export & Polish
**Goal:** Agent can download the agreement as a print-ready PDF.

- [ ] GET `/api/agreements/[id]/pdf` — server renders PDF from `generated_text`
- [ ] "Download PDF" button on preview page
- [ ] PDF includes all party names, ID numbers, property, rent, dates, agent reference number
- [ ] Consistent print layout (margins, headings, signature lines)
- [ ] Reference number auto-generated (TA-YYYY-NNN) on creation

**Definition of Done:** Clicking Download PDF returns a valid, populated PDF file in < 5 seconds for any agreement.

---

## Sprint 3 — Reusable Profiles
**Goal:** Agent picks from saved landlord / tenant / property records instead of retyping.

- [ ] `/landlords` CRUD (list, new, edit, delete)
- [ ] `/tenants` CRUD (list, new, edit, delete)
- [ ] `/properties` CRUD (list, new, edit, delete)
- [ ] New-agreement form: dropdown to select existing profile OR enter new inline
- [ ] Agreement record linked to profile IDs; profile changes do NOT retroactively alter saved agreement text

**Definition of Done:** Agent creates a second agreement for the same tenant in under 60 seconds by picking from the dropdown.

---

## Sprint 4 — AI Clause Suggestions
**Goal:** AI drafts 3 special conditions; agent accepts or rejects each before they enter the agreement.

- [ ] Server-side `draft_clauses` function calls OpenAI (key in env only)
- [ ] Triggered after agreement is saved; stores results in `agreement_clauses`
- [ ] Preview page shows suggestions with Accept / Edit / Reject controls
- [ ] Accepting a clause updates `review_status = 'accepted'` and appends to `generated_text`
- [ ] Rejecting sets `review_status = 'rejected'`; clause never appears in agreement
- [ ] AI entirely optional — agreement works fully if call fails or is disabled

**Definition of Done:** An accepted clause appears in the agreement preview and in the downloaded PDF. A rejected clause does not. App behaves identically if the AI call throws an error.

---

## Sprint 5 — Lock It Down (Auth + Per-Agent Isolation)
**Goal:** Each agent sees only their own agreements; PII is protected.

- [ ] Supabase Auth: email/password sign-up and login pages
- [ ] All new writes set `user_id = auth.uid()`
- [ ] Replace all `_v1_` RLS policies with `auth.uid() = user_id`
- [ ] Redirect unauthenticated requests to `/login` (only added in this sprint)
- [ ] Smoke test: agent A cannot query agent B's agreements, landlords, tenants, properties
- [ ] Session management: sign-out clears session

**Definition of Done:** Two test accounts each see only their own data. Supabase RLS blocks cross-agent reads at the DB layer (verified with direct SQL query as each user).

---

## Gantt (sprint → feature)
```
Sprint 1  |██████ DB + Form + Generate + Preview + Edit/Delete
Sprint 2  |████ PDF export + reference numbers
Sprint 3  |████ Saved profiles + form pre-fill
Sprint 4  |████ AI clause suggestions
Sprint 5  |████ Auth + RLS lock-down
```
