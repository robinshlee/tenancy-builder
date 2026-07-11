import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAgreements } from "@/lib/agreements/server";
import { AgreementActivityChart } from "@/app/components/AgreementActivityChart";

function formatMoney(amount: number): string {
  return `GHS ${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function monthlyActivity(agreements: { created_at: string }[]) {
  const now = new Date();
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), count: 0 });
  }
  for (const a of agreements) {
    const d = new Date(a.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  }
  return months;
}

export default async function AgreementsPage() {
  let agreements: Awaited<ReturnType<typeof listAgreements>> = [];
  let loadError = false;

  try {
    const supabase = await createClient();
    agreements = await listAgreements(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  const totalAgreements = agreements.length;
  const activeCount = agreements.filter((a) => a.status === "active" || a.status === "signed").length;
  const totalMonthlyRent = agreements.reduce((sum, a) => sum + Number(a.rental_amount || 0), 0);
  const activity = monthlyActivity(agreements);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between mb-2 gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <Link
          href="/agreements/new"
          className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap"
        >
          + New Agreement
        </Link>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          Something went wrong loading agreements. Please try again.
        </div>
      )}

      {!loadError && agreements.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-lg border-dashed">
          <p className="text-slate-400 mb-4">No agreements yet. Create your first one.</p>
          <Link
            href="/agreements/new"
            className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
          >
            + New Agreement
          </Link>
        </div>
      )}

      {!loadError && agreements.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Agreements</p>
              <p className="text-3xl font-bold text-white mt-2">{totalAgreements}</p>
            </div>
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Active / Signed</p>
              <p className="text-3xl font-bold text-white mt-2">{activeCount}</p>
            </div>
            <div className="glass-panel rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Monthly Rent</p>
              <p className="text-3xl font-bold text-white mt-2">{formatMoney(totalMonthlyRent)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="font-semibold text-white">Recent Agreements</h2>
              </div>
              <ul className="divide-y divide-white/10">
                {agreements.slice(0, 8).map((a) => (
                  <li key={a.id}>
                    <Link href={`/agreements/${a.id}`} className="block px-5 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-white">{a.reference_number}</p>
                          <p className="text-sm text-slate-400 truncate">
                            {a.property?.address}
                            {a.property?.city ? `, ${a.property.city}` : ""}
                          </p>
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
            </div>

            <div className="lg:col-span-2 glass-panel rounded-xl p-5">
              <h2 className="font-semibold text-white mb-4">Agreement Activity</h2>
              <AgreementActivityChart data={activity} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
