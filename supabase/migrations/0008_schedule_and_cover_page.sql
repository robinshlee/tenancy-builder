-- Standard lease terms: admin-configurable defaults live on app_settings, each agreement
-- gets its own editable copy (starts from the defaults, overridable per-agreement).
alter table app_settings
  add column if not exists default_notice_period text,
  add column if not exists default_renewal_terms text,
  add column if not exists default_maintenance_responsibility text,
  add column if not exists default_utilities_responsibility text,
  add column if not exists default_inventory_notes text,
  add column if not exists cover_page_url text,
  add column if not exists cover_page_filename text,
  add column if not exists cover_page_uploaded_at timestamptz;

update app_settings set
  default_notice_period = coalesce(default_notice_period,
    '1 calendar month, given in writing by either party.'),
  default_renewal_terms = coalesce(default_renewal_terms,
    'This Agreement may be renewed for a further term by mutual written consent of both parties, at least 30 days before expiry. Absent renewal, the Tenant shall vacate the property on or before the last day of the lease term.'),
  default_maintenance_responsibility = coalesce(default_maintenance_responsibility,
    'The Tenant is responsible for day-to-day upkeep and minor repairs. The Landlord is responsible for structural repairs and major system failures (e.g. plumbing, electrical, roofing).'),
  default_utilities_responsibility = coalesce(default_utilities_responsibility,
    'The Tenant is responsible for electricity, water, and other utility bills incurred during the tenancy, unless otherwise agreed in writing.'),
  default_inventory_notes = coalesce(default_inventory_notes,
    'An inventory and condition report will be completed and signed by both parties at move-in and referenced at move-out to assess any deductions from the deposit.')
where id = 1;

-- Per-agreement schedule fields, copied from the defaults above at creation time.
alter table agreements
  add column if not exists notice_period text,
  add column if not exists renewal_terms text,
  add column if not exists maintenance_responsibility text,
  add column if not exists utilities_responsibility text,
  add column if not exists inventory_notes text;
