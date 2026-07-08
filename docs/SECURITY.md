# Security

## Secret Handling
- Supabase service-role key and OpenAI key stored only in Vercel environment variables
- Never referenced in any client-side file or `NEXT_PUBLIC_` variable
- All AI calls made from `/api` server routes; browser receives only the result

## Permission Model (v1 — demo phase)
- All tables have permissive RLS (select + all with `using (true)`) so the app is demoable without login
- This is intentional and temporary — clearly documented for lock-down sprint

## Permission Model (lock-down sprint)
- Supabase Auth added; `user_id` set to `auth.uid()` on all new writes
- All permissive policies replaced with `auth.uid() = user_id`
- Seeded demo rows remain readable (user_id = null excluded or handled by a public-demo flag)

## Approved Tools Rule
- Agentic actions use only the named tools listed in `AGENTIC_LAYER.md`
- No `eval`, no `run_any`, no dynamic SQL construction from user input
- All DB writes go through Supabase typed client with parameterised queries

## Audit Principle
- Every agreement create / update / delete writes an audit entry
- Audit rows are insert-only (no update/delete policy on audit table)
- Agent cannot delete their own audit trail

## Stop Points
- If e-signature or payment integration is added: get a human security review before shipping
- If personally identifiable data (national ID numbers) is exported to third-party services: legal review required
