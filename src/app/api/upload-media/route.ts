import { NextResponse } from "next/server";
import {
  buildWebpStoragePath,
  guessImageMime,
  imageKindFromFolder,
  MAX_UPLOAD_BYTES,
  optimizeImage,
} from "@/lib/imageOptimizer";
import {
  createUserClientFromToken,
  SUPABASE_MEDIA_BUCKET,
  verifyAdminSession,
} from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_FOLDERS = new Set(["articles", "thumbnails"]);

function optimizeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  if (
    lower.includes("unsupported") ||
    lower.includes("corrupt") ||
    lower.includes("invalid") ||
    lower.includes("vips") ||
    lower.includes("input")
  ) {
    return "Image invalide ou format non supporté. Utilisez JPG, PNG, WebP ou GIF.";
  }
  return raw || "Erreur lors de l'optimisation de l'image";
}

export async function POST(request: Request) {
  const auth = await verifyAdminSession(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = formData.get("folder");
  const entityId = formData.get("entityId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Dossier invalide" }, { status: 400 });
  }

  if (typeof entityId !== "string" || !entityId.trim()) {
    return NextResponse.json({ error: "entityId manquant" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Fichier image vide" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `Image trop lourde (max ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} Mo). Compressez-la avant l'envoi.`,
      },
      { status: 413 }
    );
  }

  const mimeType = guessImageMime(file.name, file.type || "");
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      {
        error:
          "Type de fichier non supporté. Formats acceptés : JPG, PNG, WebP, GIF.",
      },
      { status: 400 }
    );
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const kind = imageKindFromFolder(folder as "articles" | "thumbnails");
    const { buffer, contentType, width, height } = await optimizeImage(
      input,
      kind
    );
    const path = buildWebpStoragePath(
      folder as "articles" | "thumbnails",
      entityId.trim(),
      file.name
    );

    const userClient = createUserClientFromToken(auth.accessToken);
    const { error } = await userClient.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(path, buffer, {
        cacheControl: "31536000",
        upsert: false,
        contentType,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      path,
      contentType,
      bytes: buffer.length,
      width,
      height,
      optimized: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: optimizeErrorMessage(err) },
      { status: 500 }
    );
  }
}
