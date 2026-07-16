import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using Supabase's Secret API key — bypasses every RLS policy, same
 * power as the legacy service_role key but individually revocable without rotating
 * the whole project's JWT secret. Only ever import this from server-side code (API
 * routes, server actions), never from a "use client" file or anything shipped to
 * the browser. Used exclusively for operations the anon/authenticated keys can't
 * do, like deleting an auth.users account outright.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set — cannot perform this action.");
  }
  return createSupabaseClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
