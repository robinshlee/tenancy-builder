import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTenants } from "@/lib/profiles/server";
import { TenantsList } from "@/app/components/TenantsList";
import { AddIcon } from "@/app/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tenants" };

export default async function TenantsPage() {
  let tenants: Awaited<ReturnType<typeof listTenants>> = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    tenants = await listTenants(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
        <Link href="/tenants/new" className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap">
          <AddIcon className="w-4 h-4" /> New Tenant
        </Link>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          Something went wrong loading tenants. Please try again.
        </div>
      )}

      {!loadError && tenants.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/15 rounded-lg">
          <p className="text-slate-400 mb-4">No tenants yet. Create your first one.</p>
          <Link href="/tenants/new" className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors">
            <AddIcon className="w-4 h-4" /> New Tenant
          </Link>
        </div>
      )}

      {!loadError && tenants.length > 0 && <TenantsList tenants={tenants} />}
    </main>
  );
}
