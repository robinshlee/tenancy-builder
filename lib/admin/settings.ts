import type { SupabaseClient } from "@supabase/supabase-js";

export type ScheduleDefaults = {
  default_notice_period: string | null;
  default_renewal_terms: string | null;
  default_maintenance_responsibility: string | null;
  default_utilities_responsibility: string | null;
  default_inventory_notes: string | null;
};

export type AppSettings = ScheduleDefaults & {
  id: number;
  logo_url: string | null;
  letterhead_name: string | null;
  boilerplate_clauses: string | null;
  cover_page_url: string | null;
  cover_page_filename: string | null;
  cover_page_uploaded_at: string | null;
  updated_at: string;
};

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
      | "default_notice_period"
      | "default_renewal_terms"
      | "default_maintenance_responsibility"
      | "default_utilities_responsibility"
      | "default_inventory_notes"
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

export async function uploadCoverPage(supabase: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `cover-page-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("branding").upload(path, file, {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}
