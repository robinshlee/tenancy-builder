import { createClient } from "@/lib/supabase/server";
import { listLandlords, listPropertyGroups } from "@/lib/profiles/server";
import { PropertyForm } from "@/app/components/PropertyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Property" };

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const [landlords, groups] = await Promise.all([listLandlords(supabase), listPropertyGroups(supabase)]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Property</h1>
      <PropertyForm
        mode="create"
        existingLandlords={landlords}
        existingGroups={groups}
        initialValues={{
          address: "",
          suburb: "",
          city: "",
          postal_code: "",
          property_type: "",
          bedrooms: "",
          bathrooms: "",
          furnishing: "",
          description: "",
          landlord_id: "",
          group_id: "",
        }}
      />
    </main>
  );
}
