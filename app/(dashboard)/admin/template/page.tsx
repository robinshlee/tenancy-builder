import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { getAppSettings } from "@/lib/admin/settings";
import { TemplateSettingsForm } from "@/app/components/TemplateSettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Agreement Template" };

export default async function AdminTemplatePage() {
  const supabase = await createClient();

  if (!(await isCurrentUserAdmin(supabase))) {
    notFound();
  }

  const settings = await getAppSettings(supabase);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Agreement Template</h1>
        <p className="text-sm text-slate-400">
          Branding, cover page reference, and schedule defaults used across every generated agreement. Each
          agreement&apos;s cover page and schedule are still generated from that agreement&apos;s own property,
          party, and deal details — schedule terms just start from your defaults below and can be edited per
          agreement.
        </p>
      </div>
      <TemplateSettingsForm settings={settings} />
    </main>
  );
}
