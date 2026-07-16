import { LandlordForm } from "@/app/components/LandlordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Landlord" };

export default function NewLandlordPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Landlord</h1>
      <LandlordForm mode="create" initialValues={{ full_name: "", id_number: "", phone: "", email: "", address: "" }} />
    </main>
  );
}
