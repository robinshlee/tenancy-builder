-- Lets a just-signed-up (and not-yet-approved) visitor trigger an admin-notification
-- email without needing read access to the profiles table themselves: this function
-- runs as its owner (security definer), bypassing RLS, and only ever returns admin
-- emails — nothing else about any profile.
create or replace function public.get_admin_emails()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select email from profiles where role = 'admin' and email is not null;
$$;

grant execute on function public.get_admin_emails() to anon, authenticated;
