# Mesure des liens du livre

État au 25 septembre 2026 : la version initiale `96faa9b` est en production. La réception de `page_view` et de deux événements `book_outbound_click` a été vérifiée dans Google Analytics : `book_id=la_bascule` apparaît deux fois, et `retailer=fnac` et `retailer=amazon` une fois chacun. L’utilisateur a accepté les conditions Google Analytics dans le navigateur. L’extension de comptage agrégé sans cookies est validée localement, mais son code n’est pas déployé. La migration Supabase et ses restrictions d’accès sont vérifiées. Aucun jeton n’a encore été généré et aucun indicateur Render n’a été activé ; l’approbation demandée dans le navigateur reste en attente.

## Liens du livre

| Chemin sur `https://melloulandpartners.com` | Destination |
| --- | --- |
| `/livre` | Choix entre la Fnac et Amazon |
| `/livre/fnac` | `https://www.fnac.com/a23239513/Frank-Melloul-La-bascule` |
| `/livre/amazon` | `https://www.amazon.fr/bascule-coulisses-nouveau-Moyen-Orient/dp/B0H622KXCW` |

Pour distinguer les campagnes, diffuser par exemple `/livre/fnac?utm_source=newsletter&utm_medium=email&utm_campaign=la_bascule`. La page de choix conserve uniquement `utm_source`, `utm_medium`, `utm_campaign`, `utm_id`, `utm_term` et `utm_content` dans ses liens internes (200 caractères maximum par valeur). Les URL des libraires restent fixes. Ne pas mettre de nom, d’adresse e-mail ni d’autres données personnelles dans les paramètres de campagne.

## Configuration du site

| Élément | Valeur vérifiée |
| --- | --- |
| Compte Analytics | Melloul & Partners — `409522736` |
| Propriété GA4 | Melloul & Partners — Site web — `555898225` |
| Flux Web | `15843887263` — `https://melloulandpartners.com` |
| Identifiant de mesure | `G-5EBLGEKCHV` |
| Variable de construction | `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-5EBLGEKCHV` |
| Hébergement | Render, espace de travail Yapio, service `srv-d4rk6ua4i8rc739po6r0` |
| Source du service | Dépôt `Yapio-Ltd/frank-melloul-website`, branche `main` |

L’identifiant a été enregistré dans le fichier `.env` local et dans l’environnement Render, puis utilisé par la version initiale déployée. Les variables `NEXT_PUBLIC_*` sont intégrées à la construction de l’application : leur modification exige une reconstruction. **Save only** enregistre une variable Render sans effectuer ce déploiement.

L’identifiant de mesure est public ; ce n’est pas un secret ni une clé Measurement Protocol. Sans identifiant valide, le code n’envoie pas les événements GA4 ; les liens vers les libraires fonctionnent toujours.

La balise Google Ads existante utilise `AW-18259962578`. Elle ne remplace pas la configuration explicite d’un flux GA4.

Les fichiers principaux sont `src/lib/analytics-config.ts`, `src/lib/analytics-bootstrap.ts`, `src/components/AnalyticsPageViews.tsx`, `src/components/ConsentBanner.tsx`, `src/lib/book-links.ts` et `src/app/livre/BookRedirect.tsx`.

## Comportement implémenté

- Aucun script de mesure Google externe n’est chargé avant acceptation. Le choix est conservé dans `localStorage` sous `cookie-consent-v1`, et en mémoire si le stockage est indisponible. Le bouton « Cookies » permet de rouvrir les préférences.
- Après acceptation, le site configure GA4 si son identifiant est disponible, ainsi que Google Ads. Les signaux Google et la personnalisation publicitaire sont désactivés dans cette configuration ; `ad_user_data` et `ad_personalization` restent refusés.
- Le site émet explicitement `page_view` pour les visites et changements de route consentis, sauf les pages `/admin`. Le paramètre `send_page_view` de la configuration GA4 est désactivé pour éviter une page vue automatique au chargement.
- Tant que le compteur agrégé est désactivé, les routes des libraires conservent le fonctionnement initial : un choix accepté déclenche la mesure puis la redirection, un refus redirige sans événement GA4, et l’absence de choix affiche la bannière avec un lien direct utilisable sans accepter. Le lien fonctionne sans JavaScript.
- Une fois le compteur agrégé activé, les routes `/livre/fnac` et `/livre/amazon` ne demandent plus de choix de cookies et passent par `/go/fnac` ou `/go/amazon`. Sans acceptation préalable, la redirection est immédiate et aucun événement GA4 n’est émis. Avec acceptation préalable, l’événement GA4 précède la même redirection `/go`. La bannière reste disponible sur `/livre` et le reste du site.
- La redirection attend le rappel de la balise, avec une limite indépendante de 1,5 seconde si la balise est bloquée ou ne répond pas. Le rappel et le délai ne peuvent provoquer qu’une seule navigation. Les rediffusions d’effet React et les notifications répétées de consentement ne doivent pas doubler l’événement.

L’événement `book_outbound_click` est envoyé uniquement avec consentement et identifiant GA4, avec un `send_to` explicite :

| Paramètre | Valeur |
| --- | --- |
| `retailer` | `fnac` ou `amazon` |
| `book_id` | `la_bascule` |
| `link_url` | URL fixe du livre chez le libraire |
| `link_domain` | `www.fnac.com` ou `www.amazon.fr` |
| `outbound` | `true` |

Les clics e-mail existants sont mesurés par `mailTo`. Les conversions Google Ads existantes restent distinctes. `book_outbound_click` indique un départ vers un libraire, pas une vente : le site ne reçoit pas les achats réalisés sur Fnac ou Amazon. Les refus, les liens directs sans consentement, les bloqueurs et les départs sans JavaScript limitent les données GA4 disponibles.

## Compteur agrégé optionnel, distinct de GA4

`/go/fnac` et `/go/amazon` effectuent une redirection HTTP 303 vers les URL fixes des libraires. Lorsque le compteur est configuré, chaque requête GET incrémente uniquement un total par jour UTC et par libraire dans `public.book_redirect_daily_counts`. Aucun identifiant de visiteur, cookie, adresse IP, URL de campagne, en-tête ou référent n’est transmis au compteur. HEAD redirige sans incrémenter ; un libraire non autorisé retourne 404. Ces totaux sont séparés de GA4 et n’y sont pas envoyés.

Il s’agit de passages par le lien, pas de personnes uniques ni d’achats. Rechargements, visites répétées et robots peuvent compter plusieurs fois. Le stockage n’est pas réessayé en cas d’erreur ; une réponse perdue peut masquer une écriture déjà effectuée. Le délai maximal de comptage est de 800 ms et une indisponibilité ne bloque pas la redirection. Les éventuels journaux techniques de l’hébergeur ne font pas partie de cette table de compteurs.

L’activation exige les deux indicateurs et le secret serveur :

| Variable | Portée et effet |
| --- | --- |
| `BOOK_COUNTER_ENABLED=true` | Serveur : autorise l’incrément Supabase. |
| `NEXT_PUBLIC_BOOK_COUNTER_ENABLED=true` | Construction du client : supprime l’attente de consentement sur les deux routes des libraires et fait passer les redirections et liens de secours par `/go`. |
| `BOOK_COUNTER_TOKEN` | Secret serveur : autorise uniquement la fonction d’incrément. Ne jamais utiliser un préfixe `NEXT_PUBLIC_` ni placer sa valeur dans le dépôt. |

Le serveur réutilise `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. Il ne nécessite aucune clé `service_role`. Le jeton aléatoire doit être généré hors du navigateur avec au moins 32 octets d’aléa ; seul son condensat SHA-256 est enregistré dans le schéma privé de la base. Ce jeton donne accès à l’incrément, pas à la lecture, la remise à zéro ni la suppression des totaux.

La migration `scripts/add-book-redirect-counter.sql` a été exécutée dans l’interface Supabase avec le résultat « Success. No rows returned ». Le provisionnement du condensat via `scripts/provision-book-counter-token.sql`, la configuration du jeton et des indicateurs Render, puis le déploiement de cette extension restent à valider. L’absence d’activation conserve le comportement initial du client ; un appel direct à `/go` continue de rediriger même si son compteur est désactivé ou indisponible.

Contrôles d’accès effectués : RLS est activé sur les deux tables, `public.book_redirect_daily_counts` et `book_counter_private.credentials`. Le rôle `anon` n’a de droit ni SELECT ni INSERT sur ces tables. Les essais HTTP publics ont confirmé un refus `401 / 42501` pour la fonction d’incrément avec un jeton invalide et pour la lecture directe de la table des totaux. Ces contrôles ne valident pas encore un incrément avec un jeton autorisé, puisqu’aucun jeton n’a été créé.

La lecture des totaux est réservée au propriétaire de la base via SQL ; les rôles publics n’ont pas accès à la table. Aucune page publique de statistiques n’est ajoutée. Exemple à exécuter avec les droits du propriétaire :

```sql
SELECT day, retailer, click_count
FROM public.book_redirect_daily_counts
ORDER BY day DESC, retailer;
```

Cette requête de consultation est [enregistrée dans l’éditeur SQL Supabase](https://supabase.com/dashboard/project/rhucqyogszkxrngnouyv/sql/011a5337-1725-4451-9e52-d21e0496d133). Son accès requiert les autorisations du projet ; ce n’est pas un lien public vers les statistiques.

## Configuration Google vérifiée

- [x] Conditions Google Analytics acceptées par l’utilisateur dans le navigateur.
- [x] Compte, propriété et flux Web identifiés avec les valeurs ci-dessus.
- [x] Identifiant GA4 enregistré dans l’environnement local et l’environnement Render, sans déploiement via cette action d’enregistrement.
- [x] Mesure améliorée des changements de page fondée sur l’historique du navigateur désactivée : l’application envoie ses propres `page_view`.
- [x] Recherche sur le site et interactions avec les formulaires désactivées dans la mesure améliorée. Défilement, clics sortants, vidéos et téléchargements restent activés.
- [x] Dimensions personnalisées de portée événement créées et vérifiées : **Libraire** → `retailer` et **Livre** → `book_id`.
- [x] `book_outbound_click` configuré via **Créer avec du code**, marqué comme événement clé, compté une fois par événement, sans valeur monétaire par défaut. Aucune règle de création sans code ne reproduit cet événement.

Cette liste décrit uniquement les réglages vérifiés. Elle ne confirme aucune modification des autres paramètres du compte ou de la propriété, notamment le partage de données et la conservation.

## Validation en production

- [x] Version initiale `96faa9b` mise en ligne sur Render avec le véritable identifiant GA4.
- [x] Réception de `page_view` et de deux événements `book_outbound_click` vérifiée ; `book_id=la_bascule` apparaît deux fois, avec un départ `retailer=fnac` et un départ `retailer=amazon`.
- [x] Migration du compteur agrégé exécutée dans Supabase sans erreur affichée.
- [x] RLS et absence de droits SELECT/INSERT du rôle `anon` vérifiés sur les deux tables ; lecture publique des totaux et appel avec jeton invalide refusés par HTTP `401 / 42501`.
- [ ] Finaliser le jeton limité au compteur et les paramètres Render après approbation, puis déployer l’extension avec ses deux indicateurs activés.
- [ ] Vérifier en production le passage sans attente par `/go`, l’incrément des totaux pour les deux libraires, l’absence de GA4 sans consentement et une seule requête `/go` lors d’un clic sur le lien de secours pendant l’attente de GA4. Confirmer également l’attribution d’un lien UTM dans GA4 ; les totaux SQL ne mesurent pas les campagnes.

Le lien vers les explications de Google est présent dans les trois versions de la politique de confidentialité : [utilisation des informations des sites partenaires](https://policies.google.com/technologies/partner-sites).

## Vérification locale

La construction complète avec l’identifiant réel `G-5EBLGEKCHV` et `NEXT_PUBLIC_BOOK_COUNTER_ENABLED=true` a réussi après correction de la concurrence entre le lien de secours et la redirection automatique. Les 18 tests de liens, les 10 tests du compteur et la suite de consentement passent.

`node --experimental-strip-types --test scripts/test-book-links.mjs` vérifie les deux modes d’activation, le consentement, les paramètres de campagne, les destinations, le rappel, le délai, l’annulation et les erreurs de balise. `scripts/test-book-counter.mjs` couvre les redirections serveur et le compteur ; `scripts/test-analytics-consent.ts` couvre le consentement. Pour reproduire la validation, exécuter également `npm run lint`, `npx tsc --noEmit` et `npm run build`, puis contrôler dans un navigateur les pages avec et sans JavaScript, le consentement initial et les choix déjà enregistrés. Sans JavaScript, le lien de secours passe par le compteur lorsqu’il est activé ; aucune redirection automatique sans JavaScript n’est ajoutée. La réussite de ces tests locaux n’active pas le compteur en production.
