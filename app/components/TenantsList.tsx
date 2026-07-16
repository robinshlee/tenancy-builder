"use client";

import { useMemo, useState } from "react";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";
import { SearchInput } from "@/app/components/SearchInput";
import { IconLinkButton } from "@/app/components/IconButton";
import { EditIcon } from "@/app/components/icons";

export type TenantRow = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
};

export function TenantsList({ tenants }: { tenants: TenantRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) => t.full_name.toLowerCase().includes(q));
  }, [tenants, query]);

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Search tenants by name…" />

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No tenants match &quot;{query}&quot;.</p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
          {filtered.map((t) => (
            <li key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{t.full_name}</p>
                <p className="text-sm text-slate-400 truncate">
                  ID: {t.id_number}
                  {t.phone ? ` · ${t.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconLinkButton href={`/tenants/${t.id}/edit`} label={`Edit ${t.full_name}`} tone="primary">
                  <EditIcon />
                </IconLinkButton>
                <DeleteProfileButton apiPath={`/api/tenants/${t.id}`} label={t.full_name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
