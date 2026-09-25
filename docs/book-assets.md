# Visuels de la page livre

## Logos des libraires

Vérifiés et téléchargés le 25 septembre 2026. Les fichiers sont servis localement ; aucune requête vers les hébergeurs des logos n'est nécessaire lors de l'affichage de la page.

| Fichier | Source et auteur indiqués | Format |
| --- | --- | --- |
| `public/book/amazon.svg` | [Amazon 2024.svg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Amazon_2024.svg), Amazon.com, Inc., Koto et NaN | SVG, `viewBox="0 0 398.61 133.49"` |
| `public/book/fnac.svg` | [Fnac Logo.svg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Fnac_Logo.svg), original du logo Fnac converti depuis Illustrator ; auteur du fichier non précisé | SVG, `viewBox="0 0 499.098 515.098"` |

Fichiers sources :

- [SVG Amazon](https://upload.wikimedia.org/wikipedia/commons/0/06/Amazon_2024.svg)
- [SVG Fnac](https://upload.wikimedia.org/wikipedia/commons/2/2e/Fnac_Logo.svg)

Les notices Commons indiquent `PD-textlogo`. Ces signes identifient les libraires vers lesquels pointent les liens d'achat. Les tracés et couleurs d'origine sont conservés. Les métadonnées d'éditeur, commentaires, identifiants et déclaration DTD ont été retirés ; les SVG ne contiennent que les éléments `svg`, `g` et `path`, sans script ni ressource externe. Les dimensions physiques du SVG Amazon ont été normalisées en unités SVG pour faciliter son intégration. Le logo Fnac conserve ses découpes transparentes : l'afficher sur un fond blanc fait apparaître les lettres en blanc.

## Couverture et contenu

- `public/book/la-bascule-cover.jpg` : couverture affichée dans la [fiche Amazon du livre](https://www.amazon.fr/bascule-coulisses-nouveau-Moyen-Orient/dp/B0H622KXCW), [asset Amazon](https://m.media-amazon.com/images/I/41QcUKalF4L.jpg), 316 × 500 pixels. Fichier téléchargé sans modification le 25 septembre 2026.
- Portrait de Frank Melloul : `public/frank_melloul_avatar.webp`, visuel déjà utilisé par la biographie du site.
- Titre, éditeur, date de parution et ISBN recoupés avec [l’éditeur](https://editions-observatoire.com/livre/La-bascule/679), Amazon et [la Fnac](https://www.fnac.com/a23239513/Frank-Melloul-La-bascule). Résumé reformulé, sans reproduction intégrale du texte éditorial. La biographie reprend les faits de `src/lib/translations.ts`.
- La pagination n’est pas affichée, faute de confirmation fiable. Le tarif et les modalités de livraison restent chez les libraires. Le libellé « Précommander » devient « Commander » à partir du 1er octobre 2026, heure de Paris.

## Présentation

La page prolonge l’identité existante du site : fond bleu nuit, typographie Cormorant Garamond, texte Instrument Sans et accents dorés. Sa composition met en regard le titre et la couverture sur un aplat papier, puis présente le résumé, les détails de publication, l’auteur et les liens de commande. Les mêmes liens internes et paramètres UTM sont conservés. Les routes de redirection restent exclues de l’indexation ; `/livre` devient une page éditoriale indexable avec données structurées Book.
