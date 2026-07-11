# Intelligence Layer — Tenancy Builder

## Messy Input → Structured Data
Agents currently paste free-text landlord/tenant details from WhatsApp or email. v1 accepts clean form inputs. Later: paste raw text → auto-parse into structured fields.

## Auto-Structure Schema (parsed party block)
```json
{
  "full_name": "Margaret Osei",
  "identity_number": "GHA-19741203-00112",
  "email": "margaret.osei@email.com",
  "phone": "+233244000001",
  "source": "paste_parse_v1",
  "confidence": 0.91,
  "review_status": "unreviewed"
}
```

## Events to Track
- Agreement generated (duration, parties count, rent amount)
- Field edited after auto-parse (signals low-confidence extraction)
- PDF downloaded
- Agreement finalised

## Scoring Rules (rule-based first)
| Signal | Score adjustment |
|---|---|
| All mandatory fields present | +1.0 |
| Identity number matches expected format | +0.2 |
| End date > start date | +0.1 |
| Special conditions left blank | flag for review |

## What Gets Ranked
- Extraction confidence per parsed field (highlight low-confidence fields for manual check)

## v1 vs Later
**v1:** deterministic template assembly; no AI in the critical path. 
**Later:** GPT-assisted clause drafting; auto-parse pasted contact blocks; jurisdiction-aware clause suggestions stored with `source`, `confidence`, `review_status`.
