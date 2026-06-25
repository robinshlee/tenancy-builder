create table if not exists landlords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  id_number text not null,
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
  id_number text not null,
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
  address text not null,
  unit_number text,
  city text,
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
  property_id uuid references properties(id),
  monthly_rental numeric(12,2) not null,
  deposit_amount numeric(12,2),
  payment_due_day integer default 1,
  lease_start date not null,
  lease_end date not null,
  status text not null default 'draft',
  special_conditions text,
  ai_special_conditions text,
  ai_special_conditions_source text,
  ai_special_conditions_confidence numeric,
  ai_special_conditions_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table agreements enable row level security;
drop policy if exists "agreements_v1_read" on agreements;
create policy "agreements_v1_read" on agreements for select using (true);
drop policy if exists "agreements_v1_write" on agreements;
create policy "agreements_v1_write" on agreements for all using (true) with check (true);

create table if not exists agreement_parties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agreement_id uuid references agreements(id) on delete cascade,
  party_type text not null,
  landlord_id uuid references landlords(id),
  tenant_id uuid references tenants(id),
  created_at timestamptz not null default now()
);
alter table agreement_parties enable row level security;
drop policy if exists "agreement_parties_v1_read" on agreement_parties;
create policy "agreement_parties_v1_read" on agreement_parties for select using (true);
drop policy if exists "agreement_parties_v1_write" on agreement_parties;
create policy "agreement_parties_v1_write" on agreement_parties for all using (true) with check (true);

create table if not exists clauses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  body text not null,
  is_standard boolean default true,
  created_at timestamptz not null default now()
);
alter table clauses enable row level security;
drop policy if exists "clauses_v1_read" on clauses;
create policy "clauses_v1_read" on clauses for select using (true);
drop policy if exists "clauses_v1_write" on clauses;
create policy "clauses_v1_write" on clauses for all using (true) with check (true);

create table if not exists agreement_clauses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agreement_id uuid references agreements(id) on delete cascade,
  clause_id uuid references clauses(id),
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table agreement_clauses enable row level security;
drop policy if exists "agreement_clauses_v1_read" on agreement_clauses;
create policy "agreement_clauses_v1_read" on agreement_clauses for select using (true);
drop policy if exists "agreement_clauses_v1_write" on agreement_clauses;
create policy "agreement_clauses_v1_write" on agreement_clauses for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into landlords (id, full_name, id_number, email, phone, address) values
  ('a1000000-0000-0000-0000-000000000001', 'Margaret Osei', 'GHA-19820314-001', 'margaret.osei@email.com', '+233244100001', '14 Cantonments Road, Accra'),
  ('a1000000-0000-0000-0000-000000000002', 'Kwame Boateng', 'GHA-19751122-002', 'kwame.boateng@email.com', '+233244100002', '5 Airport Residential, Accra'),
  ('a1000000-0000-0000-0000-000000000003', 'Abena Mensah', 'GHA-19900606-003', 'abena.mensah@email.com', '+233244100003', '22 East Legon Hills, Accra')
on conflict (id) do nothing;

insert into tenants (id, full_name, id_number, email, phone, current_address) values
  ('b1000000-0000-0000-0000-000000000001', 'Samuel Darko', 'GHA-19950210-011', 'samuel.darko@email.com', '+233244200001', '7 Tema Community 1'),
  ('b1000000-0000-0000-0000-000000000002', 'Priya Nair', 'IND-19920830-012', 'priya.nair@email.com', '+233244200002', '3 Labone Close, Accra'),
  ('b1000000-0000-0000-0000-000000000003', 'James Owusu', 'GHA-19881101-013', 'james.owusu@email.com', '+233244200003', '9 Spintex Road, Accra'),
  ('b1000000-0000-0000-0000-000000000004', 'Fatima Al-Hassan', 'GHA-19970415-014', 'fatima.alhassan@email.com', '+233244200004', '1 North Ridge Ave, Accra')
on conflict (id) do nothing;

insert into properties (id, address, unit_number, city, property_type, bedrooms, description) values
  ('c1000000-0000-0000-0000-000000000001', '45 Cantonments Crescent', 'Apt 3B', 'Accra', 'Apartment', 2, 'Modern 2-bedroom apartment with fitted kitchen and 24hr security'),
  ('c1000000-0000-0000-0000-000000000002', '12 Labone Street', null, 'Accra', 'Detached House', 3, '3-bedroom detached house with garden and garage'),
  ('c1000000-0000-0000-0000-000000000003', '88 Spintex Road', 'Suite 1A', 'Accra', 'Studio', 1, 'Self-contained studio apartment, tiled throughout')
on conflict (id) do nothing;

insert into agreements (id, property_id, monthly_rental, deposit_amount, payment_due_day, lease_start, lease_end, status, special_conditions) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 2500.00, 5000.00, 1, '2025-02-01', '2026-01-31', 'signed', 'Tenant is responsible for electricity and water bills. No pets allowed.'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 4200.00, 8400.00, 5, '2025-03-01', '2026-02-28', 'ready', 'Landlord to repaint exterior before handover. Lawn maintenance included.')
on conflict (id) do nothing;

insert into agreement_parties (agreement_id, party_type, landlord_id, tenant_id) values
  ('d1000000-0000-0000-0000-000000000001', 'landlord', 'a1000000-0000-0000-0000-000000000001', null),
  ('d1000000-0000-0000-0000-000000000001', 'tenant', null, 'b1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000002', 'landlord', 'a1000000-0000-0000-0000-000000000002', null),
  ('d1000000-0000-0000-0000-000000000002', 'tenant', null, 'b1000000-0000-0000-0000-000000000001');

insert into clauses (id, title, body, is_standard) values
  ('e1000000-0000-0000-0000-000000000001', 'Late Payment Penalty', 'Any rental payment received more than 5 days after the due date shall attract a penalty of 5% of the monthly rental amount.', true),
  ('e1000000-0000-0000-0000-000000000002', 'Property Condition on Vacating', 'The tenant shall return the property in the same condition as received, fair wear and tear excepted, failing which the cost of repairs shall be deducted from the deposit.', true),
  ('e1000000-0000-0000-0000-000000000003', 'Subletting Prohibited', 'The tenant shall not sublet the property or any part thereof without the prior written consent of the landlord.', true)
on conflict (id) do nothing;