import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/lib/profiles/server";
import { Nav } from "@/app/components/Nav";
import { PropertyForm } from "@/app/components/PropertyForm";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const property = await getProperty(supabase, id);
  if (!property) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {property.address}</h1>
        <PropertyForm
          mode="edit"
          propertyId={id}
          initialValues={{
            address: property.address,
            suburb: property.suburb ?? "",
            city: property.city ?? "",
            postal_code: property.postal_code ?? "",
            property_type: property.property_type ?? "",
            bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
            description: property.description ?? "",
          }}
        />
      </main>
    </div>
  );
}
