import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listLandlords } from "@/lib/profiles/server";
import { LandlordsList } from "@/app/components/LandlordsList";

export default async function LandlordsPage() {
  let landlords: Awaited<ReturnType<typeof listLandlords>> = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    landlords = await listLandlords(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Landlords</h1>
        <Link href="/landlords/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap">
          + New Landlord
        </Link>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          Something went wrong loading landlords. Please try again.
        </div>
      )}

      {!loadError && landlords.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/15 rounded-lg">
          <p className="text-slate-400 mb-4">No landlords yet. Create your first one.</p>
          <Link href="/landlords/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors">
            + New Landlord
          </Link>
        </div>
      )}

      {!loadError && landlords.length > 0 && <LandlordsList landlords={landlords} />}
    </main>
  );
}
