# Data Model

## landlords
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner scope at lock-down |
| full_name | text NOT NULL | |
| id_number | text NOT NULL | national ID / passport |
| phone | text | |
| email | text | |
| address | text | |
| created_at | timestamptz | |

## tenants
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| full_name | text NOT NULL | |
| id_number | text NOT NULL | |
| phone | text | |
| email | text | |
| current_address | text | |
| created_at | timestamptz | |

## properties
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| address | text NOT NULL | |
| suburb | text | |
| city | text | |
| postal_code | text | |
| property_type | text | Apartment / House / Commercial |
| bedrooms | integer | |
| description | text | |
| created_at | timestamptz | |

## agreements
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| reference_number | text NOT NULL | e.g. TA-2025-001 |
| property_id | uuid → properties | |
| rental_amount | numeric(12,2) NOT NULL | |
| deposit_amount | numeric(12,2) | |
| lease_start_date | date NOT NULL | |
| lease_end_date | date NOT NULL | |
| payment_due_day | integer default 1 | day of month rent is due |
| special_conditions | text | agent free-text additions |
| generated_text | text | full assembled agreement copy |
| status | text default 'draft' | draft / active / signed / expired |
| created_at | timestamptz | |

## agreement_landlords (junction)
`agreement_id → agreements`, `landlord_id → landlords` — supports multiple landlords per agreement.

## agreement_tenants (junction)
`agreement_id → agreements`, `tenant_id → tenants` — supports multiple tenants per agreement.

## agreement_clauses (AI-generated)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| agreement_id | uuid → agreements | |
| clause_text | text NOT NULL | the suggested clause |
| clause_text_source | text | e.g. 'openai/gpt-4o' |
| clause_text_confidence | numeric | 0–1 |
| clause_text_review_status | text default 'unreviewed' | unreviewed / accepted / rejected |
| accepted | boolean default false | |
| created_at | timestamptz | |

## RLS
All tables: permissive v1 policies (select + all) so the demo runs without login. Lock-down sprint replaces with `auth.uid() = user_id`.
