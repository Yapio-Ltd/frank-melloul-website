/**
 * Optimise tous les assets raster de public/ en WebP (+ favicons PNG légers).
 * Usage : npx tsx scripts/optimize-public-images.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const publicDir = join(process.cwd(), "public");

type Job = {
  source: string;
  target: string;
  maxWidth: number;
  quality: number;
  /** Si true, supprime la source après succès (gros PNG/JPEG inutiles). */
  removeSource?: boolean;
};

const jobs: Job[] = [
  {
    source: "only_gold_logo.png",
    target: "only_gold_logo.webp",
    maxWidth: 512,
    quality: 82,
    removeSource: true,
  },
  {
    source: "logo-gold.png",
    target: "logo-gold.webp",
    maxWidth: 1200,
    quality: 80,
    removeSource: true,
  },
  {
    source: "logo-blue.png",
    target: "logo-blue.webp",
    maxWidth: 1200,
    quality: 80,
    removeSource: true,
  },
  {
    source: "frank_melloul_avatar.jpeg",
    target: "frank_melloul_avatar.webp",
    maxWidth: 1200,
    quality: 80,
    // Gardé pour opengraph-image.tsx (JPEG embarqué) — on le recompresse plus bas
    removeSource: false,
  },
  {
    source: "avatar_to_circle.png",
    target: "avatar_to_circle.webp",
    maxWidth: 512,
    quality: 82,
    removeSource: true,
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

async function toWebp(job: Job) {
  const sourcePath = join(publicDir, job.source);
  const targetPath = join(publicDir, job.target);

  // Prefer existing webp/png source: if png gone, re-optimize from current webp
  let inputPath = sourcePath;
  if (!existsSync(inputPath)) {
    if (existsSync(targetPath)) {
      inputPath = targetPath;
      console.log(`  · Recompression depuis ${job.target}`);
    } else {
      console.log(`  ⊘ Absent : ${job.source}`);
      return;
    }
  }

  const input = readFileSync(inputPath);
  const before = input.length;
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: job.maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: job.quality, effort: 6 })
    .toBuffer();

  writeFileSync(targetPath, buffer);
  const saved = ((1 - buffer.length / before) * 100).toFixed(1);
  console.log(
    `  ✓ ${job.source} → ${job.target} (${formatBytes(before)} → ${formatBytes(buffer.length)}, ${saved}%)`
  );

  if (job.removeSource && existsSync(sourcePath) && sourcePath !== targetPath) {
    unlinkSync(sourcePath);
    console.log(`    − supprimé ${job.source}`);
  }
}

async function writeFavicons() {
  const candidates = [
    join(publicDir, "only_gold_logo.webp"),
    join(publicDir, "only_gold_logo.png"),
    join(publicDir, "logo-gold.webp"),
  ];
  const source = candidates.find((p) => existsSync(p));
  if (!source) {
    console.log("  ⊘ Pas de logo pour favicons");
    return;
  }

  const sizes = [
    { name: "favicon-32.png", size: 32 },
    { name: "favicon-16.png", size: 16 },
    { name: "apple-touch-icon.png", size: 180 },
  ];

  for (const { name, size } of sizes) {
    const buffer = await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    writeFileSync(join(publicDir, name), buffer);
    console.log(`  ✓ ${name} (${formatBytes(buffer.length)})`);
  }
}

async function recompressAvatarJpeg() {
  const path = join(publicDir, "frank_melloul_avatar.jpeg");
  const webp = join(publicDir, "frank_melloul_avatar.webp");
  const source = existsSync(path) ? path : existsSync(webp) ? webp : null;
  if (!source) return;

  const input = readFileSync(source);
  const before = input.length;
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(path, buffer);
  console.log(
    `  ✓ frank_melloul_avatar.jpeg recompressé (${formatBytes(before)} → ${formatBytes(buffer.length)})`
  );
}

async function main() {
  if (!existsSync(publicDir)) mkdirSync(publicDir);
  console.log("Optimisation public/ → WebP\n");
  for (const job of jobs) {
    await toWebp(job);
  }
  console.log("\nFavicons PNG légers");
  await writeFavicons();
  console.log("\nAvatar JPEG (OG)");
  await recompressAvatarJpeg();
  console.log("\nTerminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
