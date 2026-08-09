import { NextResponse, type NextRequest } from "next/server";
import { createPresignedUpload, validateUpload } from "@/lib/s3/upload";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const isAdmin =
    user.app_metadata.role === "admin" || user.app_metadata.admin === true;

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Only an administrator can upload files." },
      { status: 403 },
    );
  }

  let payload: { path?: unknown; contentType?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof payload.path !== "string" || typeof payload.contentType !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validationError = validateUpload(payload.path, payload.contentType);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const url = await createPresignedUpload(payload.path, payload.contentType);
    return NextResponse.json({
      url,
      path: payload.path,
      expiresIn: 300,
      headers: { "Content-Type": payload.contentType },
    });
  } catch {
    return NextResponse.json(
      { error: "File uploads are not configured yet." },
      { status: 503 },
    );
  }
}
