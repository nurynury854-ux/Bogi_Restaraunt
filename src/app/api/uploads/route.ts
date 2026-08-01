import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { rateLimit, enforceBodyLimit, RATE_LIMITS } from "@/lib/rateLimit";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "upload", RATE_LIMITS.upload);
    if (limited) return limited;
    // Reject oversized uploads by declared size before buffering the file.
    const tooLarge = enforceBodyLimit(request, MAX_BYTES + 1024 * 1024);
    if (tooLarge) return tooLarge;

    const session = await requireAdminSession();

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Image uploads aren't set up yet — connect Vercel Blob storage to this project (Vercel dashboard → Storage → Create Database → Blob) and redeploy.",
        },
        { status: 500 }
      );
    }

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
