import { NextResponse } from "next/server";
import {
  buildWebpStoragePath,
  imageKindFromFolder,
  optimizeImage,
} from "@/lib/imageOptimizer";
import {
  createServiceClient,
  SUPABASE_MEDIA_BUCKET,
  verifyAdminSession,
} from "@/lib/supabaseServer";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_FOLDERS = new Set(["articles", "thumbnails"]);

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

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      { error: "Type de fichier non supporté" },
      { status: 400 }
    );
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const kind = imageKindFromFolder(folder as "articles" | "thumbnails");
    const { buffer, contentType } = await optimizeImage(input, kind);
    const path = buildWebpStoragePath(
      folder as "articles" | "thumbnails",
      entityId,
      file.name
    );

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(path, buffer, {
        cacheControl: "31536000",
        upsert: false,
        contentType,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ path });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
