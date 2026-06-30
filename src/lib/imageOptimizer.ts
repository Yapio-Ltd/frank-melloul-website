import sharp from "sharp";

export type ImageKind = "article" | "thumbnail";

const MAX_WIDTH: Record<ImageKind, number> = {
  article: 1920,
  thumbnail: 1280,
};

const WEBP_QUALITY = 80;

export async function optimizeImage(
  input: Buffer,
  kind: ImageKind
): Promise<{ buffer: Buffer; contentType: "image/webp" }> {
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: MAX_WIDTH[kind],
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp" };
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
