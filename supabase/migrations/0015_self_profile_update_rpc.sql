-- Lets a signed-in user update their own display name without opening a broad
-- self-update RLS policy on profiles (which would also let them set their own
-- role/status via a direct PostgREST call). Only full_name is exposed.
create or replace function update_own_full_name(p_full_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set full_name = nullif(trim(p_full_name), '')
  where user_id = auth.uid();
end;
$$;

grant execute on function update_own_full_name(text) to authenticated;
