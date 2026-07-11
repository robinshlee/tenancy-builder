import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { getAppSettings, updateAppSettings } from "@/lib/admin/settings";

export async function GET() {
  try {
    const supabase = await createClient();
    const settings = await getAppSettings(supabase);
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: { letterhead_name?: string; boilerplate_clauses?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const settings = await updateAppSettings(supabase, {
      letterhead_name: body.letterhead_name ?? null,
      boilerplate_clauses: body.boilerplate_clauses ?? null,
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
