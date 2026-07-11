create table if not exists landlords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  id_number text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);
alter table landlords enable row level security;
drop policy if exists "landlords_v1_read" on landlords;
create policy "landlords_v1_read" on landlords for select using (true);
drop policy if exists "landlords_v1_write" on landlords;
create policy "landlords_v1_write" on landlords for all using (true) with check (true);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  id_number text not null,
  phone text,
  email text,
  current_address text,
  created_at timestamptz not null default now()
);
alter table tenants enable row level security;
drop policy if exists "tenants_v1_read" on tenants;
create policy "tenants_v1_read" on tenants for select using (true);
drop policy if exists "tenants_v1_write" on tenants;
create policy "tenants_v1_write" on tenants for all using (true) with check (true);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  address text not null,
  suburb text,
  city text,
  postal_code text,
  property_type text,
  bedrooms integer,
  description text,
  created_at timestamptz not null default now()
);
alter table properties enable row level security;
drop policy if exists "properties_v1_read" on properties;
create policy "properties_v1_read" on properties for select using (true);
drop policy if exists "properties_v1_write" on properties;
create policy "properties_v1_write" on properties for all using (true) with check (true);

create table if not exists agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  reference_number text not null,
  property_id uuid references properties(id),
  rental_amount numeric(12,2) not null,
  deposit_amount numeric(12,2),
  lease_start_date date not null,
  lease_end_date date not null,
  payment_due_day integer default 1,
  special_conditions text,
  generated_text text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
alter table agreements enable row level security;
drop policy if exists "agreements_v1_read" on agreements;
create policy "agreements_v1_read" on agreements for select using (true);
drop policy if exists "agreements_v1_write" on agreements;
create policy "agreements_v1_write" on agreements for all using (true) with check (true);

create table if not exists agreement_landlords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agreement_id uuid references agreements(id) on delete cascade,
  landlord_id uuid references landlords(id),
  created_at timestamptz not null default now()
);
alter table agreement_landlords enable row level security;
drop policy if exists "agreement_landlords_v1_read" on agreement_landlords;
create policy "agreement_landlords_v1_read" on agreement_landlords for select using (true);
drop policy if exists "agreement_landlords_v1_write" on agreement_landlords;
create policy "agreement_landlords_v1_write" on agreement_landlords for all using (true) with check (true);

create table if not exists agreement_tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agreement_id uuid references agreements(id) on delete cascade,
  tenant_id uuid references tenants(id),
  created_at timestamptz not null default now()
);
alter table agreement_tenants enable row level security;
drop policy if exists "agreement_tenants_v1_read" on agreement_tenants;
create policy "agreement_tenants_v1_read" on agreement_tenants for select using (true);
drop policy if exists "agreement_tenants_v1_write" on agreement_tenants;
create policy "agreement_tenants_v1_write" on agreement_tenants for all using (true) with check (true);

create table if not exists agreement_clauses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agreement_id uuid references agreements(id) on delete cascade,
  clause_text text not null,
  clause_text_source text,
  clause_text_confidence numeric,
  clause_text_review_status text default 'unreviewed',
  accepted boolean default false,
  created_at timestamptz not null default now()
);
alter table agreement_clauses enable row level security;
drop policy if exists "agreement_clauses_v1_read" on agreement_clauses;
create policy "agreement_clauses_v1_read" on agreement_clauses for select using (true);
drop policy if exists "agreement_clauses_v1_write" on agreement_clauses;
create policy "agreement_clauses_v1_write" on agreement_clauses for all using (true) with check (true);

insert into landlords (id, full_name, id_number, phone, email, address) values
  ('a1000000-0000-0000-0000-000000000001', 'Margaret Osei', 'GHA-8821045-3', '+233 24 400 1111', 'margaret.osei@email.com', '14 Cantonments Road, Accra'),
  ('a1000000-0000-0000-0000-000000000002', 'Kweku Asante', 'GHA-7712034-1', '+233 20 900 2222', 'kweku.asante@email.com', '7 Airport Residential, Accra'),
  ('a1000000-0000-0000-0000-000000000003', 'Abena Mensah', 'GHA-6603021-9', '+233 55 300 3333', 'abena.mensah@email.com', '3 Tema Community 5, Tema')
on conflict (id) do nothing;

insert into tenants (id, full_name, id_number, phone, email, current_address) values
  ('b2000000-0000-0000-0000-000000000001', 'James Boateng', 'GHA-9900112-7', '+233 26 511 4444', 'james.boateng@email.com', '22 Labone Crescent, Accra'),
  ('b2000000-0000-0000-0000-000000000002', 'Ama Darko', 'GHA-8801023-5', '+233 54 622 5555', 'ama.darko@email.com', '9 Dansoman Highway, Accra'),
  ('b2000000-0000-0000-0000-000000000003', 'Kofi Agyeman', 'GHA-7702034-3', '+233 23 733 6666', 'kofi.agyeman@email.com', '5 East Legon Hills, Accra'),
  ('b2000000-0000-0000-0000-000000000004', 'Efua Sarpong', 'GHA-6603045-1', '+233 50 844 7777', 'efua.sarpong@email.com', '18 Haatso Estate, Accra')
on conflict (id) do nothing;

insert into properties (id, address, suburb, city, postal_code, property_type, bedrooms, description) values
  ('c3000000-0000-0000-0000-000000000001', '14 Cantonments Road', 'Cantonments', 'Accra', 'GA-040', 'Apartment', 3, 'Modern 3-bedroom apartment with parking'),
  ('c3000000-0000-0000-0000-000000000002', '7 Airport Residential Avenue', 'Airport Residential', 'Accra', 'GA-015', 'House', 4, '4-bedroom detached house, fully gated'),
  ('c3000000-0000-0000-0000-000000000003', '3 Tema Community 5 Street', 'Community 5', 'Tema', 'TM-001', 'Apartment', 2, '2-bedroom apartment, ground floor')
on conflict (id) do nothing;

insert into agreements (id, reference_number, property_id, rental_amount, deposit_amount, lease_start_date, lease_end_date, payment_due_day, status, generated_text) values
  ('d4000000-0000-0000-0000-000000000001', 'TA-2024-001', 'c3000000-0000-0000-0000-000000000001', 3500.00, 7000.00, '2024-02-01', '2025-01-31', 1, 'active', 'TENANCY AGREEMENT — TA-2024-001 — 14 Cantonments Road — Tenant: James Boateng — Landlord: Margaret Osei — Rent: GHS 3,500/month — 1 Feb 2024 to 31 Jan 2025'),
  ('d4000000-0000-0000-0000-000000000002', 'TA-2024-002', 'c3000000-0000-0000-0000-000000000002', 5800.00, 11600.00, '2024-03-15', '2025-03-14', 15, 'active', 'TENANCY AGREEMENT — TA-2024-002 — 7 Airport Residential Avenue — Tenant: Ama Darko — Landlord: Kweku Asante — Rent: GHS 5,800/month — 15 Mar 2024 to 14 Mar 2025'),
  ('d4000000-0000-0000-0000-000000000003', 'TA-2024-003', 'c3000000-0000-0000-0000-000000000003', 1800.00, 3600.00, '2024-06-01', '2025-05-31', 1, 'draft', 'TENANCY AGREEMENT — TA-2024-003 — 3 Tema Community 5 Street — Tenant: Efua Sarpong — Landlord: Abena Mensah — Rent: GHS 1,800/month — 1 Jun 2024 to 31 May 2025')
on conflict (id) do nothing;

insert into agreement_landlords (agreement_id, landlord_id) values
  ('d4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003');

insert into agreement_tenants (agreement_id, tenant_id) values
  ('d4000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000004');