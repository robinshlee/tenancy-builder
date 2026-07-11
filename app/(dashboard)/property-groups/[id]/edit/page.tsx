import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPropertyGroup } from "@/lib/profiles/server";
import { PropertyGroupForm } from "@/app/components/PropertyGroupForm";

export default async function EditPropertyGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const group = await getPropertyGroup(supabase, id);
  if (!group) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {group.name}</h1>
      <PropertyGroupForm
        mode="edit"
        groupId={id}
        initialValues={{ name: group.name, address: group.address ?? "", city: group.city ?? "" }}
      />
    </main>
  );
}
