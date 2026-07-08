import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLandlord } from "@/lib/profiles/server";
import { Nav } from "@/app/components/Nav";
import { LandlordForm } from "@/app/components/LandlordForm";

export default async function EditLandlordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const landlord = await getLandlord(supabase, id);
  if (!landlord) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {landlord.full_name}</h1>
        <LandlordForm
          mode="edit"
          landlordId={id}
          initialValues={{
            full_name: landlord.full_name,
            id_number: landlord.id_number,
            phone: landlord.phone ?? "",
            email: landlord.email ?? "",
            address: landlord.address ?? "",
          }}
        />
      </main>
    </div>
  );
}
