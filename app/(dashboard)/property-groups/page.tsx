import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listPropertyGroups } from "@/lib/profiles/server";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";

export default async function PropertyGroupsPage() {
  let groups: Awaited<ReturnType<typeof listPropertyGroups>> = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    groups = await listPropertyGroups(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Groups</h1>
          <p className="text-sm text-neutral-500">Group units under a shared building or complex, e.g. a condo block.</p>
        </div>
        <Link href="/property-groups/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700 whitespace-nowrap">
          + New Group
        </Link>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          Something went wrong loading property groups. Please try again.
        </div>
      )}

      {!loadError && groups.length === 0 && (
        <div className="text-center py-20 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">No property groups yet.</p>
          <Link href="/property-groups/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700">
            + New Group
          </Link>
        </div>
      )}

      {!loadError && groups.length > 0 && (
        <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
          {groups.map((g) => (
            <li key={g.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{g.name}</p>
                <p className="text-sm text-neutral-500 truncate">{[g.address, g.city].filter(Boolean).join(", ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/property-groups/${g.id}/edit`} className="text-sm text-neutral-700 hover:underline">
                  Edit
                </Link>
                <DeleteProfileButton apiPath={`/api/property-groups/${g.id}`} label={g.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
