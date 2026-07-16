import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAgreements } from "@/lib/agreements/server";
import { AgreementsDashboard } from "@/app/components/AgreementsDashboard";
import { AddIcon } from "@/app/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

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

  const stats = {
    total: agreements.length,
    active: agreements.filter((a) => a.status === "active" || a.status === "signed").length,
    totalMonthlyRent: agreements.reduce((sum, a) => sum + Number(a.rental_amount || 0), 0),
  };
  const activity = monthlyActivity(agreements);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between mb-2 gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <Link
          href="/agreements/new"
          className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap"
        >
          <AddIcon className="w-4 h-4" /> New Agreement
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
            className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
          >
            <AddIcon className="w-4 h-4" /> New Agreement
          </Link>
        </div>
      )}

      {!loadError && agreements.length > 0 && <AgreementsDashboard agreements={agreements} stats={stats} activity={activity} />}
    </main>
  );
}
