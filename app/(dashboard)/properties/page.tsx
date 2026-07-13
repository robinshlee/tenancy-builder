import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProperties } from "@/lib/profiles/server";
import { PropertiesList } from "@/app/components/PropertiesList";

export default async function PropertiesPage() {
  let properties: Awaited<ReturnType<typeof listProperties>> = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    properties = await listProperties(supabase);
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <div className="flex items-center gap-3">
          <Link href="/property-groups" className="text-sm text-teal-300 hover:text-teal-200 hover:underline whitespace-nowrap">
            Manage groups
          </Link>
          <Link href="/properties/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors whitespace-nowrap">
            + New Property
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          Something went wrong loading properties. Please try again.
        </div>
      )}

      {!loadError && properties.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/15 rounded-lg">
          <p className="text-slate-400 mb-4">No properties yet. Create your first one.</p>
          <Link href="/properties/new" className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors">
            + New Property
          </Link>
        </div>
      )}

      {!loadError && properties.length > 0 && <PropertiesList properties={properties} />}
    </main>
  );
}
