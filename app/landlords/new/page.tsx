import { Nav } from "@/app/components/Nav";
import { LandlordForm } from "@/app/components/LandlordForm";

export default function NewLandlordPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">New Landlord</h1>
        <LandlordForm mode="create" initialValues={{ full_name: "", id_number: "", phone: "", email: "", address: "" }} />
      </main>
    </div>
  );
}
