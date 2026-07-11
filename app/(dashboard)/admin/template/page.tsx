import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { getAppSettings } from "@/lib/admin/settings";
import { TemplateSettingsForm } from "@/app/components/TemplateSettingsForm";

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
        <p className="text-sm text-neutral-500">
          Branding and boilerplate used on every generated agreement. The cover page and schedule for each
          individual agreement are still generated from that agreement&apos;s own property, party, and deal details.
        </p>
      </div>
      <TemplateSettingsForm settings={settings} />
    </main>
  );
}
