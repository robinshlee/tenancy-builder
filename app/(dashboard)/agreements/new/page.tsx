import { createClient } from "@/lib/supabase/server";
import { listLandlords, listProperties, listTenants } from "@/lib/profiles/server";
import { AgreementForm, emptyFormValues } from "@/app/components/AgreementForm";

export default async function NewAgreementPage() {
  const supabase = await createClient();
  const [landlords, tenants, properties] = await Promise.all([
    listLandlords(supabase),
    listTenants(supabase),
    listProperties(supabase),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Agreement</h1>
      <AgreementForm
        mode="create"
        initialValues={emptyFormValues}
        existingLandlords={landlords}
        existingTenants={tenants}
        existingProperties={properties}
      />
    </main>
  );
}
