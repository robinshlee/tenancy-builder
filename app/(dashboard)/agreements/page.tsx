import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAgreements } from "@/lib/agreements/server";

function formatMoney(amount: number): string {
  return `GHS ${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const statusStyles: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  active: "bg-green-100 text-green-800",
  signed: "bg-blue-100 text-blue-800",
  expired: "bg-red-100 text-red-700",
};

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

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Agreements</h1>
        <Link
          href="/agreements/new"
          className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700 whitespace-nowrap"
        >
          + New Agreement
        </Link>
      </div>

        {loadError && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            Something went wrong loading agreements. Please try again.
          </div>
        )}

        {!loadError && agreements.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-300 rounded-lg">
            <p className="text-neutral-500 mb-4">No agreements yet. Create your first one.</p>
            <Link
              href="/agreements/new"
              className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm hover:bg-neutral-700"
            >
              + New Agreement
            </Link>
          </div>
        )}

        {!loadError && agreements.length > 0 && (
          <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
            {agreements.map((a) => (
              <li key={a.id}>
                <Link href={`/agreements/${a.id}`} className="block px-4 sm:px-5 py-4 hover:bg-neutral-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{a.reference_number}</p>
                      <p className="text-sm text-neutral-500 truncate">
                        {a.property?.address}
                        {a.property?.city ? `, ${a.property.city}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-0">
                      <div className="sm:text-right">
                        <p className="font-medium">{formatMoney(a.rental_amount)}/mo</p>
                        <p className="text-xs text-neutral-500">
                          {formatDate(a.lease_start_date)} – {formatDate(a.lease_end_date)}
                        </p>
                      </div>
                      <span
                        className={`sm:ml-4 text-xs font-medium px-2 py-1 rounded-full capitalize ${statusStyles[a.status] ?? "bg-neutral-100 text-neutral-700"}`}
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
    </main>
  );
}
