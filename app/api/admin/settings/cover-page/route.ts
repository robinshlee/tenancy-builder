import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { updateAppSettings, uploadCoverPage } from "@/lib/admin/settings";

const MAX_COVER_PAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_COVER_PAGE_BYTES) {
      return NextResponse.json({ error: "Cover page must be under 10MB." }, { status: 422 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Cover page must be a PDF or Word document (.pdf, .doc, .docx)." }, { status: 422 });
    }

    const coverPageUrl = await uploadCoverPage(supabase, file);
    const settings = await updateAppSettings(supabase, {
      cover_page_url: coverPageUrl,
      cover_page_filename: file.name,
      cover_page_uploaded_at: new Date().toISOString(),
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const settings = await updateAppSettings(supabase, {
      cover_page_url: null,
      cover_page_filename: null,
      cover_page_uploaded_at: null,
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
