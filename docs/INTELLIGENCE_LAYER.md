# Intelligence Layer

## Messy Input → Structured Data
Agent types free-form party names, IDs, and conditions. The form enforces structure before saving:

```json
{
  "agreement_id": "d4000000-...",
  "landlords": [{"full_name": "Margaret Osei", "id_number": "GHA-8821045-3"}],
  "tenants": [{"full_name": "James Boateng", "id_number": "GHA-9900112-7"}],
  "property": {"address": "14 Cantonments Road", "city": "Accra"},
  "rental_amount": 3500.00,
  "lease_start_date": "2025-02-01",
  "lease_end_date": "2026-01-31",
  "payment_due_day": 1
}
```

## Events to Track
- Agreement created
- Agreement previewed
- PDF downloaded
- Clause suggested (AI)
- Clause accepted / rejected

## Scoring Rules (rule-based first)
| Check | Flag |
|---|---|
| lease_end < lease_start | Error — block submit |
| deposit < rental_amount | Warning — unusually low deposit |
| duration > 24 months | Info — confirm long lease |
| ID number format invalid | Warning |

These rules run in the server route before saving. No AI needed.

## AI: Special Condition Drafting (later)
- Trigger: agreement saved
- Input: property_type, lease duration, rental_amount, agent's free-text notes
- Output: 3 suggested special conditions stored in `agreement_clauses` with `source`, `confidence`, `review_status = 'unreviewed'`
- Agent sees suggestions in preview with Accept / Edit / Reject buttons
- Accepted clauses are appended to `generated_text`

## v1 vs Later
- **v1:** rule-based validation only; no AI calls
- **Next:** AI clause suggestions (server-side, key never in browser)
- **Later:** AI risk scoring per agreement; clause library trained on past agreements
