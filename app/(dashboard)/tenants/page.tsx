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
        <Link href="/tenants/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700 whitespace-nowrap">
          + New Tenant
        </Link>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          Something went wrong loading tenants. Please try again.
        </div>
      )}

      {!loadError && tenants.length === 0 && (
        <div className="text-center py-20 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">No tenants yet. Create your first one.</p>
          <Link href="/tenants/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700">
            + New Tenant
          </Link>
        </div>
      )}

      {!loadError && tenants.length > 0 && (
        <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
          {tenants.map((t) => (
            <li key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{t.full_name}</p>
                <p className="text-sm text-neutral-500 truncate">
                  ID: {t.id_number}
                  {t.phone ? ` · ${t.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/tenants/${t.id}/edit`} className="text-sm text-neutral-700 hover:underline">
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
