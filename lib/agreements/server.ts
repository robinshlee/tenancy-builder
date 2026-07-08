import type { SupabaseClient } from "@supabase/supabase-js";
import { appendAcceptedClauses, generateAgreementText } from "./text";
import type { AgreementFormInput, AgreementFull, PartyInput } from "./types";
import type { DraftedClause } from "./clauses";

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

async function resolveLandlords(supabase: SupabaseClient, landlords: PartyInput[]) {
  const resolved: { id: string; full_name: string; id_number: string; address: string | null }[] = [];
  for (const l of landlords) {
    if (l.id) {
      const { data, error } = await supabase.from("landlords").select().eq("id", l.id).single();
      if (error) throw error;
      resolved.push(data);
    } else {
      const { data, error } = await supabase
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
      resolved.push(data);
    }
  }
  return resolved;
}

async function resolveTenants(supabase: SupabaseClient, tenants: PartyInput[]) {
  const resolved: { id: string; full_name: string; id_number: string; current_address: string | null }[] = [];
  for (const t of tenants) {
    if (t.id) {
      const { data, error } = await supabase.from("tenants").select().eq("id", t.id).single();
      if (error) throw error;
      resolved.push(data);
    } else {
      const { data, error } = await supabase
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
      resolved.push(data);
    }
  }
  return resolved;
}

async function resolveProperty(supabase: SupabaseClient, property: AgreementFormInput["property"]) {
  if (property.id) {
    const { data, error } = await supabase.from("properties").select().eq("id", property.id).single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("properties")
    .insert({
      address: property.address,
      suburb: property.suburb || null,
      city: property.city || null,
      postal_code: property.postal_code || null,
      property_type: property.property_type || null,
      bedrooms: property.bedrooms ?? null,
      description: property.description || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createAgreement(supabase: SupabaseClient, input: AgreementFormInput) {
  const property = await resolveProperty(supabase, input.property);
  const landlords = await resolveLandlords(supabase, input.landlords);
  const tenants = await resolveTenants(supabase, input.tenants);

  const referenceNumber = await generateReferenceNumber(supabase);

  const generatedText = generateAgreementText({
    reference_number: referenceNumber,
    landlords,
    tenants: tenants.map((t) => ({ full_name: t.full_name, id_number: t.id_number, current_address: t.current_address })),
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
    .insert(landlords.map((l) => ({ agreement_id: agreement.id, landlord_id: l.id })));
  if (alError) throw alError;

  const { error: atError } = await supabase
    .from("agreement_tenants")
    .insert(tenants.map((t) => ({ agreement_id: agreement.id, tenant_id: t.id })));
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

  const property = await resolveProperty(supabase, input.property);
  const landlords = await resolveLandlords(supabase, input.landlords);
  const tenants = await resolveTenants(supabase, input.tenants);

  const { error: deleteLlError } = await supabase.from("agreement_landlords").delete().eq("agreement_id", id);
  if (deleteLlError) throw deleteLlError;
  const { error: alError } = await supabase
    .from("agreement_landlords")
    .insert(landlords.map((l) => ({ agreement_id: id, landlord_id: l.id })));
  if (alError) throw alError;

  const { error: deleteTlError } = await supabase.from("agreement_tenants").delete().eq("agreement_id", id);
  if (deleteTlError) throw deleteTlError;
  const { error: atError } = await supabase
    .from("agreement_tenants")
    .insert(tenants.map((t) => ({ agreement_id: id, tenant_id: t.id })));
  if (atError) throw atError;

  const acceptedClauses = existing.clauses.filter((c) => c.clause_text_review_status === "accepted").map((c) => c.clause_text);

  const generatedText = generateAgreementText({
    reference_number: existing.reference_number,
    landlords,
    tenants: tenants.map((t) => ({ full_name: t.full_name, id_number: t.id_number, current_address: t.current_address })),
    property,
    rental_amount: input.rental_amount,
    deposit_amount: input.deposit_amount,
    lease_start_date: input.lease_start_date,
    lease_end_date: input.lease_end_date,
    payment_due_day: input.payment_due_day,
    special_conditions: input.special_conditions,
  });

  const finalText = appendAcceptedClauses(generatedText, acceptedClauses);

  const { data: agreement, error: agreementError } = await supabase
    .from("agreements")
    .update({
      property_id: property.id,
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

export async function saveDraftedClauses(supabase: SupabaseClient, agreementId: string, clauses: DraftedClause[]) {
  if (clauses.length === 0) return;
  const { error } = await supabase.from("agreement_clauses").insert(
    clauses.map((c) => ({
      agreement_id: agreementId,
      clause_text: c.clause_text,
      clause_text_source: "openai/gpt-4o-mini",
      clause_text_confidence: c.confidence,
      clause_text_review_status: "unreviewed",
      accepted: false,
    })),
  );
  if (error) throw error;
}

async function rebuildGeneratedText(supabase: SupabaseClient, agreement: AgreementFull) {
  const acceptedClauses = agreement.clauses.filter((c) => c.clause_text_review_status === "accepted").map((c) => c.clause_text);

  const generatedText = generateAgreementText({
    reference_number: agreement.reference_number,
    landlords: agreement.landlords,
    tenants: agreement.tenants.map((t) => ({
      full_name: t.full_name,
      id_number: t.id_number,
      current_address: t.current_address,
    })),
    property: agreement.property,
    rental_amount: agreement.rental_amount,
    deposit_amount: agreement.deposit_amount,
    lease_start_date: agreement.lease_start_date,
    lease_end_date: agreement.lease_end_date,
    payment_due_day: agreement.payment_due_day,
    special_conditions: agreement.special_conditions,
  });

  return appendAcceptedClauses(generatedText, acceptedClauses);
}

export async function reviewClause(
  supabase: SupabaseClient,
  agreementId: string,
  clauseId: string,
  action: "accept" | "reject",
  editedText?: string,
) {
  const { error: clauseError } = await supabase
    .from("agreement_clauses")
    .update({
      clause_text_review_status: action === "accept" ? "accepted" : "rejected",
      accepted: action === "accept",
      ...(editedText ? { clause_text: editedText } : {}),
    })
    .eq("id", clauseId)
    .eq("agreement_id", agreementId);
  if (clauseError) throw clauseError;

  const agreement = await getAgreementFull(supabase, agreementId);
  if (!agreement) throw new Error("Agreement not found");

  const finalText = await rebuildGeneratedText(supabase, agreement);

  const { error: updateError } = await supabase.from("agreements").update({ generated_text: finalText }).eq("id", agreementId);
  if (updateError) throw updateError;

  return getAgreementFull(supabase, agreementId);
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
