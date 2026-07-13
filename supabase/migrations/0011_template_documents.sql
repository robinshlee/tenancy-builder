-- Extends the single "cover page" reference upload to all four document parts
-- (cover, body, schedule, signing), plus a display order for the admin's own
-- reference when assembling/printing the four uploaded documents.
alter table app_settings
  add column if not exists schedule_page_url text,
  add column if not exists schedule_page_filename text,
  add column if not exists schedule_page_uploaded_at timestamptz,
  add column if not exists body_doc_url text,
  add column if not exists body_doc_filename text,
  add column if not exists body_doc_uploaded_at timestamptz,
  add column if not exists signing_page_url text,
  add column if not exists signing_page_filename text,
  add column if not exists signing_page_uploaded_at timestamptz,
  add column if not exists document_order text[];

update app_settings set
  document_order = coalesce(document_order, array['cover', 'body', 'schedule', 'signing'])
where id = 1;
