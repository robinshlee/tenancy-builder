import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSettings = {
  id: number;
  logo_url: string | null;
  letterhead_name: string | null;
  boilerplate_clauses: string | null;
  updated_at: string;
};

export async function getAppSettings(supabase: SupabaseClient): Promise<AppSettings> {
  const { data, error } = await supabase.from("app_settings").select().eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateAppSettings(
  supabase: SupabaseClient,
  input: { logo_url?: string | null; letterhead_name?: string | null; boilerplate_clauses?: string | null },
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
