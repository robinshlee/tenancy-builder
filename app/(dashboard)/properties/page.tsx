import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProperties } from "@/lib/profiles/server";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";

type PropertyRow = Awaited<ReturnType<typeof listProperties>>[number];

function PropertyRow({ p }: { p: PropertyRow }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
      <div className="min-w-0">
        <p className="font-medium">{p.address}</p>
        <p className="text-sm text-neutral-500 truncate">
          {[p.city, p.property_type, p.bedrooms ? `${p.bedrooms} bed` : null].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          Landlord: {p.landlord ? p.landlord.full_name : <span className="text-red-600">none assigned</span>}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href={`/properties/${p.id}/edit`} className="text-sm text-neutral-700 hover:underline">
          Edit
        </Link>
        <DeleteProfileButton apiPath={`/api/properties/${p.id}`} label={p.address} />
      </div>
    </li>
  );
}

export default async function PropertiesPage() {
  let properties: PropertyRow[] = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    properties = await listProperties(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  const grouped = new Map<string, { name: string; properties: PropertyRow[] }>();
  const ungrouped: PropertyRow[] = [];
  for (const p of properties) {
    if (p.group) {
      const existing = grouped.get(p.group.id);
      if (existing) existing.properties.push(p);
      else grouped.set(p.group.id, { name: p.group.name, properties: [p] });
    } else {
      ungrouped.push(p);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <div className="flex items-center gap-3">
          <Link href="/property-groups" className="text-sm text-neutral-700 hover:underline whitespace-nowrap">
            Manage groups
          </Link>
          <Link href="/properties/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700 whitespace-nowrap">
            + New Property
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          Something went wrong loading properties. Please try again.
        </div>
      )}

      {!loadError && properties.length === 0 && (
        <div className="text-center py-20 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">No properties yet. Create your first one.</p>
          <Link href="/properties/new" className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700">
            + New Property
          </Link>
        </div>
      )}

      {!loadError && properties.length > 0 && (
        <div className="space-y-6">
          {[...grouped.entries()].map(([groupId, group]) => (
            <div key={groupId}>
              <h2 className="text-sm font-semibold text-neutral-700 mb-2">{group.name}</h2>
              <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
                {group.properties.map((p) => (
                  <PropertyRow key={p.id} p={p} />
                ))}
              </ul>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <div>
              {grouped.size > 0 && <h2 className="text-sm font-semibold text-neutral-700 mb-2">Ungrouped</h2>}
              <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
                {ungrouped.map((p) => (
                  <PropertyRow key={p.id} p={p} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
