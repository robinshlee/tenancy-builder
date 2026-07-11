import type { SupabaseClient } from "@supabase/supabase-js";

export type LandlordProfileInput = {
  full_name: string;
  id_number: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type TenantProfileInput = {
  full_name: string;
  id_number: string;
  phone?: string;
  email?: string;
  current_address?: string;
};

export type PropertyProfileInput = {
  address: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  property_type?: string;
  bedrooms?: number;
  description?: string;
  landlord_id: string;
  group_id?: string;
};

export type PropertyGroupInput = {
  name: string;
  address?: string;
  city?: string;
};

async function listTable(supabase: SupabaseClient, table: string) {
  const { data, error } = await supabase.from(table).select().order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getRow(supabase: SupabaseClient, table: string, id: string) {
  const { data, error } = await supabase.from(table).select().eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteRow(supabase: SupabaseClient, table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export const listLandlords = (supabase: SupabaseClient) => listTable(supabase, "landlords");
export const listTenants = (supabase: SupabaseClient) => listTable(supabase, "tenants");
export const listPropertyGroups = (supabase: SupabaseClient) => listTable(supabase, "property_groups");

export const getLandlord = (supabase: SupabaseClient, id: string) => getRow(supabase, "landlords", id);
export const getTenant = (supabase: SupabaseClient, id: string) => getRow(supabase, "tenants", id);
export const getProperty = (supabase: SupabaseClient, id: string) => getRow(supabase, "properties", id);
export const getPropertyGroup = (supabase: SupabaseClient, id: string) => getRow(supabase, "property_groups", id);

export async function listProperties(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, landlord:landlords(id, full_name, id_number), group:property_groups(id, name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    landlord: Array.isArray(p.landlord) ? (p.landlord[0] ?? null) : (p.landlord ?? null),
    group: Array.isArray(p.group) ? (p.group[0] ?? null) : (p.group ?? null),
  }));
}

export async function createLandlord(supabase: SupabaseClient, input: LandlordProfileInput) {
  const { data, error } = await supabase
    .from("landlords")
    .insert({
      full_name: input.full_name,
      id_number: input.id_number,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLandlord(supabase: SupabaseClient, id: string, input: LandlordProfileInput) {
  const { data, error } = await supabase
    .from("landlords")
    .update({
      full_name: input.full_name,
      id_number: input.id_number,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const deleteLandlord = (supabase: SupabaseClient, id: string) => deleteRow(supabase, "landlords", id);

export async function createTenant(supabase: SupabaseClient, input: TenantProfileInput) {
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      full_name: input.full_name,
      id_number: input.id_number,
      phone: input.phone || null,
      email: input.email || null,
      current_address: input.current_address || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTenant(supabase: SupabaseClient, id: string, input: TenantProfileInput) {
  const { data, error } = await supabase
    .from("tenants")
    .update({
      full_name: input.full_name,
      id_number: input.id_number,
      phone: input.phone || null,
      email: input.email || null,
      current_address: input.current_address || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const deleteTenant = (supabase: SupabaseClient, id: string) => deleteRow(supabase, "tenants", id);

export async function createProperty(supabase: SupabaseClient, input: PropertyProfileInput) {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      address: input.address,
      suburb: input.suburb || null,
      city: input.city || null,
      postal_code: input.postal_code || null,
      property_type: input.property_type || null,
      bedrooms: input.bedrooms ?? null,
      description: input.description || null,
      landlord_id: input.landlord_id,
      group_id: input.group_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(supabase: SupabaseClient, id: string, input: PropertyProfileInput) {
  const { data, error } = await supabase
    .from("properties")
    .update({
      address: input.address,
      suburb: input.suburb || null,
      city: input.city || null,
      postal_code: input.postal_code || null,
      property_type: input.property_type || null,
      bedrooms: input.bedrooms ?? null,
      description: input.description || null,
      landlord_id: input.landlord_id,
      group_id: input.group_id || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const deleteProperty = (supabase: SupabaseClient, id: string) => deleteRow(supabase, "properties", id);

export async function createPropertyGroup(supabase: SupabaseClient, input: PropertyGroupInput) {
  const { data, error } = await supabase
    .from("property_groups")
    .insert({ name: input.name, address: input.address || null, city: input.city || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePropertyGroup(supabase: SupabaseClient, id: string, input: PropertyGroupInput) {
  const { data, error } = await supabase
    .from("property_groups")
    .update({ name: input.name, address: input.address || null, city: input.city || null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const deletePropertyGroup = (supabase: SupabaseClient, id: string) => deleteRow(supabase, "property_groups", id);
