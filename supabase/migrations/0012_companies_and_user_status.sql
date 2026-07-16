-- Multi-tenancy by company: users of the same company share landlords, tenants,
-- properties, property groups, and agreements. Also adds a profiles.status field
-- (pending/active/disabled) so new signups require admin approval and admins can
-- disable/re-enable accounts.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists companies_name_lower_idx on companies (lower(name));

alter table companies enable row level security;
drop policy if exists "companies_read" on companies;
create policy "companies_read" on companies for select using (auth.uid() is not null);
drop policy if exists "companies_admin_write" on companies;
create policy "companies_admin_write" on companies for all using (is_admin()) with check (is_admin());

-- Seed a default company and put every pre-existing user/row into it, so nobody
-- currently using the app loses access to their own data when this ships.
insert into companies (name)
select 'My Company'
where not exists (select 1 from companies where lower(name) = lower('My Company'));

alter table profiles
  add column if not exists company_id uuid references companies(id),
  add column if not exists status text not null default 'pending' check (status in ('pending', 'active', 'disabled'));

-- Existing accounts predate the approval workflow — grandfather them in as active.
update profiles set status = 'active' where status = 'pending';

update profiles
set company_id = (select id from companies where lower(name) = lower('My Company') limit 1)
where company_id is null;

drop policy if exists "profiles_admin_delete" on profiles;
create policy "profiles_admin_delete" on profiles for delete using (is_admin());

-- security definer so table RLS checks below don't recurse into profiles' own RLS.
create or replace function public.get_current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from profiles where user_id = auth.uid();
$$;

-- Add company_id to every company-scoped table and backfill from the owning row's
-- existing user_id (falling back to the default company for ownerless seed rows).
alter table landlords add column if not exists company_id uuid references companies(id);
alter table tenants add column if not exists company_id uuid references companies(id);
alter table properties add column if not exists company_id uuid references companies(id);
alter table property_groups add column if not exists company_id uuid references companies(id);
alter table agreements add column if not exists company_id uuid references companies(id);
alter table agreement_landlords add column if not exists company_id uuid references companies(id);
alter table agreement_tenants add column if not exists company_id uuid references companies(id);
alter table agreement_clauses add column if not exists company_id uuid references companies(id);

update landlords t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update tenants t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update properties t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update property_groups t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update agreements t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update agreement_landlords t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update agreement_tenants t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;
update agreement_clauses t set company_id = coalesce((select p.company_id from profiles p where p.user_id = t.user_id), (select id from companies where lower(name) = lower('My Company') limit 1)) where company_id is null;

-- Replace every owner-only RLS policy with a company-scoped one (admin still bypasses all).
drop policy if exists "landlords_owner_read" on landlords;
create policy "landlords_company_read" on landlords for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "landlords_owner_write" on landlords;
create policy "landlords_company_write" on landlords for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "tenants_owner_read" on tenants;
create policy "tenants_company_read" on tenants for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "tenants_owner_write" on tenants;
create policy "tenants_company_write" on tenants for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "properties_owner_read" on properties;
create policy "properties_company_read" on properties for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "properties_owner_write" on properties;
create policy "properties_company_write" on properties for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "property_groups_owner_read" on property_groups;
create policy "property_groups_company_read" on property_groups for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "property_groups_owner_write" on property_groups;
create policy "property_groups_company_write" on property_groups for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "agreements_owner_read" on agreements;
create policy "agreements_company_read" on agreements for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "agreements_owner_write" on agreements;
create policy "agreements_company_write" on agreements for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "agreement_landlords_owner_read" on agreement_landlords;
create policy "agreement_landlords_company_read" on agreement_landlords for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "agreement_landlords_owner_write" on agreement_landlords;
create policy "agreement_landlords_company_write" on agreement_landlords for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "agreement_tenants_owner_read" on agreement_tenants;
create policy "agreement_tenants_company_read" on agreement_tenants for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "agreement_tenants_owner_write" on agreement_tenants;
create policy "agreement_tenants_company_write" on agreement_tenants for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

drop policy if exists "agreement_clauses_owner_read" on agreement_clauses;
create policy "agreement_clauses_company_read" on agreement_clauses for select using (company_id = get_current_company_id() or is_admin());
drop policy if exists "agreement_clauses_owner_write" on agreement_clauses;
create policy "agreement_clauses_company_write" on agreement_clauses for all using (company_id = get_current_company_id() or is_admin()) with check (company_id = get_current_company_id() or is_admin());

-- New signups: resolve (or create) their company from the name entered at signup,
-- and start them as 'pending' until an admin approves them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_name text;
  v_company_id uuid;
begin
  v_company_name := trim(coalesce(new.raw_user_meta_data->>'company_name', ''));

  if v_company_name <> '' then
    select id into v_company_id from companies where lower(name) = lower(v_company_name) limit 1;
    if v_company_id is null then
      insert into companies (name) values (v_company_name) returning id into v_company_id;
    end if;
  end if;

  insert into public.profiles (user_id, email, role, status, company_id)
  values (new.id, new.email, 'agent', 'pending', v_company_id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
