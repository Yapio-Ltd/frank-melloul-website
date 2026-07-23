# Optimisation images WebP — déploiement

## Variables d'environnement

Toujours nécessaires (Render + local) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### `SUPABASE_SERVICE_ROLE_KEY` (migration uniquement)

| Variable | Où la trouver |
|----------|----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` (secret) |

Cette clé n’est **pas** requise pour l’upload admin quotidien (`POST /api/upload-media` utilise le JWT de la session admin).

Elle est uniquement nécessaire pour :

- `npm run migrate:images` — migration one-shot du stock existant

**Ne jamais** exposer cette clé côté client (`NEXT_PUBLIC_*`).

## Migration one-shot (après déploiement)

Une fois `SUPABASE_SERVICE_ROLE_KEY` configurée localement dans `.env` :

```bash
npm run migrate:images
```

Le script :

1. Convertit toutes les images Supabase (`articles/`, `thumbnails/`) en WebP
2. Met à jour les chemins en base (`articles.image_path`, `videos.thumbnail_path`)
3. Supprime les anciens fichiers
4. Génère les variantes WebP dans `public/` (`only_gold_logo.webp`, etc.)

Le script est **idempotent** : les fichiers déjà en `.webp` sont ignorés.

## Uploads futurs

Depuis l'admin (`/admin`), les images d'articles et miniatures vidéo passent automatiquement par `/api/upload-media` :

- Vérification de la session admin (Bearer JWT)
- Redimensionnement (1920 px articles, 1280 px miniatures)
- Conversion WebP qualité 80
- Suppression des métadonnées EXIF
- Upload Storage avec le JWT admin (pas de service role)

Les fichiers vidéo (`.mp4`) ne sont pas convertis.

## Affichage public

Les pages Communication utilisent `next/image` avec des srcset responsives pour réduire encore le poids côté navigateur.
