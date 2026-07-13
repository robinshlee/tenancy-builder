"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";
import { SearchInput } from "@/app/components/SearchInput";

export type LandlordRow = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
};

export function LandlordsList({ landlords }: { landlords: LandlordRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return landlords;
    return landlords.filter((l) => l.full_name.toLowerCase().includes(q));
  }, [landlords, query]);

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Search landlords by name…" />

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No landlords match &quot;{query}&quot;.</p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
          {filtered.map((l) => (
            <li key={l.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{l.full_name}</p>
                <p className="text-sm text-slate-400 truncate">
                  ID: {l.id_number}
                  {l.phone ? ` · ${l.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/landlords/${l.id}/edit`} className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
                  Edit
                </Link>
                <DeleteProfileButton apiPath={`/api/landlords/${l.id}`} label={l.full_name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
