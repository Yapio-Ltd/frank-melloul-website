# Mesure des liens du livre

État au 25 septembre 2026 : l’implémentation est validée localement et la configuration Google Analytics ci-dessous a été vérifiée dans son interface. L’utilisateur a accepté les conditions Google Analytics dans le navigateur. La publication du code et la réception effective des événements en production restent à vérifier.

## Liens à utiliser après déploiement

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

L’identifiant a été enregistré dans le fichier `.env` local et dans l’environnement Render avec l’action **Save only** ; sa présence dans le champ Render a été vérifiée. Cet enregistrement ne déploie pas le nouveau code : publier la branche, reconstruire et vérifier le déploiement reste nécessaire. Les variables `NEXT_PUBLIC_*` sont intégrées à la construction de l’application.

L’identifiant de mesure est public ; ce n’est pas un secret ni une clé Measurement Protocol. Sans identifiant valide, le code n’envoie pas les événements GA4 ; les liens vers les libraires fonctionnent toujours.

La balise Google Ads existante utilise `AW-18259962578`. Elle ne remplace pas la configuration explicite d’un flux GA4.

Les fichiers principaux sont `src/lib/analytics-config.ts`, `src/lib/analytics-bootstrap.ts`, `src/components/AnalyticsPageViews.tsx`, `src/components/ConsentBanner.tsx`, `src/lib/book-links.ts` et `src/app/livre/BookRedirect.tsx`.

## Comportement implémenté

- Aucun script de mesure Google externe n’est chargé avant acceptation. Le choix est conservé dans `localStorage` sous `cookie-consent-v1`, et en mémoire si le stockage est indisponible. Le bouton « Cookies » permet de rouvrir les préférences.
- Après acceptation, le site configure GA4 si son identifiant est disponible, ainsi que Google Ads. Les signaux Google et la personnalisation publicitaire sont désactivés dans cette configuration ; `ad_user_data` et `ad_personalization` restent refusés.
- Le site émet explicitement `page_view` pour les visites et changements de route consentis, sauf les pages `/admin`. Le paramètre `send_page_view` de la configuration GA4 est désactivé pour éviter une page vue automatique au chargement.
- Sur les routes des libraires, un choix déjà accepté déclenche la mesure puis la redirection. Un refus redirige sans événement GA4. Sans choix préalable, la page attend une réponse à la bannière ; son lien direct permet également de continuer sans accepter. Le lien fonctionne sans JavaScript.
- La redirection attend le rappel de la balise, avec une limite indépendante de 1,5 seconde si la balise est bloquée ou ne répond pas. Le rappel et le délai ne peuvent provoquer qu’une seule navigation. Les rediffusions d’effet React et les notifications répétées de consentement ne doivent pas doubler l’événement.

L’événement `book_outbound_click` est envoyé uniquement avec consentement et identifiant GA4, avec un `send_to` explicite :

| Paramètre | Valeur |
| --- | --- |
| `retailer` | `fnac` ou `amazon` |
| `book_id` | `la_bascule` |
| `link_url` | URL fixe du livre chez le libraire |
| `link_domain` | `www.fnac.com` ou `www.amazon.fr` |
| `outbound` | `true` |

Les clics e-mail existants sont mesurés par `mailTo`. Les conversions Google Ads existantes restent distinctes. `book_outbound_click` indique un départ vers un libraire, pas une vente : le site ne reçoit pas les achats réalisés sur Fnac ou Amazon. Les refus, les liens directs sans consentement, les bloqueurs et les départs sans JavaScript limitent les données disponibles.

## Configuration Google vérifiée

- [x] Conditions Google Analytics acceptées par l’utilisateur dans le navigateur.
- [x] Compte, propriété et flux Web identifiés avec les valeurs ci-dessus.
- [x] Identifiant GA4 enregistré dans l’environnement local et l’environnement Render, sans déploiement via cette action d’enregistrement.
- [x] Mesure améliorée des changements de page fondée sur l’historique du navigateur désactivée : l’application envoie ses propres `page_view`.
- [x] Recherche sur le site et interactions avec les formulaires désactivées dans la mesure améliorée. Défilement, clics sortants, vidéos et téléchargements restent activés.
- [x] Dimensions personnalisées de portée événement créées et vérifiées : **Libraire** → `retailer` et **Livre** → `book_id`.
- [x] `book_outbound_click` configuré via **Créer avec du code**, marqué comme événement clé, compté une fois par événement, sans valeur monétaire par défaut. Aucune règle de création sans code ne reproduit cet événement.

Cette liste décrit uniquement les réglages vérifiés. Elle ne confirme aucune modification des autres paramètres du compte ou de la propriété, notamment le partage de données et la conservation.

## Validation de production restante

- [ ] Publier le code sur `main`, vérifier la reconstruction et la mise en ligne du service Render avec le véritable identifiant GA4.
- [ ] Confirmer dans Temps réel ou DebugView la réception de `page_view` et `book_outbound_click`, leurs paramètres et l’attribution d’un lien UTM après consentement. Vérifier un seul événement de départ par navigation et l’absence de collecte en cas de refus. Les tests locaux ne remplacent pas cette confirmation de réception.

Le lien vers les explications de Google est présent dans les trois versions de la politique de confidentialité : [utilisation des informations des sites partenaires](https://policies.google.com/technologies/partner-sites).

## Vérification locale

La construction et les tests locaux avec l’identifiant réel `G-5EBLGEKCHV` ont réussi. `node --experimental-strip-types --test scripts/test-book-links.mjs` vérifie le consentement, les paramètres de campagne, les destinations, le rappel, le délai, l’annulation et les erreurs de balise. Pour reproduire la validation, exécuter également `npm run lint`, `npx tsc --noEmit` et `npm run build`, puis contrôler dans un navigateur les pages avec et sans JavaScript, le consentement initial et les choix déjà enregistrés. Un test local ne confirme pas la réception dans la propriété GA4 de production.
