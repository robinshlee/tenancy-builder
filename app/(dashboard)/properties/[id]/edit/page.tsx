import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProperty, listLandlords, listPropertyGroups } from "@/lib/profiles/server";
import { PropertyForm } from "@/app/components/PropertyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Property" };

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [property, landlords, groups] = await Promise.all([
    getProperty(supabase, id),
    listLandlords(supabase),
    listPropertyGroups(supabase),
  ]);
  if (!property) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {property.address}</h1>
      <PropertyForm
        mode="edit"
        propertyId={id}
        existingLandlords={landlords}
        existingGroups={groups}
        initialValues={{
          address: property.address,
          suburb: property.suburb ?? "",
          city: property.city ?? "",
          postal_code: property.postal_code ?? "",
          property_type: property.property_type ?? "",
          bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
          bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
          furnishing: property.furnishing ?? "",
          description: property.description ?? "",
          landlord_id: property.landlord_id ?? "",
          group_id: property.group_id ?? "",
        }}
      />
    </main>
  );
}
