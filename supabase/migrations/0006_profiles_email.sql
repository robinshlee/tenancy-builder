-- Denormalize email onto profiles so the admin user-management screen can list users
-- without needing to expose the auth schema through PostgREST.
alter table profiles add column if not exists email text;

update profiles p set email = u.email
from auth.users u
where u.id = p.user_id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, role) values (new.id, new.email, 'agent')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
