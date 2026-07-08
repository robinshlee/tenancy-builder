import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/profiles/server";
import { Nav } from "@/app/components/Nav";
import { TenantForm } from "@/app/components/TenantForm";

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const tenant = await getTenant(supabase, id);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {tenant.full_name}</h1>
        <TenantForm
          mode="edit"
          tenantId={id}
          initialValues={{
            full_name: tenant.full_name,
            id_number: tenant.id_number,
            phone: tenant.phone ?? "",
            email: tenant.email ?? "",
            current_address: tenant.current_address ?? "",
          }}
        />
      </main>
    </div>
  );
}
