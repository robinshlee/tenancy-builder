"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/app/components/SearchInput";
import { AgreementActivityChart } from "@/app/components/AgreementActivityChart";

export type AgreementRow = {
  id: string;
  reference_number: string;
  rental_amount: number;
  lease_start_date: string;
  lease_end_date: string;
  status: string;
  created_at: string;
  property: { id: string; address: string; city: string | null } | null;
};

function formatMoney(amount: number): string {
  return `RM ${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const statusStyles: Record<string, string> = {
  draft: "bg-white/10 text-slate-300",
  active: "bg-emerald-500/15 text-emerald-300",
  signed: "bg-teal-500/15 text-teal-300",
  expired: "bg-red-500/15 text-red-300",
};

export function AgreementsDashboard({
  agreements,
  stats,
  activity,
}: {
  agreements: AgreementRow[];
  stats: { total: number; active: number; totalMonthlyRent: number };
  activity: { key: string; label: string; count: number }[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agreements;
    return agreements.filter((a) => a.property?.address?.toLowerCase().includes(q));
  }, [agreements, query]);

  const visible = query.trim() ? filtered : filtered.slice(0, 8);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Agreements</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Active / Signed</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.active}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Monthly Rent</p>
          <p className="text-3xl font-bold text-white mt-2">{formatMoney(stats.totalMonthlyRent)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">{query.trim() ? "Search results" : "Recent Agreements"}</h2>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Search by property address…" />
          </div>
          {visible.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No agreements match &quot;{query}&quot;.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {visible.map((a) => (
                <li key={a.id}>
                  <Link href={`/agreements/${a.id}`} className="block px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {a.property?.address}
                          {a.property?.city ? `, ${a.property.city}` : ""}
                        </p>
                        <p className="text-sm text-slate-400">{a.reference_number}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-0">
                        <div className="sm:text-right">
                          <p className="font-medium text-white">{formatMoney(a.rental_amount)}/mo</p>
                          <p className="text-xs text-slate-400">
                            {formatDate(a.lease_start_date)} – {formatDate(a.lease_end_date)}
                          </p>
                        </div>
                        <span
                          className={`sm:ml-4 text-xs font-medium px-2 py-1 rounded-full capitalize ${statusStyles[a.status] ?? "bg-white/10 text-slate-300"}`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 glass-panel rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Agreement Activity</h2>
          <AgreementActivityChart data={activity} />
        </div>
      </div>
    </>
  );
}
