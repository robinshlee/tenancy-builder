import { Nav } from "@/app/components/Nav";
import { TenantForm } from "@/app/components/TenantForm";

export default function NewTenantPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">New Tenant</h1>
        <TenantForm
          mode="create"
          initialValues={{ full_name: "", id_number: "", phone: "", email: "", current_address: "" }}
        />
      </main>
    </div>
  );
}
