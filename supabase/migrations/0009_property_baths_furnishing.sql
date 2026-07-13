-- Property details shown on the edit form: bathroom count and furnishing status.
alter table properties
  add column if not exists bathrooms integer,
  add column if not exists furnishing text;
