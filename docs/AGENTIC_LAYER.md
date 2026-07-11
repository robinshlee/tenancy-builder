# Agentic Layer — Tenancy Builder

## Risk Classification

### Low — auto-execute (no approval needed)
- **draft_agreement**: assemble agreement HTML from DB record and template
- **tag_status**: set agreement status to `draft` on creation
- **log_action**: write to audit_logs on any create/update/delete

### Medium — light approval (agent confirms before execution)
- **finalise_agreement**: change status from `draft` → `finalised` (triggers PDF lock)
- **update_rent_amount**: edit financial terms on an existing agreement

### High — always approval
- **send_agreement_to_parties**: email PDF to landlord and tenant *(future)*

### Critical — human only
- **delete_agreement**: permanent removal of a signed agreement
- Any action that alters identity numbers after finalisation

## Named Tools (approved list)
| Tool | Action |
|---|---|
| `assemble_document` | merge agreement fields into HTML template |
| `export_pdf` | render HTML → PDF and return download URL |
| `write_audit_log` | insert row into audit_logs |
| `send_email` *(later)* | send PDF attachment to named recipient |

## Audit Log Fields
`id, user_id, action, table_name, record_id, payload (jsonb), created_at`

## v1
Only `assemble_document`, `export_pdf`, and `write_audit_log` are active. All others are future.
