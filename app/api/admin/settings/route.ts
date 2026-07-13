import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { DOCUMENT_KINDS, getAppSettings, updateAppSettings, type DocumentKind } from "@/lib/admin/settings";

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
    default_use_of_premises?: string;
    default_renewal_terms?: string;
    default_rent_payment_details?: string;
    default_access_card_deposit_notes?: string;
    document_order?: DocumentKind[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.document_order) {
    const valid =
      Array.isArray(body.document_order) &&
      body.document_order.length === DOCUMENT_KINDS.length &&
      DOCUMENT_KINDS.every((k) => body.document_order!.includes(k));
    if (!valid) {
      return NextResponse.json({ error: "document_order must include each document kind exactly once." }, { status: 422 });
    }
  }

  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const update: Record<string, string | null | DocumentKind[]> = {};
    for (const key of [
      "letterhead_name",
      "boilerplate_clauses",
      "default_use_of_premises",
      "default_renewal_terms",
      "default_rent_payment_details",
      "default_access_card_deposit_notes",
    ] as const) {
      if (key in body) update[key] = body[key] || null;
    }
    if (body.document_order) update.document_order = body.document_order;
    const settings = await updateAppSettings(supabase, update);
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
