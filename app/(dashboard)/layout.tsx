import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/admin/server";
import { Sidebar } from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [role, { data }] = await Promise.all([getCurrentRole(supabase), supabase.auth.getUser()]);
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar isAdmin={isAdmin} />
      <div className="md:pl-64">
        <TopBar email={data.user?.email ?? null} role={role ?? "agent"} />
        {children}
      </div>
    </div>
  );
}
