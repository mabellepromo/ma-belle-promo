# Papier à en-tête MBP — Système de marges 2 cm (zone de sécurité A4)

Référence technique pour la mise en conformité des marges d'impression
des modèles de courrier officiel du dashboard MBP.

## Contexte / architecture réelle

Les modèles **ne sont pas des composants React**. Ce sont des fichiers
HTML autonomes avec CSS inline :

- `public/docs/papier-entete-vX-*.html` → **copie servie en production**
  (chargée par `fetch('/docs/...')` dans `CourrierSection.jsx`).
- `docs/papier-entete-vX-*.html` → copie de travail / archive (à garder
  synchronisée manuellement).

Le flux : `CourrierSection.jsx` charge le HTML brut → injecte les valeurs
du formulaire dans une `<iframe>` (`injectValues`) → ouvre un nouvel
onglet → `window.print()`. **Aucun CSS de l'app React n'atteint ces
fichiers** : toute config de marge doit vivre dans le HTML lui-même.

## Ce qui fonctionne — V1 « Classique » (fait)

### Variables CSS de configuration (réutilisables)

Ajoutées au `:root` du fichier V1 :

```css
--mbp-page-w:   210mm;   /* Largeur A4 */
--mbp-page-h:   297mm;   /* Hauteur A4 */
--mbp-margin:   20mm;    /* Marge / zone de sécurité = 2 cm (4 côtés) */
--mbp-footer-h: 93px;    /* Hauteur réservée au pied en impression */
```

**Pourquoi des mm et pas des px ?** Le mm est une unité physique : le
navigateur la rend de façon identique à l'écran (96 dpi → 20mm ≈ 75,6 px)
et à l'impression. C'est ce qui garantit le **comportement identique
écran / PDF** exigé.

### Application (modèle « header full-bleed conservé »)

Choix retenu : le bandeau vert d'en-tête et le pied gardent leur **fond
pleine largeur** (bord à bord). La zone de sécurité de 2 cm s'applique au
**contenu** (logo, titre, corps de lettre, infos de pied) :

| Bloc | Avant | Après |
|------|-------|-------|
| `.header` | `28px 40px 24px` | `28px var(--mbp-margin) 24px` |
| `.body`   | `36px 48px 80px` | `36px var(--mbp-margin) 80px` |
| `.footer` | `14px 40px`      | `14px var(--mbp-margin)` |

Bénéfice secondaire : le logo de l'en-tête et le texte du corps partagent
désormais **le même bord gauche** (2 cm), alors qu'ils étaient légèrement
désalignés (40 px vs 48 px) auparavant.

### Reset / base déjà en place (rien à ajouter)

- `* { box-sizing: border-box; margin: 0; padding: 0; }`
- `@page { margin: 0; }` → la feuille remplit le papier, les marges sont
  gérées par le padding interne (indispensable pour le full-bleed).
- `.page` = `794×1123px` à l'écran, `210mm×297mm` à l'impression.

## Validation à effectuer (Eric)

1. Dashboard → Courrier officiel → modèle **Classique** → rédiger un texte
   long (≥ 1 page) → **Générer**.
2. Dans l'onglet ouvert : **Ctrl+P → Destination : PDF → Format A4**.
3. Vérifier visuellement :
   - [ ] Texte du corps à 2 cm des bords gauche/droite.
   - [ ] Aucune coupure de texte aux bords.
   - [ ] Pied de page non chevauché par le corps.
   - [ ] Bandeau vert toujours bord à bord (full-bleed voulu).
   - [ ] Pagination correcte sur 2+ pages.
4. Refaire le test sous **Chrome** et **Firefox**.

## Pied de page à l'impression — chevauchement corrigé (V1)

### Symptôme
À l'écran : OK. À l'impression / export PDF (Ctrl+P) : le contenu
s'écrivait **par-dessus le pied de page**, sur plusieurs feuilles.

### Cause racine
Le pied est en `position: fixed` (pour se répéter en bas de chaque
feuille), mais `@page { margin: 0 }` **ne réservait aucun espace** :
le contenu coulait jusqu'au bord et passait sous le pied.
La tentative `margin-bottom` sur `.page-content` était inopérante
(les marges sont ignorées sur un `display: table-row`).

### Correctif retenu (vérifié au rendu PDF réel, Chrome headless)

Le pied utilise les **groupes natifs de tableau** : il se cale au bas
PHYSIQUE de chaque feuille, se répète et réserve sa hauteur. C'est ce qui
le « colle au bas de page » — un pied `position: fixed` en était
incapable (toujours décalé de la marge `@page`, jamais au ras du bord).

```css
@page { size: A4; margin: 0; }

@media print {
  /* min-height:100vh → un courrier COURT remplit la feuille et pousse le
     pied (tfoot) tout en bas ; un courrier LONG dépasse 100vh et pagine
     normalement. Neutralise aussi le minHeight injecté par CourrierSection. */
  .page { height: auto !important; min-height: 100vh !important; }

  /* En-tête rendu une seule fois ; pied au bas de chaque feuille, répété,
     hauteur réservée (pas de chevauchement). */
  .page-header  { display: table-row-group; }
  .page-content { display: table-row-group; }
  .page-footer  { display: table-footer-group; }
}
```

Validation : PDF via Puppeteer (chemin identique à Ctrl+P,
`preferCSSPageSize`), pipeline `injectValues` reproduit fidèlement.
- **Court** → 1 page, pied **collé au bord inférieur**.
- **Long** → 3 pages, en-tête une seule fois, pied collé en bas de chaque
  page pleine, **zéro chevauchement**.

**Limite connue acceptée :** sur une dernière page PARTIELLE d'un courrier
multi-pages, le pied suit le contenu (au lieu d'être au ras du bas) —
comportement standard d'un `tfoot`, rare en pratique (courriers 1 page).

### Pièges écartés (ne pas y revenir)
- `position: fixed; bottom: 0` + `@page margin-bottom` → laisse un blanc
  sous le pied (le fixed est prisonnier de la zone de contenu).
- `bottom: -24mm` → éjecte le pied sur la page suivante.
- `transform: translateY(24mm)` sur le pied fixe → pied clippé / déplacé.
- `table-footer-group` AVEC `height: 297mm` ou `minHeight` forcé → casse
  la pagination du tableau (pied bloqué au milieu). D'où `min-height:100vh`
  + `height:auto`.

### Repère pour V2 → V7
- **Hauteur naturelle du pied V1 : 74 px.**
- Recette portable sur tout modèle en `display: table` : passer en-tête →
  `table-row-group`, contenu → `table-row-group`, pied → `table-footer-group`,
  `@page margin:0`, `.page { height:auto; min-height:100vh }`. Les modèles
  bâtis en **flex** doivent d'abord être restructurés en tableau.

## Plan pour décliner V2 → V7 (séance suivante)

⚠️ Ne pas copier-coller aveuglément : chaque modèle a ses propres classes
et sa propre logique de mise en page. Approche recommandée, modèle par
modèle :

1. **Coller le même bloc de variables** `--mbp-*` dans le `:root`.
2. **Identifier les blocs de contenu** de chaque modèle (les noms de
   classes varient : `.e-corps`, `.objet-band`, `.footer-zone`, etc.).
3. **Cas particuliers connus** :
   - **V2 Moderne** : bandeau vertical à gauche → padding asymétrique
     (ex. `36px 48px 80px 54px`). La marge de 2 cm se mesure **après** le
     bandeau, pas depuis le bord physique.
   - **V4 Sobriété / V6 Typographique** : fond blanc, pas de full-bleed →
     on peut viser une vraie marge blanche de 2 cm sur les 4 côtés.
   - **V5 Arrondi / V7 Cadre décoratif** : la bordure / le cadre devient
     la limite visuelle. La zone de sécurité de 2 cm doit englober le
     cadre (le cadre lui-même reste à l'intérieur des 2 cm pour ne pas
     être rogné à l'impression).
4. **Décider full-bleed vs marge blanche stricte** pour chaque modèle
   (décision esthétique, à valider avec Eric).
5. **Tester chaque modèle** via la checklist ci-dessus.
6. **Synchroniser** systématiquement `public/docs/` ET `docs/`.

> Option d'industrialisation (à discuter) : si les 7 modèles convergent
> vers la même config, on pourrait centraliser le bloc de variables et la
> zone de sécurité dans `injectValues()` (CSS injecté côté `CourrierSection`)
> plutôt que de le dupliquer dans 7 fichiers. Avantage : une seule source
> de vérité. Inconvénient : couplage app ↔ modèles, et il faut neutraliser
> les paddings en dur de chaque modèle. À évaluer après V2-V7 manuel.
