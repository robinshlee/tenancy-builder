-- Property-centric restructuring:
--   - a property has exactly one landlord (a landlord can own many properties)
--   - properties can optionally belong to a group (e.g. a condo block with several units)
-- Columns are added nullable and backfilled so the currently-deployed app (which doesn't
-- know about them yet) keeps working untouched. NOT NULL constraints are deferred to a
-- later migration once the new UI is live and every property is guaranteed to carry one.

create table if not exists property_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  name text not null,
  address text,
  city text,
  created_at timestamptz not null default now()
);
alter table property_groups enable row level security;
drop policy if exists "property_groups_owner_read" on property_groups;
create policy "property_groups_owner_read" on property_groups for select using (auth.uid() = user_id);
drop policy if exists "property_groups_owner_write" on property_groups;
create policy "property_groups_owner_write" on property_groups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table properties add column if not exists group_id uuid references property_groups(id);
alter table properties add column if not exists landlord_id uuid references landlords(id);

-- Backfill landlord_id from each property's earliest agreement's landlord (the seed data,
-- and any real agreements created so far, already imply a single landlord per property).
update properties p
set landlord_id = al.landlord_id
from (
  select distinct on (a.property_id) a.property_id, al.landlord_id
  from agreements a
  join agreement_landlords al on al.agreement_id = a.id
  order by a.property_id, a.created_at asc
) al
where al.property_id = p.id
  and p.landlord_id is null;
