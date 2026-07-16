import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileSummary } from "@/lib/admin/server";
import { UpdateProfileForm } from "@/app/components/UpdateProfileForm";

export const metadata: Metadata = { title: "Update Profile" };

export default async function UpdateProfilePage() {
  const supabase = await createClient();
  const summary = await getCurrentProfileSummary(supabase);

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Update Profile</h1>
        <p className="text-sm text-slate-400">This name is shown in the top right corner across the app.</p>
      </div>
      <UpdateProfileForm initialFullName={summary.full_name ?? ""} />
    </main>
  );
}
