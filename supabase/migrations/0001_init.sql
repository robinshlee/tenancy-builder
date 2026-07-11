create table if not exists landlords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  identity_number text not null,
  email text,
  phone text,
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
  identity_number text not null,
  email text,
  phone text,
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
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text,
  property_type text,
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
  property_id uuid references properties(id),
  monthly_rent numeric(12,2) not null,
  deposit_amount numeric(12,2),
  lease_start_date date not null,
  lease_end_date date not null,
  status text not null default 'draft',
  special_conditions text,
  generated_document_html text,
  generated_document_html_source text,
  generated_document_html_confidence numeric,
  generated_document_html_review_status text default 'unreviewed',
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

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  table_name text not null,
  record_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into landlords (id, full_name, identity_number, email, phone, address) values
  ('a1000000-0000-0000-0000-000000000001', 'Margaret Osei', 'GHA-19741203-00112', 'margaret.osei@email.com', '+233244000001', '14 Cantonments Road, Accra'),
  ('a1000000-0000-0000-0000-000000000002', 'Kwame Asante', 'GHA-19680415-00334', 'kwame.asante@email.com', '+233244000002', '7 Independence Ave, Kumasi'),
  ('a1000000-0000-0000-0000-000000000003', 'Linda Mensah', 'GHA-19800901-00556', 'linda.mensah@email.com', '+233244000003', '3 Spintex Road, Accra')
on conflict (id) do nothing;

insert into tenants (id, full_name, identity_number, email, phone, current_address) values
  ('b2000000-0000-0000-0000-000000000001', 'David Kuffour', 'GHA-19900605-00778', 'david.kuffour@email.com', '+233244100001', '22 Ring Road, Accra'),
  ('b2000000-0000-0000-0000-000000000002', 'Ama Boateng', 'GHA-19950212-00990', 'ama.boateng@email.com', '+233244100002', '5 Dansoman Highway, Accra'),
  ('b2000000-0000-0000-0000-000000000003', 'Emmanuel Tetteh', 'GHA-19881120-01122', 'e.tetteh@email.com', '+233244100003', '10 Tema Station Rd, Tema'),
  ('b2000000-0000-0000-0000-000000000004', 'Abena Frimpong', 'GHA-19920730-01344', 'abena.f@email.com', '+233244100004', '1 Labone Crescent, Accra')
on conflict (id) do nothing;

insert into properties (id, address_line1, address_line2, city, postal_code, property_type, description) values
  ('c3000000-0000-0000-0000-000000000001', '45 Osu Badu Street', 'Osu', 'Accra', 'GA-144', 'Apartment', '2-bedroom apartment, 2nd floor'),
  ('c3000000-0000-0000-0000-000000000002', '8 Adenta Housing Down', null, 'Accra', 'GA-375', 'Townhouse', '3-bedroom townhouse with garden'),
  ('c3000000-0000-0000-0000-000000000003', '19 Patase Estate', 'Kumasi', 'Kumasi', 'AK-212', 'Detached House', '4-bedroom detached house')
on conflict (id) do nothing;

insert into agreements (id, property_id, monthly_rent, deposit_amount, lease_start_date, lease_end_date, status, special_conditions) values
  ('d4000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 1800.00, 3600.00, '2025-02-01', '2026-01-31', 'finalised', 'Tenant responsible for electricity bills.'),
  ('d4000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002', 2500.00, 5000.00, '2025-03-01', '2026-02-28', 'draft', null),
  ('d4000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 3200.00, 6400.00, '2025-04-01', '2026-03-31', 'finalised', 'No pets allowed.')
on conflict (id) do nothing;

insert into agreement_landlords (agreement_id, landlord_id) values
  ('d4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003')
on conflict do nothing;

insert into agreement_tenants (agreement_id, tenant_id) values
  ('d4000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000004')
on conflict do nothing;