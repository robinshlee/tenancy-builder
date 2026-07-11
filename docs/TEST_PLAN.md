# Test Plan

## Core Success Scenario — Generate a Tenancy Agreement

1. Open `/agreements` — confirm 3 demo agreements are visible without logging in
2. Click "New Agreement"
3. Enter landlord: *Margaret Osei*, ID *GHA-8821045-3*, phone *+233 24 400 1111*
4. Enter tenant: *James Boateng*, ID *GHA-9900112-7*, phone *+233 26 511 4444*
5. Enter property: *14 Cantonments Road, Accra*
6. Enter rent: *3500*, deposit: *7000*, start: *2025-02-01*, end: *2026-01-31*, due day: *1*
7. Click Generate
8. **Pass:** Redirected to `/agreements/[id]`; agreement text contains all entered values
9. Click Download PDF
10. **Pass:** PDF downloads, opens correctly, contains all fields including both party names and ID numbers
11. Return to `/agreements`
12. **Pass:** New agreement appears at top of list with correct reference number

---

## Empty State
- Delete all agreements (or open a fresh DB) → `/agreements` shows "No agreements yet" CTA
- `/agreements/[nonexistent-id]` → shows 404 message, not a crash

## Validation Errors
- Submit form with `lease_end_date` before `lease_start_date` → inline error, form not submitted
- Submit with landlord name missing → required field error highlighted
- Submit with non-numeric rental amount → field error, no DB write

## Edit & Delete
- Edit an agreement, change rent to 4000 → save → preview shows updated amount → DB row updated
- Delete an agreement → confirmation dialog → confirm → removed from list → DB row gone
- Cancel delete → agreement still in list

## Error States
- Supabase offline (simulate by revoking key) → form submission shows "Something went wrong. Please try again." — no crash, no empty white screen
- PDF route fails → button shows error toast, does not navigate away

## Security (Sprint 5)
- Log in as Agent A, note agreement IDs → log out → log in as Agent B → attempt to fetch Agent A's agreement URL directly → receive 403 / empty result
- Verify no Supabase service-role key appears in browser network tab at any point
