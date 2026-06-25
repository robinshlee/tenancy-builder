# Tasks — Tenancy Builder

## Sprint 1 — DB, seed data, and entity forms
**Goal:** All core tables exist; landlord, tenant, and property CRUD works end-to-end.

- [ ] Run migration SQL (landlords, tenants, properties, agreements, agreement_parties, clauses, agreement_clauses, audit_logs)
- [ ] Seed 3 landlords, 4 tenants, 3 properties, 2 agreements, 3 clauses
- [ ] `/landlords` — list + add + edit + delete form; persists to DB
- [ ] `/tenants` — list + add + edit + delete form; persists to DB
- [ ] `/properties` — list + add + edit + delete form; persists to DB
- [ ] Empty state, loading spinner, and error toast on all list pages
- [ ] Nav bar linking all three sections

**Definition of Done:** Seeded rows visible on load; agent can create a new landlord/tenant/property and see it in the list without page refresh.

---

## Sprint 2 — Agreement builder engine ← **v1 FUNCTIONAL**
**Goal:** Agent enters details once and gets a print-ready agreement. Core engine works.

- [ ] `/agreements/new` — form: pick landlord(s), tenant(s), property; enter monthly rent, deposit, payment day, lease start/end, special conditions
- [ ] On submit: persist `agreements` + `agreement_parties` rows
- [ ] `/agreements/[id]` — formatted agreement document (all parties, property, terms, clauses)
- [ ] Print stylesheet + "Download PDF" button (browser print-to-PDF)
- [ ] `/agreements` — list all agreements with status badge
- [ ] Edit agreement; delete with confirm dialog
- [ ] Validate required fields; show inline errors
- [ ] Empty/error/loading states

**Definition of Done:** Agent completes full flow — new agreement → detail page → PDF in hand — without leaving the app. ✅ **v1 functional milestone**

---

## Sprint 3 — Status workflow and clause library
**Goal:** Agreements move through states; standard clauses are reusable.

- [ ] Status transition buttons: Draft → Ready → Signed
- [ ] `/clauses` — list + add + edit + delete standard clauses
- [ ] Attach clauses to agreement in builder form
- [ ] Clauses render in agreement document in sort order
- [ ] Audit log entry on every status change

**Definition of Done:** Agent marks agreement Signed; clause appears in printed document.

---

## Sprint 4 — Lock it down (auth + per-agent isolation)
**Goal:** Each agent's data is private; app is safe for real agreements.

- [ ] Supabase Auth: email/password sign-up and login pages
- [ ] Populate `user_id` on all new rows
- [ ] Replace open RLS policies with `auth.uid() = user_id` owner-scoped policies
- [ ] Redirect unauthenticated users to `/login`
- [ ] Protect all API/server routes with session check

**Definition of Done:** Agent A cannot see Agent B's agreements.

---

## Sprint 5 — AI clause suggestions
**Goal:** AI drafts optional special conditions; agent reviews before saving.

- [ ] Server-side API route: `POST /api/suggest-clauses` calls OpenAI, returns suggestion JSON
- [ ] Store in `ai_special_conditions` + `source` + `confidence` + `review_status`
- [ ] UI: "Suggest clauses" button in agreement form; renders draft with confidence badge
- [ ] Accept / Edit / Reject controls; accepted text copies to `special_conditions`
- [ ] Low-confidence (<0.6) drafts shown with warning banner

**Definition of Done:** AI suggestion appears in form; only accepted text saved to agreement.

---

## Gantt (sprint → feature)
```
Sprint 1  |  DB schema · seed data · landlord/tenant/property CRUD
Sprint 2  |  Agreement builder · detail page · PDF export  ← v1 functional
Sprint 3  |  Status workflow · clause library · audit log
Sprint 4  |  Auth · per-agent RLS · route protection
Sprint 5  |  AI clause suggestions · confidence scoring
```
