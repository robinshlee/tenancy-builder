import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateOwnFullName(supabase: SupabaseClient, fullName: string) {
  const { error } = await supabase.rpc("update_own_full_name", { p_full_name: fullName });
  if (error) throw error;
}
