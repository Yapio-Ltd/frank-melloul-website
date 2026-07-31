# Optimisation images WebP — déploiement

## Variables d'environnement

Toujours nécessaires (Render + local) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### `SUPABASE_SERVICE_ROLE_KEY` (migration Storage uniquement)

| Variable | Où la trouver |
|----------|----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` (secret) |

Cette clé n’est **pas** requise pour l’upload admin quotidien (`POST /api/upload-media` utilise le JWT de la session admin).

Elle est uniquement nécessaire pour :

- `npm run migrate:images` — migration one-shot du stock Supabase existant

**Ne jamais** exposer cette clé côté client (`NEXT_PUBLIC_*`).

## Assets `public/`

```bash
npm run optimize:images
```

Convertit / recompresse les logos et avatars en WebP, génère des favicons PNG légers, et retire les gros PNG inutiles.

## Migration Storage Supabase (one-shot)

Une fois `SUPABASE_SERVICE_ROLE_KEY` dans `.env` :

```bash
npm run migrate:images
```

Le script :

1. Convertit les images Supabase (`articles/`, `thumbnails/`) en WebP
2. Met à jour les chemins en base
3. Supprime les anciens fichiers
4. Lance aussi `optimize:images` pour `public/`

Idempotent : les fichiers déjà en `.webp` côté Storage sont ignorés.

## Uploads futurs (admin)

Depuis `/admin`, articles et miniatures vidéo passent par `/api/upload-media` :

- Runtime Node.js + `sharp` (redimensionnement + WebP qualité 80)
- Limite 15 Mo, formats JPG / PNG / WebP / GIF
- Upload Storage via JWT admin
- Vérif locale : `npm run test:images`

Les fichiers vidéo (`.mp4`) ne sont pas convertis.

## Affichage public

Header, Footer, biographie et pages Communication utilisent `next/image` (WebP/AVIF via Next).
