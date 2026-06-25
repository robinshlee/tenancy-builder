# Intelligence Layer — Tenancy Builder

## Messy Inputs
- Free-text special conditions typed ad hoc per deal
- Agents forget standard protective clauses
- Property type + duration vary — correct clause set is not obvious

## Auto-Structure Target (JSON)
```json
{
  "agreement_id": "uuid",
  "suggested_clauses": [
    {
      "title": "Pet Policy",
      "body": "No pets permitted without prior written consent.",
      "source": "gpt-4o / clause-suggest-v1",
      "confidence": 0.91,
      "review_status": "unreviewed"
    }
  ]
}
```

## Events That Trigger Suggestions
- Agreement created with `property_type` and `lease_end - lease_start > 180 days`
- Agent leaves `special_conditions` blank

## Scoring Rules (rule-based first)
| Signal | Score boost |
|---|---|
| property_type = 'Apartment' | +10 pet/noise clauses |
| duration > 12 months | +10 renewal-option clause |
| deposit > 2× rent | +10 deposit-return clause |

Scores are 0–100; anything < 60 is flagged for mandatory review.

## v1 vs Later
- **v1:** no AI; agent types special conditions manually
- **Next:** AI drafts suggestions stored with confidence + review_status; agent accepts/edits/rejects before saving
- **Later:** fine-tuned on agent's accepted clauses; jurisdiction-aware suggestions
