// Plain data module (no "use client") — safe to import from Server Components.
// Values exported from a "use client" file resolve to `undefined` when read directly
// in server code (only JSX element usage crosses that boundary), so shared constants
// used by both the AgreementForm client component and its server-rendered pages live here.

export type PartyInput = {
  id?: string;
  full_name: string;
  id_number: string;
  phone: string;
  email: string;
  address: string;
};

export type PropertyInput = {
  id?: string;
  address: string;
  suburb: string;
  city: string;
  postal_code: string;
  property_type: string;
  bedrooms: string;
  description: string;
  group_id: string;
};

export type ExistingLandlord = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type ExistingTenant = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
  email: string | null;
  current_address: string | null;
};

export type ExistingPropertyGroup = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
};

export type ExistingProperty = {
  id: string;
  address: string;
  suburb: string | null;
  city: string | null;
  postal_code: string | null;
  property_type: string | null;
  bedrooms: number | null;
  description: string | null;
  group_id: string | null;
  landlord_id: string | null;
  landlord: { id: string; full_name: string; id_number: string } | null;
};

export type ScheduleInput = {
  notice_period: string;
  renewal_terms: string;
  maintenance_responsibility: string;
  utilities_responsibility: string;
  inventory_notes: string;
};

export type AgreementFormValues = {
  property: PropertyInput;
  landlord: PartyInput;
  tenants: PartyInput[];
  rental_amount: string;
  deposit_amount: string;
  lease_start_date: string;
  lease_end_date: string;
  payment_due_day: string;
  special_conditions: string;
  schedule: ScheduleInput;
};

export const emptyParty: PartyInput = { full_name: "", id_number: "", phone: "", email: "", address: "" };

export const emptyProperty: PropertyInput = {
  address: "",
  suburb: "",
  city: "",
  postal_code: "",
  property_type: "",
  bedrooms: "",
  description: "",
  group_id: "",
};

export const emptySchedule: ScheduleInput = {
  notice_period: "",
  renewal_terms: "",
  maintenance_responsibility: "",
  utilities_responsibility: "",
  inventory_notes: "",
};

export const emptyFormValues: AgreementFormValues = {
  property: { ...emptyProperty },
  landlord: { ...emptyParty },
  tenants: [{ ...emptyParty }],
  rental_amount: "",
  deposit_amount: "",
  lease_start_date: "",
  lease_end_date: "",
  payment_due_day: "1",
  special_conditions: "",
  schedule: { ...emptySchedule },
};
