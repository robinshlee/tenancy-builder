# Data Model — Tenancy Builder

## landlords
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable until lock-down |
| full_name | text NOT NULL | |
| identity_number | text NOT NULL | passport / national ID |
| email | text | |
| phone | text | |
| address | text | |
| created_at | timestamptz | |

## tenants
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| full_name | text NOT NULL | |
| identity_number | text NOT NULL | |
| email | text | |
| phone | text | |
| current_address | text | |
| created_at | timestamptz | |

## properties
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| address_line1 | text NOT NULL | |
| address_line2 | text | |
| city | text NOT NULL | |
| postal_code | text | |
| property_type | text | Apartment / House / Townhouse |
| description | text | |
| created_at | timestamptz | |

## agreements
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| property_id | uuid FK → properties | |
| monthly_rent | numeric(12,2) NOT NULL | |
| deposit_amount | numeric(12,2) | |
| lease_start_date | date NOT NULL | |
| lease_end_date | date NOT NULL | |
| status | text | draft / finalised |
| special_conditions | text | |
| generated_document_html | text | **AI field** |
| generated_document_html_source | text | template_id or 'ai_clause_v1' |
| generated_document_html_confidence | numeric | 0–1 |
| generated_document_html_review_status | text | unreviewed / approved / rejected |
| created_at | timestamptz | |

## agreement_landlords *(join)*
agreement_id → agreements, landlord_id → landlords

## agreement_tenants *(join)*
agreement_id → agreements, tenant_id → tenants

## audit_logs
action text, table_name text, record_id uuid, payload jsonb, user_id uuid, created_at

## RLS
- v1: all tables have permissive open SELECT + ALL policies (demo-first).
- Sprint 5: replaced with `auth.uid() = user_id` owner-scoped policies.
