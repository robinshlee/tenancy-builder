-- Rework the Schedule fields to match the real Schedule A-J structure from the agency's
-- actual tenancy agreement template (Schedule B/C/D/E already covered by existing
-- landlord/tenant/property/lease-date fields; J is already the existing special_conditions
-- field). This adds the fields that were genuinely missing, and stops using the earlier
-- generic placeholders (notice_period, maintenance_responsibility, utilities_responsibility,
-- inventory_notes) — those columns are left in place (additive-only) but no longer read.
alter table app_settings
  add column if not exists default_use_of_premises text,
  add column if not exists default_rent_payment_details text,
  add column if not exists default_access_card_deposit_notes text;

update app_settings set
  default_use_of_premises = coalesce(default_use_of_premises, 'Residential purposes only.'),
  default_access_card_deposit_notes = coalesce(default_access_card_deposit_notes,
    'Any access card lost will be charged at the replacement cost.')
where id = 1;

alter table agreements
  add column if not exists use_of_premises text,
  add column if not exists rent_payment_details text,
  add column if not exists utility_deposit_amount numeric,
  add column if not exists access_card_deposit_notes text;
