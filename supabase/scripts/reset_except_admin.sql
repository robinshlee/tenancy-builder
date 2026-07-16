-- Wipes all tenancy data and every non-admin user, keeping admin accounts intact.
-- This is IRREVERSIBLE. Run only in the Supabase SQL editor when you actually want
-- a clean slate. Not part of the migrations folder on purpose — this is a one-off
-- maintenance script, not a schema change.

begin;

-- Business data, children first to respect foreign keys.
delete from agreement_clauses;
delete from agreement_tenants;
delete from agreement_landlords;
delete from agreements;
delete from properties;
delete from property_groups;
delete from tenants;
delete from landlords;

-- Non-admin users: deleting from auth.users cascades to their profiles row
-- automatically (profiles.user_id references auth.users(id) on delete cascade).
delete from auth.users
where id in (select user_id from profiles where role <> 'admin');

commit;

-- Left untouched on purpose:
--   * companies                — admin profiles still reference their company_id
--   * app_settings             — logo/letterhead/schedule defaults/template uploads
--   * profiles where role='admin', and their auth.users rows
-- If you also want those cleared, say so and I'll add a script for them.
