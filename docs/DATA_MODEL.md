# Data Model — Tenancy Builder

## landlords
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable; owner-scoped at lock-down |
| full_name | text | |
| id_number | text | national ID / passport |
| email | text | |
| phone | text | |
| address | text | |
| created_at | timestamptz | |

## tenants
Same shape as landlords plus `current_address text`.

## properties
| Field | Type |
|---|---|
| id | uuid PK |
| user_id | uuid |
| address | text |
| unit_number | text |
| city | text |
| property_type | text |
| bedrooms | integer |
| description | text |

## agreements
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| property_id | uuid FK → properties | |
| monthly_rental | numeric(12,2) | |
| deposit_amount | numeric(12,2) | |
| payment_due_day | integer | 1–28 |
| lease_start | date | |
| lease_end | date | |
| status | text | draft / ready / signed |
| special_conditions | text | agent-written |
| ai_special_conditions | text | **AI field** |
| ai_special_conditions_source | text | model + prompt version |
| ai_special_conditions_confidence | numeric | 0–1 |
| ai_special_conditions_review_status | text | unreviewed / accepted / rejected |

## agreement_parties
| Field | Type |
|---|---|
| agreement_id | uuid FK → agreements |
| party_type | text (landlord/tenant) |
| landlord_id | uuid FK → landlords (nullable) |
| tenant_id | uuid FK → tenants (nullable) |

## clauses
`id, user_id, title text, body text, is_standard boolean`

## agreement_clauses
`id, agreement_id FK, clause_id FK, sort_order integer`

## audit_logs
`id, user_id, action text, object_type text, object_id uuid, payload jsonb, created_at`

## RLS
All tables: open v1 policies (select/all = true). Lock-down sprint replaces with `auth.uid() = user_id`.
