import sharp from "sharp";

// Bound native sharp memory on small Render instances (512 MiB)
sharp.cache(false);
sharp.concurrency(1);

export type ImageKind = "article" | "thumbnail";

const MAX_WIDTH: Record<ImageKind, number> = {
  article: 1920,
  thumbnail: 1280,
};

const WEBP_QUALITY = 80;
/** Limite mémoire côté API (octets du fichier source). */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export async function optimizeImage(
  input: Buffer,
  kind: ImageKind
): Promise<{ buffer: Buffer; contentType: "image/webp"; width: number; height: number }> {
  if (!input.length) {
    throw new Error("Fichier image vide");
  }

  // pages: 1 → première frame seulement (GIF animé)
  const pipeline = sharp(input, { failOn: "error", pages: 1 })
    .rotate()
    .resize({
      width: MAX_WIDTH[kind],
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  if (info.format !== "webp" || !info.width || !info.height) {
    throw new Error("Échec de conversion WebP");
  }

  return {
    buffer: data,
    contentType: "image/webp",
    width: info.width,
    height: info.height,
  };
}

export function buildWebpStoragePath(
  folder: "articles" | "thumbnails",
  entityId: string,
  originalFilename: string
): string {
  const basename = originalFilename
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.[^.]+$/, "");

  const safeName = basename || "image";
  return `${folder}/${entityId}/${Date.now()}-${safeName}.webp`;
}

export function imageKindFromFolder(
  folder: "articles" | "thumbnails"
): ImageKind {
  return folder === "articles" ? "article" : "thumbnail";
}

/** Déduit un MIME image à partir du nom si le navigateur n’envoie pas de type. */
export function guessImageMime(
  filename: string,
  declaredType: string
): string {
  const declared = (declaredType || "").toLowerCase().trim();
  if (declared.startsWith("image/")) return declared;

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return byExt[ext] ?? (declared || "application/octet-stream");
}
