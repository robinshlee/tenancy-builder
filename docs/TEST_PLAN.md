# Test Plan — Tenancy Builder

## 1. Core Success Scenario
**"Generate and download a tenancy agreement in under 3 minutes"**

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/` without logging in | Agreements dashboard loads with seeded data — no login wall |
| 2 | Click **New Agreement** | Agreement form opens, landlord/tenant/property selectors populated from DB |
| 3 | Select landlord "Margaret Osei", tenant "David Kuffour", property "45 Osu Badu Street" | Selections persist in form state |
| 4 | Enter rent GHS 1,800, deposit GHS 3,600, start 2025-06-01, end 2026-05-31 | Fields accept input without error |
| 5 | Click **Generate Agreement** | Loading spinner shown; agreement preview page loads within 3 s |
| 6 | Inspect preview | Full name, identity number, property address, rent, deposit, dates, and special conditions all correctly populated |
| 7 | Open Supabase → agreements table | New row present with correct values and `generated_document_html` not null |
| 8 | Click **Download PDF** | Browser downloads a clean PDF with all agreement content |
| 9 | Refresh agreement preview page | Agreement still loads from DB (not a client-side cache) |

## 2. Empty States
- Open `/landlords` with no records → "No landlords yet. Add your first landlord." button visible.
- Open agreement form with no properties in DB → inline "Add property" prompt shown, not a blank dropdown.

## 3. Error Cases
| Scenario | Expected behaviour |
|---|---|
| Submit form with no tenant selected | Inline validation error: "At least one tenant is required" |
| End date before start date | Inline error: "End date must be after start date" |
| Supabase write fails (network off) | Toast error: "Could not save agreement. Please try again." — no partial save |
| Navigate to `/agreements/nonexistent-id` | 404 page with "Agreement not found" copy |

## 4. Data Integrity
- Finalised agreement → edit button disabled; status badge shows "Finalised".
- Delete a landlord linked to a finalised agreement → error returned, record not deleted.
- Audit log gains one row for every generate, update, and delete action.
