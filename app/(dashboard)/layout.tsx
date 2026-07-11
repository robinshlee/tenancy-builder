import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { Sidebar } from "@/app/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="md:pl-64">{children}</div>
    </div>
  );
}
