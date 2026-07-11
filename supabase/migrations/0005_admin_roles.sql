-- Admin role: a profiles table tied 1:1 to auth.users, plus an is_admin() helper used to
-- let admins bypass the owner-only RLS policies everywhere (admin sees/edits all agents' data).

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'agent' check (role in ('agent', 'admin')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

-- security definer so the RLS check below doesn't recurse into profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles for select using (auth.uid() = user_id or is_admin());
drop policy if exists "profiles_admin_write" on profiles;
create policy "profiles_admin_write" on profiles for update using (is_admin()) with check (is_admin());
-- Row creation happens only via the trigger below (security definer, bypasses RLS);
-- no insert/delete policy is granted to end users.

-- Auto-create a profile row (default role 'agent') whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, role) values (new.id, 'agent')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already existed before this migration.
insert into profiles (user_id, role)
select id, 'agent' from auth.users
on conflict (user_id) do nothing;

-- Let admins bypass the owner-only restriction on every existing table.
drop policy if exists "landlords_owner_read" on landlords;
create policy "landlords_owner_read" on landlords for select using (auth.uid() = user_id or is_admin());
drop policy if exists "landlords_owner_write" on landlords;
create policy "landlords_owner_write" on landlords for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "tenants_owner_read" on tenants;
create policy "tenants_owner_read" on tenants for select using (auth.uid() = user_id or is_admin());
drop policy if exists "tenants_owner_write" on tenants;
create policy "tenants_owner_write" on tenants for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "properties_owner_read" on properties;
create policy "properties_owner_read" on properties for select using (auth.uid() = user_id or is_admin());
drop policy if exists "properties_owner_write" on properties;
create policy "properties_owner_write" on properties for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "property_groups_owner_read" on property_groups;
create policy "property_groups_owner_read" on property_groups for select using (auth.uid() = user_id or is_admin());
drop policy if exists "property_groups_owner_write" on property_groups;
create policy "property_groups_owner_write" on property_groups for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "agreements_owner_read" on agreements;
create policy "agreements_owner_read" on agreements for select using (auth.uid() = user_id or is_admin());
drop policy if exists "agreements_owner_write" on agreements;
create policy "agreements_owner_write" on agreements for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "agreement_landlords_owner_read" on agreement_landlords;
create policy "agreement_landlords_owner_read" on agreement_landlords for select using (auth.uid() = user_id or is_admin());
drop policy if exists "agreement_landlords_owner_write" on agreement_landlords;
create policy "agreement_landlords_owner_write" on agreement_landlords for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "agreement_tenants_owner_read" on agreement_tenants;
create policy "agreement_tenants_owner_read" on agreement_tenants for select using (auth.uid() = user_id or is_admin());
drop policy if exists "agreement_tenants_owner_write" on agreement_tenants;
create policy "agreement_tenants_owner_write" on agreement_tenants for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

drop policy if exists "agreement_clauses_owner_read" on agreement_clauses;
create policy "agreement_clauses_owner_read" on agreement_clauses for select using (auth.uid() = user_id or is_admin());
drop policy if exists "agreement_clauses_owner_write" on agreement_clauses;
create policy "agreement_clauses_owner_write" on agreement_clauses for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

-- Bootstrap: this migration creates the very first RLS policy that lets *any* admin exist,
-- so at least one account needs promoting by hand after it runs (there's no admin yet to do
-- it through the app). Run once, directly against the database, not committed here:
--   update profiles set role = 'admin' where user_id = '<your-auth-user-id>';
