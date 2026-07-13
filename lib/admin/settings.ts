import type { SupabaseClient } from "@supabase/supabase-js";

export type ScheduleDefaults = {
  default_use_of_premises: string | null;
  default_renewal_terms: string | null;
  default_rent_payment_details: string | null;
  default_access_card_deposit_notes: string | null;
};

export type DocumentKind = "cover" | "body" | "schedule" | "signing";

export const DOCUMENT_KINDS: DocumentKind[] = ["cover", "body", "schedule", "signing"];

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  cover: "Cover page",
  body: "Body (legal clauses)",
  schedule: "Schedule",
  signing: "Signing page",
};

/** Column name prefixes vary slightly (cover_page_*, body_doc_*, schedule_page_*, signing_page_*). */
const DOCUMENT_COLUMN_PREFIX: Record<DocumentKind, string> = {
  cover: "cover_page",
  body: "body_doc",
  schedule: "schedule_page",
  signing: "signing_page",
};

export type AppSettings = ScheduleDefaults & {
  id: number;
  logo_url: string | null;
  letterhead_name: string | null;
  boilerplate_clauses: string | null;
  cover_page_url: string | null;
  cover_page_filename: string | null;
  cover_page_uploaded_at: string | null;
  body_doc_url: string | null;
  body_doc_filename: string | null;
  body_doc_uploaded_at: string | null;
  schedule_page_url: string | null;
  schedule_page_filename: string | null;
  schedule_page_uploaded_at: string | null;
  signing_page_url: string | null;
  signing_page_filename: string | null;
  signing_page_uploaded_at: string | null;
  document_order: DocumentKind[] | null;
  updated_at: string;
};

export function documentInfo(settings: AppSettings, kind: DocumentKind) {
  const prefix = DOCUMENT_COLUMN_PREFIX[kind];
  return {
    url: settings[`${prefix}_url` as keyof AppSettings] as string | null,
    filename: settings[`${prefix}_filename` as keyof AppSettings] as string | null,
    uploadedAt: settings[`${prefix}_uploaded_at` as keyof AppSettings] as string | null,
  };
}

export async function getAppSettings(supabase: SupabaseClient): Promise<AppSettings> {
  const { data, error } = await supabase.from("app_settings").select().eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateAppSettings(
  supabase: SupabaseClient,
  input: Partial<
    Pick<
      AppSettings,
      | "logo_url"
      | "letterhead_name"
      | "boilerplate_clauses"
      | "cover_page_url"
      | "cover_page_filename"
      | "cover_page_uploaded_at"
      | "body_doc_url"
      | "body_doc_filename"
      | "body_doc_uploaded_at"
      | "schedule_page_url"
      | "schedule_page_filename"
      | "schedule_page_uploaded_at"
      | "signing_page_url"
      | "signing_page_filename"
      | "signing_page_uploaded_at"
      | "document_order"
      | "default_use_of_premises"
      | "default_renewal_terms"
      | "default_rent_payment_details"
      | "default_access_card_deposit_notes"
    >
  >,
) {
  const { data, error } = await supabase
    .from("app_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data as AppSettings;
}

export async function uploadLogo(supabase: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logo-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("branding").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/png",
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}

/** Uploads a reference cover/body/schedule/signing document and returns its public URL. */
export async function uploadTemplateDocument(supabase: SupabaseClient, kind: DocumentKind, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${DOCUMENT_COLUMN_PREFIX[kind]}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("branding").upload(path, file, {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}

export function templateDocumentUpdate(
  kind: DocumentKind,
  url: string | null,
  filename: string | null,
  uploadedAt: string | null,
) {
  const prefix = DOCUMENT_COLUMN_PREFIX[kind];
  return {
    [`${prefix}_url`]: url,
    [`${prefix}_filename`]: filename,
    [`${prefix}_uploaded_at`]: uploadedAt,
  };
}
