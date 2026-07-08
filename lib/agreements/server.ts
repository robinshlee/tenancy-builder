import type { SupabaseClient } from "@supabase/supabase-js";
import { generateAgreementText } from "./text";
import type { AgreementFormInput, AgreementFull } from "./types";

export async function generateReferenceNumber(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TA-${year}-`;
  const { data, error } = await supabase
    .from("agreements")
    .select("reference_number")
    .like("reference_number", `${prefix}%`)
    .order("reference_number", { ascending: false })
    .limit(1);

  if (error) throw error;

  let next = 1;
  if (data && data.length > 0) {
    const last = data[0].reference_number as string;
    const n = parseInt(last.slice(prefix.length), 10);
    if (!Number.isNaN(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function createAgreement(supabase: SupabaseClient, input: AgreementFormInput) {
  const { data: property, error: propError } = await supabase
    .from("properties")
    .insert({
      address: input.property.address,
      suburb: input.property.suburb || null,
      city: input.property.city || null,
      postal_code: input.property.postal_code || null,
      property_type: input.property.property_type || null,
      bedrooms: input.property.bedrooms ?? null,
      description: input.property.description || null,
    })
    .select()
    .single();
  if (propError) throw propError;

  const { data: landlords, error: landlordError } = await supabase
    .from("landlords")
    .insert(
      input.landlords.map((l) => ({
        full_name: l.full_name,
        id_number: l.id_number,
        phone: l.phone || null,
        email: l.email || null,
        address: l.address || null,
      })),
    )
    .select();
  if (landlordError) throw landlordError;

  const { data: tenants, error: tenantError } = await supabase
    .from("tenants")
    .insert(
      input.tenants.map((t) => ({
        full_name: t.full_name,
        id_number: t.id_number,
        phone: t.phone || null,
        email: t.email || null,
        current_address: t.address || null,
      })),
    )
    .select();
  if (tenantError) throw tenantError;

  const referenceNumber = await generateReferenceNumber(supabase);

  const generatedText = generateAgreementText({
    reference_number: referenceNumber,
    landlords: landlords!,
    tenants: tenants!.map((t) => ({ full_name: t.full_name, id_number: t.id_number, current_address: t.current_address })),
    property,
    rental_amount: input.rental_amount,
    deposit_amount: input.deposit_amount,
    lease_start_date: input.lease_start_date,
    lease_end_date: input.lease_end_date,
    payment_due_day: input.payment_due_day,
    special_conditions: input.special_conditions,
  });

  const { data: agreement, error: agreementError } = await supabase
    .from("agreements")
    .insert({
      reference_number: referenceNumber,
      property_id: property.id,
      rental_amount: input.rental_amount,
      deposit_amount: input.deposit_amount ?? null,
      lease_start_date: input.lease_start_date,
      lease_end_date: input.lease_end_date,
      payment_due_day: input.payment_due_day,
      special_conditions: input.special_conditions || null,
      generated_text: generatedText,
      status: "draft",
    })
    .select()
    .single();
  if (agreementError) throw agreementError;

  const { error: alError } = await supabase
    .from("agreement_landlords")
    .insert(landlords!.map((l) => ({ agreement_id: agreement.id, landlord_id: l.id })));
  if (alError) throw alError;

  const { error: atError } = await supabase
    .from("agreement_tenants")
    .insert(tenants!.map((t) => ({ agreement_id: agreement.id, tenant_id: t.id })));
  if (atError) throw atError;

  return agreement;
}

export async function getAgreementFull(supabase: SupabaseClient, id: string): Promise<AgreementFull | null> {
  const { data: agreement, error } = await supabase.from("agreements").select().eq("id", id).maybeSingle();
  if (error) throw error;
  if (!agreement) return null;

  const { data: property, error: propError } = await supabase
    .from("properties")
    .select()
    .eq("id", agreement.property_id)
    .single();
  if (propError) throw propError;

  const { data: landlordLinks, error: llError } = await supabase
    .from("agreement_landlords")
    .select("landlord_id, landlords(*)")
    .eq("agreement_id", id);
  if (llError) throw llError;

  const { data: tenantLinks, error: tlError } = await supabase
    .from("agreement_tenants")
    .select("tenant_id, tenants(*)")
    .eq("agreement_id", id);
  if (tlError) throw tlError;

  const { data: clauses, error: clauseError } = await supabase
    .from("agreement_clauses")
    .select()
    .eq("agreement_id", id)
    .order("created_at", { ascending: true });
  if (clauseError) throw clauseError;

  return {
    ...agreement,
    property,
    landlords: (landlordLinks ?? []).map((l: any) => l.landlords).filter(Boolean),
    tenants: (tenantLinks ?? []).map((t: any) => t.tenants).filter(Boolean),
    clauses: clauses ?? [],
  };
}

export async function updateAgreement(supabase: SupabaseClient, id: string, input: AgreementFormInput) {
  const existing = await getAgreementFull(supabase, id);
  if (!existing) throw new Error("Agreement not found");

  const { error: propError } = await supabase
    .from("properties")
    .update({
      address: input.property.address,
      suburb: input.property.suburb || null,
      city: input.property.city || null,
      postal_code: input.property.postal_code || null,
      property_type: input.property.property_type || null,
      bedrooms: input.property.bedrooms ?? null,
      description: input.property.description || null,
    })
    .eq("id", existing.property.id);
  if (propError) throw propError;

  for (let i = 0; i < input.landlords.length; i++) {
    const l = input.landlords[i];
    const existingLandlord = existing.landlords[i];
    if (existingLandlord) {
      const { error } = await supabase
        .from("landlords")
        .update({
          full_name: l.full_name,
          id_number: l.id_number,
          phone: l.phone || null,
          email: l.email || null,
          address: l.address || null,
        })
        .eq("id", existingLandlord.id);
      if (error) throw error;
    } else {
      const { data: newLandlord, error } = await supabase
        .from("landlords")
        .insert({
          full_name: l.full_name,
          id_number: l.id_number,
          phone: l.phone || null,
          email: l.email || null,
          address: l.address || null,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: linkError } = await supabase
        .from("agreement_landlords")
        .insert({ agreement_id: id, landlord_id: newLandlord.id });
      if (linkError) throw linkError;
    }
  }

  for (let i = 0; i < input.tenants.length; i++) {
    const t = input.tenants[i];
    const existingTenant = existing.tenants[i];
    if (existingTenant) {
      const { error } = await supabase
        .from("tenants")
        .update({
          full_name: t.full_name,
          id_number: t.id_number,
          phone: t.phone || null,
          email: t.email || null,
          current_address: t.address || null,
        })
        .eq("id", existingTenant.id);
      if (error) throw error;
    } else {
      const { data: newTenant, error } = await supabase
        .from("tenants")
        .insert({
          full_name: t.full_name,
          id_number: t.id_number,
          phone: t.phone || null,
          email: t.email || null,
          current_address: t.address || null,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: linkError } = await supabase
        .from("agreement_tenants")
        .insert({ agreement_id: id, tenant_id: newTenant.id });
      if (linkError) throw linkError;
    }
  }

  const { data: refreshedProperty, error: refreshedPropError } = await supabase
    .from("properties")
    .select()
    .eq("id", existing.property.id)
    .single();
  if (refreshedPropError) throw refreshedPropError;

  const { data: landlordLinks } = await supabase
    .from("agreement_landlords")
    .select("landlords(*)")
    .eq("agreement_id", id);
  const { data: tenantLinks } = await supabase
    .from("agreement_tenants")
    .select("tenants(*)")
    .eq("agreement_id", id);

  const acceptedClauses = existing.clauses.filter((c) => c.clause_text_review_status === "accepted").map((c) => c.clause_text);

  const generatedText = generateAgreementText({
    reference_number: existing.reference_number,
    landlords: (landlordLinks ?? []).map((l: any) => l.landlords),
    tenants: (tenantLinks ?? []).map((t: any) => ({
      full_name: t.tenants.full_name,
      id_number: t.tenants.id_number,
      current_address: t.tenants.current_address,
    })),
    property: refreshedProperty,
    rental_amount: input.rental_amount,
    deposit_amount: input.deposit_amount,
    lease_start_date: input.lease_start_date,
    lease_end_date: input.lease_end_date,
    payment_due_day: input.payment_due_day,
    special_conditions: input.special_conditions,
  });

  const { appendAcceptedClauses } = await import("./text");
  const finalText = appendAcceptedClauses(generatedText, acceptedClauses);

  const { data: agreement, error: agreementError } = await supabase
    .from("agreements")
    .update({
      rental_amount: input.rental_amount,
      deposit_amount: input.deposit_amount ?? null,
      lease_start_date: input.lease_start_date,
      lease_end_date: input.lease_end_date,
      payment_due_day: input.payment_due_day,
      special_conditions: input.special_conditions || null,
      generated_text: finalText,
    })
    .eq("id", id)
    .select()
    .single();
  if (agreementError) throw agreementError;

  return agreement;
}

export async function deleteAgreement(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("agreements").delete().eq("id", id);
  if (error) throw error;
}

export async function listAgreements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("agreements")
    .select("id, reference_number, rental_amount, lease_start_date, lease_end_date, status, created_at, property_id")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const propertyIds = Array.from(new Set((data ?? []).map((a) => a.property_id).filter(Boolean)));
  const { data: properties, error: propError } = propertyIds.length
    ? await supabase.from("properties").select("id, address, city").in("id", propertyIds)
    : { data: [], error: null };
  if (propError) throw propError;

  const propertyMap = new Map((properties ?? []).map((p) => [p.id, p]));

  return (data ?? []).map((a) => ({
    ...a,
    property: propertyMap.get(a.property_id) ?? null,
  }));
}
