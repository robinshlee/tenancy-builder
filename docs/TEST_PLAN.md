# Test Plan — Tenancy Builder

## v1 Success Scenario (manual walkthrough)

1. **Open app** → `/` redirects to `/agreements`; 2 seeded demo agreements visible with status badges.
2. **Add landlord** → `/landlords/new`; fill name, ID number, email; submit → appears in landlord list.
3. **Add tenant** → `/tenants/new`; fill name, ID number, phone; submit → appears in tenant list.
4. **Add property** → `/properties/new`; fill address, type = Apartment, 2 bedrooms; submit → appears in list.
5. **Create agreement** → `/agreements/new`; select new landlord, new tenant, new property; enter rent = 3000, deposit = 6000, payment day = 1, start = next month 1st, end = 12 months later, special conditions = "No pets"; submit.
6. **Verify persist** → redirected to `/agreements/[id]`; all entered fields displayed correctly.
7. **Print PDF** → click "Download PDF"; browser print dialog opens; document contains landlord name, tenant name, property address, rent amount, dates.
8. **Edit agreement** → change rent to 3200; save → detail page shows updated value.
9. **Delete agreement** → confirm dialog appears; after confirm, agreement removed from list.

## Empty State Tests
- `/agreements` with no rows → "No agreements yet. Create your first one." CTA shown.
- `/landlords` with no rows → same empty state pattern.

## Error Cases
- Submit agreement form with no landlord selected → inline error "Select at least one landlord".
- Submit with lease end before lease start → inline error "End date must be after start date".
- Supabase unreachable → error toast "Could not save. Please try again." No blank screen.

## Edit/Delete Checks
- Edit a seeded landlord name → list reflects new name immediately.
- Delete a seeded property linked to an agreement → confirm dialog warns of linked agreement (or cascades and notifies).

## Loading States
- Slow connection simulated via DevTools throttle → spinner visible on list pages; form submit button disabled while request is in flight.
