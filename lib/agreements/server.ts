import type { SupabaseClient } from "@supabase/supabase-js";
import { appendAcceptedClauses, generateAgreementText } from "./text";
import type { AgreementFormInput, AgreementFull, PartyInput, ScheduleFields, ScheduleInput } from "./types";
import type { DraftedClause } from "./clauses";

/** A known, safe-to-display validation failure (as opposed to an unexpected DB/infra error). */
export class AgreementInputError extends Error {}

async function getTemplateSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_settings")
    .select(
      "letterhead_name, boilerplate_clauses, default_notice_period, default_renewal_terms, default_maintenance_responsibility, default_utilities_responsibility, default_inventory_notes",
    )
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return {
    letterhead_name: data?.letterhead_name ?? null,
    boilerplate_clauses: data?.boilerplate_clauses ?? null,
    default_notice_period: data?.default_notice_period ?? null,
    default_renewal_terms: data?.default_renewal_terms ?? null,
    default_maintenance_responsibility: data?.default_maintenance_responsibility ?? null,
    default_utilities_responsibility: data?.default_utilities_responsibility ?? null,
    default_inventory_notes: data?.default_inventory_notes ?? null,
  };
}

/** Per-agreement schedule values fall back to the admin's configured defaults when omitted. */
function resolveSchedule(
  input: ScheduleInput | undefined,
  defaults: {
    default_notice_period: string | null;
    default_renewal_terms: string | null;
    default_maintenance_responsibility: string | null;
    default_utilities_responsibility: string | null;
    default_inventory_notes: string | null;
  },
  fallback?: ScheduleFields,
): ScheduleFields {
  return {
    notice_period: input?.notice_period?.trim() || fallback?.notice_period || defaults.default_notice_period,
    renewal_terms: input?.renewal_terms?.trim() || fallback?.renewal_terms || defaults.default_renewal_terms,
    maintenance_responsibility:
      input?.maintenance_responsibility?.trim() ||
      fallback?.maintenance_responsibility ||
      defaults.default_maintenance_responsibility,
    utilities_responsibility:
      input?.utilities_responsibility?.trim() || fallback?.utilities_responsibility || defaults.default_utilities_responsibility,
    inventory_notes: input?.inventory_notes?.trim() || fallback?.inventory_notes || defaults.default_inventory_notes,
  };
}

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

async function resolveLandlord(supabase: SupabaseClient, l: PartyInput) {
  if (l.id) {
    const { data, error } = await supabase.from("landlords").select().eq("id", l.id).single();
    if (error) throw error;
    return data as { id: string; full_name: string; id_number: string; address: string | null };
  }
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
  return data as { id: string; full_name: string; id_number: string; address: string | null };
}

async function resolveTenants(supabase: SupabaseClient, tenants: PartyInput[]) {
  return Promise.all(
    tenants.map(async (t) => {
      if (t.id) {
        const { data, error } = await supabase.from("tenants").select().eq("id", t.id).single();
        if (error) throw error;
        return data as { id: string; full_name: string; id_number: string; current_address: string | null };
      }
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
      return data as { id: string; full_name: string; id_number: string; current_address: string | null };
    }),
  );
}

/**
 * A property has exactly one landlord. Selecting an existing property resolves its fixed
 * landlord_id; creating a new property requires (and persists) a landlord alongside it.
 */
async function resolvePropertyAndLandlord(supabase: SupabaseClient, input: AgreementFormInput) {
  if (input.property.id) {
    const { data: property, error } = await supabase.from("properties").select().eq("id", input.property.id).single();
    if (error) throw error;
    if (!property.landlord_id) {
      throw new AgreementInputError("This property has no assigned landlord. Add one via Edit Property first.");
    }
    const { data: landlord, error: landlordError } = await supabase
      .from("landlords")
      .select()
      .eq("id", property.landlord_id)
      .single();
    if (landlordError) throw landlordError;
    return { property, landlord };
  }

  if (!input.landlord) {
    throw new AgreementInputError("Landlord is required when creating a new property.");
  }
  const landlord = await resolveLandlord(supabase, input.landlord);

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      address: input.property.address,
      suburb: input.property.suburb || null,
      city: input.property.city || null,
      postal_code: input.property.postal_code || null,
      property_type: input.property.property_type || null,
      bedrooms: input.property.bedrooms ?? null,
      description: input.property.description || null,
      landlord_id: landlord.id,
      group_id: input.property.group_id || null,
    })
    .select()
    .single();
  if (error) throw error;

  return { property, landlord };
}

export async function createAgreement(supabase: SupabaseClient, input: AgreementFormInput) {
  const [{ property, landlord }, tenants, referenceNumber, templateSettings] = await Promise.all([
    resolvePropertyAndLandlord(supabase, input),
    resolveTenants(supabase, input.tenants),
    generateReferenceNumber(supabase),
    getTemplateSettings(supabase),
  ]);

  const schedule = resolveSchedule(input.schedule, templateSettings);

  const generatedText = generateAgreementText({
    reference_number: referenceNumber,
    landlords: [landlord],
    tenants: tenants.map((t) => ({ full_name: t.full_name, id_number: t.id_number, current_address: t.current_address })),
    property,
    rental_amount: input.rental_amount,
    deposit_amount: input.deposit_amount,
    lease_start_date: input.lease_start_date,
    lease_end_date: input.lease_end_date,
    payment_due_day: input.payment_due_day,
    special_conditions: input.special_conditions,
    letterhead_name: templateSettings.letterhead_name,
    boilerplate_clauses: templateSettings.boilerplate_clauses,
    ...schedule,
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
      ...schedule,
    })
    .select()
    .single();
  if (agreementError) throw agreementError;

  const [{ error: alError }, { error: atError }] = await Promise.all([
    supabase.from("agreement_landlords").insert([{ agreement_id: agreement.id, landlord_id: landlord.id }]),
    supabase.from("agreement_tenants").insert(tenants.map((t) => ({ agreement_id: agreement.id, tenant_id: t.id }))),
  ]);
  if (alError) throw alError;
  if (atError) throw atError;

  return agreement;
}

export async function getAgreementFull(supabase: SupabaseClient, id: string): Promise<AgreementFull | null> {
  const { data: agreement, error } = await supabase.from("agreements").select().eq("id", id).maybeSingle();
  if (error) throw error;
  if (!agreement) return null;

  const [propertyResult, landlordLinksResult, tenantLinksResult, clausesResult] = await Promise.all([
    supabase.from("properties").select().eq("id", agreement.property_id).single(),
    supabase.from("agreement_landlords").select("landlord_id, landlords(*)").eq("agreement_id", id),
    supabase.from("agreement_tenants").select("tenant_id, tenants(*)").eq("agreement_id", id),
    supabase.from("agreement_clauses").select().eq("agreement_id", id).order("created_at", { ascending: true }),
  ]);
  if (propertyResult.error) throw propertyResult.error;
  if (landlordLinksResult.error) throw landlordLinksResult.error;
  if (tenantLinksResult.error) throw tenantLinksResult.error;
  if (clausesResult.error) throw clausesResult.error;

  return {
    ...agreement,
    property: propertyResult.data,
    landlords: (landlordLinksResult.data ?? []).map((l: any) => l.landlords).filter(Boolean),
    tenants: (tenantLinksResult.data ?? []).map((t: any) => t.tenants).filter(Boolean),
    clauses: clausesResult.data ?? [],
  };
}

export async function updateAgreement(supabase: SupabaseClient, id: string, input: AgreementFormInput) {
  const existing = await getAgreementFull(supabase, id);
  if (!existing) throw new Error("Agreement not found");

  const [{ property, landlord }, tenants, templateSettings] = await Promise.all([
    resolvePropertyAndLandlord(supabase, input),
    resolveTenants(supabase, input.tenants),
    getTemplateSettings(supabase),
  ]);

  await Promise.all([
    (async () => {
      const { error: deleteLlError } = await supabase.from("agreement_landlords").delete().eq("agreement_id", id);
      if (deleteLlError) throw deleteLlError;
      const { error: alError } = await supabase
        .from("agreement_landlords")
        .insert([{ agreement_id: id, landlord_id: landlord.id }]);
      if (alError) throw alError;
    })(),
    (async () => {
      const { error: deleteTlError } = await supabase.from("agreement_tenants").delete().eq("agreement_id", id);
      if (deleteTlError) throw deleteTlError;
      const { error: atError } = await supabase
        .from("agreement_tenants")
        .insert(tenants.map((t) => ({ agreement_id: id, tenant_id: t.id })));
      if (atError) throw atError;
    })(),
  ]);

  const acceptedClauses = existing.clauses.filter((c) => c.clause_text_review_status === "accepted").map((c) => c.clause_text);
  const schedule = resolveSchedule(input.schedule, templateSettings, existing);

  const generatedText = generateAgreementText({
    reference_number: existing.reference_number,
    landlords: [landlord],
    tenants: tenants.map((t) => ({ full_name: t.full_name, id_number: t.id_number, current_address: t.current_address })),
    property,
    rental_amount: input.rental_amount,
    deposit_amount: input.deposit_amount,
    lease_start_date: input.lease_start_date,
    lease_end_date: input.lease_end_date,
    payment_due_day: input.payment_due_day,
    special_conditions: input.special_conditions,
    letterhead_name: templateSettings.letterhead_name,
    boilerplate_clauses: templateSettings.boilerplate_clauses,
    ...schedule,
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
      ...schedule,
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
  const templateSettings = await getTemplateSettings(supabase);

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
    letterhead_name: templateSettings.letterhead_name,
    boilerplate_clauses: templateSettings.boilerplate_clauses,
    notice_period: agreement.notice_period,
    renewal_terms: agreement.renewal_terms,
    maintenance_responsibility: agreement.maintenance_responsibility,
    utilities_responsibility: agreement.utilities_responsibility,
    inventory_notes: agreement.inventory_notes,
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
    .select(
      "id, reference_number, rental_amount, lease_start_date, lease_end_date, status, created_at, property:properties(id, address, city)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((a: any) => ({
    ...a,
    property: Array.isArray(a.property) ? (a.property[0] ?? null) : (a.property ?? null),
  }));
}
