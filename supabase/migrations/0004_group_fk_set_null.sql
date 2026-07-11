-- Deleting a property group should just ungroup its units, not block the delete.
-- (properties.landlord_id intentionally stays NO ACTION — a landlord with
-- assigned properties should not be deletable out from under them.)
alter table properties drop constraint if exists properties_group_id_fkey;
alter table properties
  add constraint properties_group_id_fkey
  foreign key (group_id) references property_groups(id) on delete set null;
