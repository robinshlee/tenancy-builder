"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";
import { SearchInput } from "@/app/components/SearchInput";

export type PropertyRow = {
  id: string;
  address: string;
  city: string | null;
  property_type: string | null;
  bedrooms: number | null;
  landlord: { id: string; full_name: string; id_number: string } | null;
  group: { id: string; name: string } | null;
};

function PropertyItem({ p }: { p: PropertyRow }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
      <div className="min-w-0">
        <p className="font-medium">{p.address}</p>
        <p className="text-sm text-slate-400 truncate">
          {[p.city, p.property_type, p.bedrooms ? `${p.bedrooms} bed` : null].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-slate-400 truncate">
          Landlord: {p.landlord ? p.landlord.full_name : <span className="text-red-400">none assigned</span>}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href={`/properties/${p.id}/edit`} className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
          Edit
        </Link>
        <DeleteProfileButton apiPath={`/api/properties/${p.id}`} label={p.address} />
      </div>
    </li>
  );
}

export function PropertiesList({ properties }: { properties: PropertyRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => p.address.toLowerCase().includes(q));
  }, [properties, query]);

  const { grouped, ungrouped } = useMemo(() => {
    const grouped = new Map<string, { name: string; properties: PropertyRow[] }>();
    const ungrouped: PropertyRow[] = [];
    for (const p of filtered) {
      if (p.group) {
        const existing = grouped.get(p.group.id);
        if (existing) existing.properties.push(p);
        else grouped.set(p.group.id, { name: p.group.name, properties: [p] });
      } else {
        ungrouped.push(p);
      }
    }
    return { grouped, ungrouped };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Search properties by address…" />

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No properties match &quot;{query}&quot;.</p>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([groupId, group]) => (
            <div key={groupId}>
              <h2 className="text-sm font-semibold text-slate-300 mb-2">{group.name}</h2>
              <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
                {group.properties.map((p) => (
                  <PropertyItem key={p.id} p={p} />
                ))}
              </ul>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <div>
              {grouped.size > 0 && <h2 className="text-sm font-semibold text-slate-300 mb-2">Ungrouped</h2>}
              <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
                {ungrouped.map((p) => (
                  <PropertyItem key={p.id} p={p} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
