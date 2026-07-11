import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import { updateAppSettings, uploadLogo } from "@/lib/admin/settings";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
// PNG/JPEG/WebP only — @react-pdf/renderer's <Image> can't rasterize SVG, so an SVG logo
// would render fine in the on-screen preview but silently break the PDF.
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

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
    if (file.size > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: "Logo must be under 2MB." }, { status: 422 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Logo must be a PNG, JPEG, or WebP image." }, { status: 422 });
    }

    const logoUrl = await uploadLogo(supabase, file);
    const settings = await updateAppSettings(supabase, { logo_url: logoUrl });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
