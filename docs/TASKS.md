# Tasks — Tenancy Builder

## Sprint 1 — Database & seed data
**Goal:** All tables exist, RLS open policies active, demo rows visible without login.

- [ ] Run migration SQL against Supabase project
- [ ] Verify all 6 tables created with correct columns
- [ ] Confirm 3–5 seed rows readable via Supabase Table Editor (no login)
- [ ] Confirm RLS policies applied (`pg_policies` check)

**Definition of Done:** `select * from agreements` returns 3 rows in Supabase SQL editor with no auth token.

---

## Sprint 2 — Agreement generation engine ✅ *v1 functional milestone*
**Goal:** Agent fills one form, a complete tenancy agreement is generated and downloadable.

- [ ] Agreement generation form: landlord selector, tenant selector (multi), property selector, rent, deposit, start date, end date, special conditions
- [ ] Inline "Add new" flow for landlord/tenant/property from within the form
- [ ] Server action: validate inputs, write `agreements` + join rows, assemble HTML document from template
- [ ] Save `generated_document_html` back to DB
- [ ] Agreement preview page renders the full document
- [ ] PDF download button (print stylesheet or `@react-pdf/renderer`)
- [ ] Loading, empty, and error states on form and preview
- [ ] Audit log entry written on generate

**Definition of Done:** Fill the form with demo data → click Generate → agreement preview loads with all correct names, IDs, property, rent, dates → PDF downloads and prints cleanly. No dead buttons. Persists after page refresh.

---

## Sprint 3 — Records management UI
**Goal:** Full CRUD for landlords, tenants, and properties.

- [ ] `/landlords` list + create/edit/delete
- [ ] `/tenants` list + create/edit/delete
- [ ] `/properties` list + create/edit/delete
- [ ] Empty state copy on each list
- [ ] Confirm deletes are blocked if record is linked to a finalised agreement

**Definition of Done:** Create a new landlord, edit their phone number, delete them — all changes reflected immediately in the list and in Supabase without a page reload.

---

## Sprint 4 — Agreements dashboard
**Goal:** All agreements visible with status; drafts editable.

- [ ] `/agreements` list: property address, tenant names, rent, dates, status badge
- [ ] Click row → agreement preview
- [ ] Edit draft agreement and re-generate document
- [ ] Mark agreement as finalised (locks editing)

**Definition of Done:** Three seeded agreements appear on load. Editing a draft and re-generating updates the DB and preview.

---

## Sprint 5 — Lock it down
**Goal:** Per-agent data isolation; app safe for real client data.

- [ ] Enable Supabase Auth (email/password)
- [ ] Login and signup pages at `/login`
- [ ] Write `user_id = auth.uid()` on all inserts via server actions
- [ ] Drop v1 open policies; apply owner-scoped RLS
- [ ] Redirect unauthenticated requests to `/login`
- [ ] Test: two agents cannot see each other's records
- [ ] Demo account seeded with existing demo rows

**Definition of Done:** Agent A logs in and sees only their records. Agent B logs in and sees only theirs. `select * from agreements` with no token returns 0 rows.

---

## Sprint 6 — Template & polish
**Goal:** Customisable agreement template; print-ready output.

- [ ] Template editor: editable standard clauses per property type
- [ ] Jurisdiction selector (affects mandatory clause set)
- [ ] Print CSS polish: page breaks, header/footer, signature blocks
- [ ] Mobile-responsive form layout

**Definition of Done:** Agent adds a custom clause, generates agreement — custom clause appears in the correct section of the PDF.

---

## Gantt (sprint → feature)
```
Sprint 1  | DB schema + seed data
Sprint 2  | Agreement form + generate + PDF          ← v1 functional
Sprint 3  | Landlord / Tenant / Property CRUD
Sprint 4  | Agreements dashboard + status
Sprint 5  | Auth + RLS lock-down
Sprint 6  | Template editor + polish
```
