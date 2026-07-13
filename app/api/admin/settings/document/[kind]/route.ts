import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/server";
import {
  DOCUMENT_KINDS,
  templateDocumentUpdate,
  updateAppSettings,
  uploadTemplateDocument,
  type DocumentKind,
} from "@/lib/admin/settings";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

function parseKind(kind: string): DocumentKind | null {
  return (DOCUMENT_KINDS as string[]).includes(kind) ? (kind as DocumentKind) : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind: rawKind } = await params;
  const kind = parseKind(rawKind);
  if (!kind) {
    return NextResponse.json({ error: "Unknown document type." }, { status: 400 });
  }

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
    if (file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 422 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File must be a PDF or Word document (.pdf, .doc, .docx)." }, { status: 422 });
    }

    const url = await uploadTemplateDocument(supabase, kind, file);
    const settings = await updateAppSettings(
      supabase,
      templateDocumentUpdate(kind, url, file.name, new Date().toISOString()),
    );
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind: rawKind } = await params;
  const kind = parseKind(rawKind);
  if (!kind) {
    return NextResponse.json({ error: "Unknown document type." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    if (!(await isCurrentUserAdmin(supabase))) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    const settings = await updateAppSettings(supabase, templateDocumentUpdate(kind, null, null, null));
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
