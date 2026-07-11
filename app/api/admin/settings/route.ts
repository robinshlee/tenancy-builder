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
  let body: {
    letterhead_name?: string;
    boilerplate_clauses?: string;
    default_notice_period?: string;
    default_renewal_terms?: string;
    default_maintenance_responsibility?: string;
    default_utilities_responsibility?: string;
    default_inventory_notes?: string;
  };
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
    const update: Record<string, string | null> = {};
    for (const key of [
      "letterhead_name",
      "boilerplate_clauses",
      "default_notice_period",
      "default_renewal_terms",
      "default_maintenance_responsibility",
      "default_utilities_responsibility",
      "default_inventory_notes",
    ] as const) {
      if (key in body) update[key] = body[key] || null;
    }
    const settings = await updateAppSettings(supabase, update);
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
