# Agentic Layer

## Risk Levels & Actions

### Low Risk — Auto (no approval needed)
| Action | Tool | Notes |
|---|---|---|
| Draft agreement text from form inputs | `generate_agreement_text` | pure template, no side-effects |
| Suggest special conditions | `draft_clauses` | AI output stored as 'unreviewed'; not merged until accepted |
| Validate field rules (date range, deposit check) | `validate_agreement_inputs` | runs server-side on submit |

### Medium Risk — Agent reviews before saving
| Action | Tool | Notes |
|---|---|---|
| Merge accepted clauses into `generated_text` | `merge_clauses` | agent clicks Accept first |
| Update agreement status | `update_agreement_status` | e.g. draft → active |

### High Risk — Explicit confirmation required
| Action | Tool | Notes |
|---|---|---|
| Delete an agreement | `delete_agreement` | confirmation dialog; logged |

### Critical — Human only (no automation)
- Legal filing or submission to any authority
- Charging or billing any party
- Sending any document externally (v1 has no send; added later with approval step)

## Named Tools Only
No `run_any` or `eval` calls. Each tool is an explicit, named server-side function.

## Audit Log Fields
Every meaningful action writes: `agreement_id`, `action`, `actor` (user_id or 'anonymous'), `before_state`, `after_state`, `timestamp`.

## v1 vs Later
- **v1:** generate_agreement_text + validate_agreement_inputs only
- **Next:** draft_clauses (AI), merge_clauses
- **Later:** email send (high risk, approval required), e-signature trigger
