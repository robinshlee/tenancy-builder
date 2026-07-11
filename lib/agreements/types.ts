export type Landlord = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type Tenant = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
  email: string | null;
  current_address: string | null;
};

export type Property = {
  id: string;
  address: string;
  suburb: string | null;
  city: string | null;
  postal_code: string | null;
  property_type: string | null;
  bedrooms: number | null;
  description: string | null;
  landlord_id: string | null;
  group_id: string | null;
};

export type PropertyGroup = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  created_at: string;
};

export type Agreement = {
  id: string;
  reference_number: string;
  property_id: string;
  rental_amount: number;
  deposit_amount: number | null;
  lease_start_date: string;
  lease_end_date: string;
  payment_due_day: number;
  special_conditions: string | null;
  generated_text: string | null;
  status: string;
  created_at: string;
};

export type AgreementClause = {
  id: string;
  agreement_id: string;
  clause_text: string;
  clause_text_source: string | null;
  clause_text_confidence: number | null;
  clause_text_review_status: string;
  accepted: boolean;
  created_at: string;
};

export type AgreementFull = Agreement & {
  property: Property;
  landlords: Landlord[];
  tenants: Tenant[];
  clauses: AgreementClause[];
};

export type PartyInput = {
  id?: string;
  full_name: string;
  id_number: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type PropertyInputData = {
  id?: string;
  address: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  property_type?: string;
  bedrooms?: number;
  description?: string;
  group_id?: string;
};

export type AgreementFormInput = {
  property: PropertyInputData;
  // Only used when property.id is not set (i.e. a brand new property is being created
  // inline). When an existing property is selected its landlord_id is authoritative.
  landlord?: PartyInput;
  tenants: PartyInput[];
  rental_amount: number;
  deposit_amount?: number;
  lease_start_date: string;
  lease_end_date: string;
  payment_due_day: number;
  special_conditions?: string;
};
