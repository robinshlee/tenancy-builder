import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { countPendingProfiles, getCurrentProfileSummary } from "@/lib/admin/server";
import { Sidebar } from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";
import { ToastProvider } from "@/app/components/ToastProvider";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { company_name } = await getCurrentProfileSummary(supabase);
  const brand = company_name || "Tenancy Builder";
  return {
    title: {
      template: `${brand} - %s`,
      default: brand,
    },
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const summary = await getCurrentProfileSummary(supabase);
  const isAdmin = summary.role === "admin";
  const pendingApprovalCount = isAdmin ? await countPendingProfiles(supabase) : 0;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-navy-950">
        <Sidebar isAdmin={isAdmin} />
        <div className="md:pl-64">
          <TopBar
            companyName={summary.company_name}
            displayName={summary.full_name || summary.email}
            email={summary.email}
            role={summary.role ?? "agent"}
            pendingApprovalCount={pendingApprovalCount}
          />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
