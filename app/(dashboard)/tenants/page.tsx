import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTenants } from "@/lib/profiles/server";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";

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
        <Link href="/tenants/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap">
          + New Tenant
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
          <Link href="/tenants/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors">
            + New Tenant
          </Link>
        </div>
      )}

      {!loadError && tenants.length > 0 && (
        <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
          {tenants.map((t) => (
            <li key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{t.full_name}</p>
                <p className="text-sm text-slate-400 truncate">
                  ID: {t.id_number}
                  {t.phone ? ` · ${t.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/tenants/${t.id}/edit`} className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
                  Edit
                </Link>
                <DeleteProfileButton apiPath={`/api/tenants/${t.id}`} label={t.full_name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
