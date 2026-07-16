-- Displayed in the top bar instead of email. Nullable since existing accounts
-- predate this field and won't have one until set by hand or a future signup.
alter table profiles add column if not exists full_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_name text;
  v_company_id uuid;
begin
  v_company_name := trim(coalesce(new.raw_user_meta_data->>'company_name', ''));

  if v_company_name <> '' then
    select id into v_company_id from companies where lower(name) = lower(v_company_name) limit 1;
    if v_company_id is null then
      insert into companies (name) values (v_company_name) returning id into v_company_id;
    end if;
  end if;

  insert into public.profiles (user_id, email, full_name, role, status, company_id)
  values (new.id, new.email, nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''), 'agent', 'pending', v_company_id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
