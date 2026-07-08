-- Sprint 5: Lock It Down — replace permissive v1 policies with per-agent isolation.
-- user_id defaults to auth.uid() so application inserts don't need to set it explicitly;
-- Postgres fills the default before RLS `with check` evaluates the row.
-- Seeded demo rows (user_id is null) become invisible to everyone once this lands,
-- since `auth.uid() = user_id` is never true against a null column.

alter table landlords alter column user_id set default auth.uid();
drop policy if exists "landlords_v1_read" on landlords;
drop policy if exists "landlords_v1_write" on landlords;
create policy "landlords_owner_read" on landlords for select using (auth.uid() = user_id);
create policy "landlords_owner_write" on landlords for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table tenants alter column user_id set default auth.uid();
drop policy if exists "tenants_v1_read" on tenants;
drop policy if exists "tenants_v1_write" on tenants;
create policy "tenants_owner_read" on tenants for select using (auth.uid() = user_id);
create policy "tenants_owner_write" on tenants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table properties alter column user_id set default auth.uid();
drop policy if exists "properties_v1_read" on properties;
drop policy if exists "properties_v1_write" on properties;
create policy "properties_owner_read" on properties for select using (auth.uid() = user_id);
create policy "properties_owner_write" on properties for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table agreements alter column user_id set default auth.uid();
drop policy if exists "agreements_v1_read" on agreements;
drop policy if exists "agreements_v1_write" on agreements;
create policy "agreements_owner_read" on agreements for select using (auth.uid() = user_id);
create policy "agreements_owner_write" on agreements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table agreement_landlords alter column user_id set default auth.uid();
drop policy if exists "agreement_landlords_v1_read" on agreement_landlords;
drop policy if exists "agreement_landlords_v1_write" on agreement_landlords;
create policy "agreement_landlords_owner_read" on agreement_landlords for select using (auth.uid() = user_id);
create policy "agreement_landlords_owner_write" on agreement_landlords for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table agreement_tenants alter column user_id set default auth.uid();
drop policy if exists "agreement_tenants_v1_read" on agreement_tenants;
drop policy if exists "agreement_tenants_v1_write" on agreement_tenants;
create policy "agreement_tenants_owner_read" on agreement_tenants for select using (auth.uid() = user_id);
create policy "agreement_tenants_owner_write" on agreement_tenants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table agreement_clauses alter column user_id set default auth.uid();
drop policy if exists "agreement_clauses_v1_read" on agreement_clauses;
drop policy if exists "agreement_clauses_v1_write" on agreement_clauses;
create policy "agreement_clauses_owner_read" on agreement_clauses for select using (auth.uid() = user_id);
create policy "agreement_clauses_owner_write" on agreement_clauses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
