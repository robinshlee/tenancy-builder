-- Singleton settings row: admin-uploaded branding (logo) + boilerplate legal clauses used
-- on every generated agreement's cover page / schedule. Readable by any authenticated
-- agent (needed to render the PDF), writable by admin only.
create table if not exists app_settings (
  id integer primary key default 1 check (id = 1),
  logo_url text,
  letterhead_name text,
  boilerplate_clauses text,
  updated_at timestamptz not null default now()
);
insert into app_settings (id) values (1) on conflict (id) do nothing;

alter table app_settings enable row level security;
drop policy if exists "app_settings_read" on app_settings;
create policy "app_settings_read" on app_settings for select using (auth.uid() is not null);
drop policy if exists "app_settings_admin_write" on app_settings;
create policy "app_settings_admin_write" on app_settings for update using (is_admin()) with check (is_admin());

-- Public-read storage bucket for the letterhead/logo image; only admins may upload.
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists "branding_public_read" on storage.objects;
create policy "branding_public_read" on storage.objects for select using (bucket_id = 'branding');
drop policy if exists "branding_admin_write" on storage.objects;
create policy "branding_admin_write" on storage.objects for insert with check (bucket_id = 'branding' and is_admin());
drop policy if exists "branding_admin_update" on storage.objects;
create policy "branding_admin_update" on storage.objects for update using (bucket_id = 'branding' and is_admin());
drop policy if exists "branding_admin_delete" on storage.objects;
create policy "branding_admin_delete" on storage.objects for delete using (bucket_id = 'branding' and is_admin());
