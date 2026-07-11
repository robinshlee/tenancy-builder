import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "agent" | "admin";

export type Profile = {
  user_id: string;
  email: string | null;
  role: Role;
  created_at: string;
};

export async function getCurrentRole(supabase: SupabaseClient): Promise<Role | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return (data?.role as Role | undefined) ?? null;
}

export async function isCurrentUserAdmin(supabase: SupabaseClient): Promise<boolean> {
  return (await getCurrentRole(supabase)) === "admin";
}

export async function listProfiles(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select().order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function setProfileRole(supabase: SupabaseClient, userId: string, role: Role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("user_id", userId);
  if (error) throw error;
}
