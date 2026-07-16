import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newSignupPendingApprovalEmail, sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  let body: { email?: string; companyName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: "email is required." }, { status: 422 });
  }

  try {
    const supabase = await createClient();
    // security-definer RPC — works even though the caller (a brand new, not-yet-approved
    // account, possibly already signed out) has no RLS access to the profiles table itself.
    const { data: adminEmails, error } = await supabase.rpc("get_admin_emails");
    if (error) throw error;

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const approveUrl = `${origin}/admin/users?status=pending`;
    const html = newSignupPendingApprovalEmail(body.email, body.companyName || null, approveUrl);

    await Promise.all((adminEmails ?? []).map((adminEmail: string) => sendEmail({ to: adminEmail, subject: "New account pending approval", html })));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    // Never block signup on a notification failure.
    return NextResponse.json({ ok: true });
  }
}
