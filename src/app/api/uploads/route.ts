import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, WebP, or GIF image" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const kind = form.get("kind") === "logo" ? "logo" : "items";
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const pathname = `tenants/${session.tenantId}/${kind}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, { access: "public", addRandomSuffix: true });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
