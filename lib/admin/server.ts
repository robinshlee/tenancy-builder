import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "agent" | "admin";
export type Status = "pending" | "active" | "disabled";

export type Profile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  status: Status;
  company_id: string | null;
  company: { id: string; name: string } | null;
  created_at: string;
};

export type CurrentProfileSummary = {
  role: Role | null;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
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

export async function getCurrentCompanyId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("company_id").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data?.company_id ?? null;
}

export async function listProfiles(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, role, status, company_id, created_at, company:companies(id, name)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    company: Array.isArray(p.company) ? (p.company[0] ?? null) : (p.company ?? null),
  }));
}

/** Combined lookup for the top bar / page title: role, display name, and company name. */
export async function getCurrentProfileSummary(supabase: SupabaseClient): Promise<CurrentProfileSummary> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { role: null, email: null, full_name: null, company_name: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("role, email, full_name, company:companies(name)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;

  const company = Array.isArray(data?.company) ? data?.company[0] : data?.company;
  return {
    role: (data?.role as Role | undefined) ?? null,
    email: data?.email ?? user.email ?? null,
    full_name: data?.full_name ?? null,
    company_name: company?.name ?? null,
  };
}

export async function countPendingProfiles(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export async function setProfileRole(supabase: SupabaseClient, userId: string, role: Role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("user_id", userId);
  if (error) throw error;
}

export async function setProfileStatus(supabase: SupabaseClient, userId: string, status: Status) {
  const { error } = await supabase.from("profiles").update({ status }).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
  if (error) throw error;
}
