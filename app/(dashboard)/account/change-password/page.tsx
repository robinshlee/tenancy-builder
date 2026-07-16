import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileSummary } from "@/lib/admin/server";
import { ChangePasswordForm } from "@/app/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password" };

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const summary = await getCurrentProfileSummary(supabase);

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
        <p className="text-sm text-slate-400">Enter your current password, then your new password twice.</p>
      </div>
      <ChangePasswordForm email={summary.email ?? ""} />
    </main>
  );
}
