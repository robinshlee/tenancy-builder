import { Sidebar } from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="md:pl-64">{children}</div>
    </div>
  );
}
