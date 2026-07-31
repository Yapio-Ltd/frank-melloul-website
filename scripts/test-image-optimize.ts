import sharp from "sharp";
import {
  buildWebpStoragePath,
  imageKindFromFolder,
  optimizeImage,
} from "../src/lib/imageOptimizer";

async function make(
  fmt: "jpeg" | "png" | "webp" | "gif",
  w = 2000,
  h = 1200
) {
  const pipeline = sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 40, g: 80, b: 160 },
    },
  });
  if (fmt === "jpeg") return pipeline.jpeg({ quality: 92 }).toBuffer();
  if (fmt === "png") return pipeline.png().toBuffer();
  if (fmt === "webp") return pipeline.webp({ quality: 90 }).toBuffer();
  return pipeline.gif().toBuffer();
}

async function main() {
  console.log("Test optimisation upload (sharp → WebP)\n");

  for (const fmt of ["jpeg", "png", "webp", "gif"] as const) {
    const input = await make(fmt);
    const { buffer, contentType } = await optimizeImage(input, "article");
    const meta = await sharp(buffer).metadata();

    if (contentType !== "image/webp" || meta.format !== "webp") {
      throw new Error(`Format de sortie invalide pour ${fmt}`);
    }
    if (!meta.width || meta.width > 1920) {
      throw new Error(`Largeur invalide pour ${fmt}: ${meta.width}`);
    }

    console.log(
      `  ✓ ${fmt.padEnd(4)} ${input.length} → ${buffer.length} B (${meta.width}×${meta.height} webp)`
    );
  }

  const thumbIn = await make("jpeg", 1600, 900);
  const thumb = await optimizeImage(thumbIn, "thumbnail");
  const thumbMeta = await sharp(thumb.buffer).metadata();
  if (!thumbMeta.width || thumbMeta.width > 1280) {
    throw new Error(`Miniature trop large: ${thumbMeta.width}`);
  }
  console.log(
    `  ✓ thumb ${thumbIn.length} → ${thumb.buffer.length} B (${thumbMeta.width}×${thumbMeta.height})`
  );

  const path = buildWebpStoragePath(
    "articles",
    "abc-123",
    "Mon Photo Été (1).JPG"
  );
  if (!path.endsWith(".webp") || !path.startsWith("articles/abc-123/")) {
    throw new Error(`Chemin invalide: ${path}`);
  }
  console.log(`  ✓ path ${path}`);
  console.log(`  ✓ kind ${imageKindFromFolder("thumbnails")}`);

  let rejected = false;
  try {
    await optimizeImage(Buffer.from("not-an-image"), "thumbnail");
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error("Image corrompue non rejetée");
  console.log("  ✓ image corrompue rejetée");

  console.log("\nOK — optimisation upload prête.");
}

main().catch((err) => {
  console.error("\nÉCHEC:", err);
  process.exit(1);
});
