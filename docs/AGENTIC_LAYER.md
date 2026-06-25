# Agentic Layer — Tenancy Builder

## Risk Classification

| Action | Risk | Approval |
|---|---|---|
| Draft special conditions from property context | Low | Auto-draft, agent reviews |
| Suggest clauses from library | Low | Auto-suggest |
| Set agreement status → Ready | Medium | One-click confirm |
| Set agreement status → Signed | Medium | One-click confirm |
| Delete agreement | High | Explicit confirm dialog |
| Send agreement to tenant by email | High | Agent approval + preview |
| Refund / financial actions | Critical | Human-only (out of scope v1) |

## Named Tools (v1 → later)
- `draft_special_conditions(agreement_id)` — LLM call, returns suggestion JSON (later)
- `suggest_clauses(property_type, duration_days)` — rule-based match against clause library (next)
- `set_agreement_status(agreement_id, new_status)` — DB update, logged (next)
- `export_agreement_pdf(agreement_id)` — render + download (v1)

## Audit Log Fields
`action | object_type | object_id | payload (before/after) | user_id | created_at`

Every status change, delete, and AI acceptance is logged.

## Flow
Recommend → Draft → Agent Review → Accept/Edit → Persist → Audit

## v1
No autonomous actions. All writes are direct agent form submissions. Agentic tools added post-auth.
