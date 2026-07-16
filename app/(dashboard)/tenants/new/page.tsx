import { TenantForm } from "@/app/components/TenantForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Tenant" };

export default function NewTenantPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Tenant</h1>
      <TenantForm
        mode="create"
        initialValues={{ full_name: "", id_number: "", phone: "", email: "", current_address: "" }}
      />
    </main>
  );
}
