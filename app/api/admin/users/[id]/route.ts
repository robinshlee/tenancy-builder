import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteProfile, isCurrentUserAdmin, setProfileRole, setProfileStatus, type Role, type Status } from "@/lib/admin/server";
import { accountApprovedEmail, sendEmail } from "@/lib/email/send";

const VALID_STATUSES: Status[] = ["pending", "active", "disabled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { role?: Role; status?: Status };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.role === undefined && body.status === undefined) {
    return NextResponse.json({ error: "role or status is required." }, { status: 422 });
  }
  if (body.role !== undefined && body.role !== "agent" && body.role !== "admin") {
    return NextResponse.json({ error: "role must be 'agent' or 'admin'." }, { status: 422 });
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "status must be 'pending', 'active', or 'disabled'." }, { status: 422 });
  }

  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    let priorStatus: Status | null = null;
    let targetEmail: string | null = null;
    if (body.status === "active") {
      const { data: existing } = await supabase.from("profiles").select("status, email").eq("user_id", id).maybeSingle();
      priorStatus = existing?.status ?? null;
      targetEmail = existing?.email ?? null;
    }

    if (body.role !== undefined) await setProfileRole(supabase, id, body.role);
    if (body.status !== undefined) await setProfileStatus(supabase, id, body.status);

    if (body.status === "active" && priorStatus === "pending" && targetEmail) {
      const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
      await sendEmail({
        to: targetEmail,
        subject: "Your account has been approved",
        html: accountApprovedEmail(`${origin}/login`),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const {
      data: { user: me },
    } = await supabase.auth.getUser();
    if (me?.id === id) {
      return NextResponse.json({ error: "You cannot remove your own account." }, { status: 422 });
    }

    try {
      // Deletes the actual Supabase auth account. Their profiles row cascades away
      // with it (profiles.user_id references auth.users(id) on delete cascade).
      const admin = createAdminClient();
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
    } catch (err) {
      // SUPABASE_SERVICE_ROLE_KEY not configured yet, or the admin API call failed —
      // fall back to revoking app access via the profile row, same as before.
      console.error("Falling back to profile-only delete:", err);
      await deleteProfile(supabase, id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
