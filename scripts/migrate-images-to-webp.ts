/**
 * Migration one-shot : convertit les images Supabase et public/ en WebP.
 *
 * Prérequis (.env.local ou variables d'environnement) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage : npm run migrate:images
 */

import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "child_process";
import {
  buildWebpStoragePath,
  imageKindFromFolder,
  optimizeImage,
} from "../src/lib/imageOptimizer";

const BUCKET = "media";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable manquante : ${name}`);
  return value;
}

function isWebpPath(path: string): boolean {
  return path.toLowerCase().endsWith(".webp");
}

function folderFromPath(path: string): "articles" | "thumbnails" | null {
  if (path.startsWith("articles/")) return "articles";
  if (path.startsWith("thumbnails/")) return "thumbnails";
  return null;
}

function entityIdFromPath(path: string): string | null {
  const parts = path.split("/");
  return parts.length >= 2 ? parts[1] : null;
}

type MigrationStats = {
  processed: number;
  skipped: number;
  errors: number;
  bytesBefore: number;
  bytesAfter: number;
};

async function migrateStoragePath(
  client: ReturnType<typeof createClient>,
  table: "articles" | "videos",
  id: string,
  path: string,
  stats: MigrationStats
): Promise<void> {
  if (isWebpPath(path)) {
    console.log(`  ⊘ Déjà WebP : ${path}`);
    stats.skipped++;
    return;
  }

  const folder = folderFromPath(path);
  const entityId = entityIdFromPath(path);
  if (!folder || !entityId) {
    console.error(`  ✗ Chemin invalide : ${path}`);
    stats.errors++;
    return;
  }

  const { data: fileData, error: downloadError } = await client.storage
    .from(BUCKET)
    .download(path);

  if (downloadError || !fileData) {
    console.error(`  ✗ Téléchargement échoué (${path}) : ${downloadError?.message}`);
    stats.errors++;
    return;
  }

  const input = Buffer.from(await fileData.arrayBuffer());
  const bytesBefore = input.length;
  const kind = imageKindFromFolder(folder);
  const { buffer } = await optimizeImage(input, kind);
  const newPath = buildWebpStoragePath(folder, entityId, path.split("/").pop() ?? "image");

  const { error: uploadError } = await client.storage.from(BUCKET).upload(newPath, buffer, {
    cacheControl: "31536000",
    upsert: false,
    contentType: "image/webp",
  });

  if (uploadError) {
    console.error(`  ✗ Upload échoué (${newPath}) : ${uploadError.message}`);
    stats.errors++;
    return;
  }

  const { error: updateError } =
    table === "articles"
      ? await client
          .from("articles")
          .update({ image_path: newPath })
          .eq("id", id)
      : await client
          .from("videos")
          .update({ thumbnail_path: newPath })
          .eq("id", id);

  if (updateError) {
    console.error(`  ✗ Mise à jour DB échouée : ${updateError.message}`);
    await client.storage.from(BUCKET).remove([newPath]);
    stats.errors++;
    return;
  }

  await client.storage.from(BUCKET).remove([path]);

  stats.processed++;
  stats.bytesBefore += bytesBefore;
  stats.bytesAfter += buffer.length;
  const saved = ((1 - buffer.length / bytesBefore) * 100).toFixed(1);
  console.log(`  ✓ ${path} → ${newPath} (${formatBytes(bytesBefore)} → ${formatBytes(buffer.length)}, -${saved}%)`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

async function migrateSupabaseImages(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  const client = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  console.log("\n── Articles ──");
  const { data: articles, error: articlesError } = await client
    .from("articles")
    .select("id, image_path");

  if (articlesError) throw new Error(articlesError.message);

  for (const row of articles ?? []) {
    if (!row.image_path) {
      stats.skipped++;
      continue;
    }
    await migrateStoragePath(
      client,
      "articles",
      row.id,
      row.image_path,
      stats
    );
  }

  console.log("\n── Miniatures vidéos ──");
  const { data: videos, error: videosError } = await client
    .from("videos")
    .select("id, thumbnail_path");

  if (videosError) throw new Error(videosError.message);

  for (const row of videos ?? []) {
    if (!row.thumbnail_path) {
      stats.skipped++;
      continue;
    }
    await migrateStoragePath(
      client,
      "videos",
      row.id,
      row.thumbnail_path,
      stats
    );
  }

  return stats;
}

async function migratePublicAssets(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  console.log("\n── Assets public/ ──");
  const result = spawnSync("npx", ["tsx", "scripts/optimize-public-images.ts"], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  if (result.status !== 0) {
    stats.errors++;
  } else {
    stats.processed++;
  }

  return stats;
}

function printSummary(label: string, stats: MigrationStats) {
  const saved =
    stats.bytesBefore > 0
      ? ((1 - stats.bytesAfter / stats.bytesBefore) * 100).toFixed(1)
      : "0";
  console.log(`\n${label}`);
  console.log(`  Traités  : ${stats.processed}`);
  console.log(`  Ignorés  : ${stats.skipped}`);
  console.log(`  Erreurs  : ${stats.errors}`);
  console.log(
    `  Taille   : ${formatBytes(stats.bytesBefore)} → ${formatBytes(stats.bytesAfter)} (-${saved}%)`
  );
}

async function main() {
  console.log("Migration images → WebP\n");

  let supabaseStats: MigrationStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseStats = await migrateSupabaseImages();
    printSummary("Résumé Supabase", supabaseStats);
  } else {
    console.log(
      "⊘ SUPABASE_SERVICE_ROLE_KEY absente — migration Supabase ignorée.\n" +
        "  Ajoutez la clé dans .env puis relancez npm run migrate:images.\n"
    );
  }

  const publicStats = await migratePublicAssets();
  printSummary("Résumé public/", publicStats);

  const totalErrors = supabaseStats.errors + publicStats.errors;
  if (totalErrors > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("\nÉchec de la migration :", err);
  process.exit(1);
});
