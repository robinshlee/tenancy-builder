import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, listProfiles } from "@/lib/admin/server";
import { RoleToggleButton } from "@/app/components/RoleToggleButton";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  if (!(await isCurrentUserAdmin(supabase))) {
    notFound();
  }

  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  const profiles = await listProfiles(supabase);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-neutral-500">
          Promote a self-signed-up account to admin, or demote an admin back to a regular agent.
        </p>
      </div>

      <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
        {profiles.map((p) => (
          <li key={p.user_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{p.email ?? p.user_id}</p>
              <p className="text-sm text-neutral-500 capitalize">{p.role}</p>
            </div>
            {p.user_id === me?.id ? (
              <span className="text-xs text-neutral-400">This is you</span>
            ) : (
              <RoleToggleButton userId={p.user_id} currentRole={p.role} />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
