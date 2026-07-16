import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, listProfiles, type Status } from "@/lib/admin/server";
import { RoleToggleButton } from "@/app/components/RoleToggleButton";
import { StatusActionButton } from "@/app/components/StatusActionButton";
import { ResetPasswordButton } from "@/app/components/ResetPasswordButton";
import { DeleteProfileButton } from "@/app/components/DeleteProfileButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management" };

const statusStyles: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  active: "bg-emerald-500/15 text-emerald-300",
  disabled: "bg-red-500/15 text-red-300",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  if (!(await isCurrentUserAdmin(supabase))) {
    notFound();
  }

  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  const allProfiles = await listProfiles(supabase);
  const profiles =
    statusFilter === "pending" || statusFilter === "active" || statusFilter === "disabled"
      ? allProfiles.filter((p) => p.status === statusFilter)
      : allProfiles;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-slate-400">
            Approve new signups, manage roles, and enable/disable or remove accounts.
          </p>
        </div>
        {statusFilter && (
          <Link href="/admin/users" className="text-sm text-teal-300 hover:text-teal-200 hover:underline whitespace-nowrap">
            Clear filter
          </Link>
        )}
      </div>

      {profiles.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No users match this filter.</p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 rounded-lg bg-navy-900/40">
          {profiles.map((p) => (
            <li key={p.user_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.email ?? p.user_id}</p>
                <p className="text-sm text-slate-400">
                  {p.company?.name ?? "No company"} · <span className="capitalize">{p.role}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusStyles[p.status]}`}>{p.status}</span>
                {p.user_id === me?.id ? (
                  <span className="text-xs text-slate-500">This is you</span>
                ) : (
                  <>
                    <StatusActionButton userId={p.user_id} currentStatus={p.status} />
                    {p.status !== "pending" && <RoleToggleButton userId={p.user_id} currentRole={p.role} />}
                    <ResetPasswordButton userId={p.user_id} />
                    <DeleteProfileButton apiPath={`/api/admin/users/${p.user_id}`} label={p.email ?? "this user"} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
