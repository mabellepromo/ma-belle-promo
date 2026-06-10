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

### Correctif retenu : REFONTE pagination (vérifié au rendu PDF réel)

Objectif final (demandé par Eric) : pied **au ras du bas de CHAQUE
feuille, dernière page incluse**, sans page parasite. Aucune astuce CSS
pure n'y arrive (un `tfoot` suit le contenu sur la dernière page ; un
pied `position: fixed` + spacer crée des pages vides). On a donc refondu
le **moteur de pagination JS** du template pour que **chaque `.page` =
exactement une feuille A4**, avec le pied en bas via le tableau.

**Principe :** le script scinde le corps pour qu'il tienne sur chaque
feuille (recherche binaire au mot), crée une `.page` par feuille, et le
pied (`table-row`) est poussé au bas par la rangée de contenu
(`height:100%`). La signature est déplacée sur la **dernière** feuille.

**Points clés du JS** (`<script>` du template) :
- `var PAGE_H = 1080;` — budget de hauteur par feuille, en px. Volontaire-
  ment < 1122,5px (feuille A4 @96dpi) : marge de sécurité car le découpage
  est calculé AVANT l'injection du CSS de CourrierSection et le rendu mm.
  **Ne plus mesurer `.page.offsetHeight`** (débordé = hauteur géante → 0
  scission : c'était le bug d'origine).
- `paginate()` détache le bloc politesse+signature, scinde le corps sur N
  feuilles, puis **réinsère la signature à la fin de la dernière feuille**
  (sur une feuille de plus si ça déborde).

**Autres points clés du JS :**
- Au démarrage, on injecte `.corps-lettre { min-height: 0 }` (sinon le
  `min-height:280px` d'écran gonfle la mesure d'un corps court → scissions
  prématurées, courrier 1 page qui passait à 2) et `img[alt^="Cachet"] {
  height:90px }` (cachet chargé en async → mesure stable du bloc signature).
- La signature est cherchée **n'importe où** dans le document (pas que
  page 1) puis détachée AVANT de purger les pages dynamiques → idempotent
  au 2ᵉ passage de pagination (CourrierSection pagine 2 fois).
- Sa hauteur est **réservée sur la dernière feuille** : si corps+signature
  déborde, on repousse le surplus de corps → la signature reste **collée à
  la fin du corps** (et ne part pas seule, haut d'une page presque vide).

**Points clés du CSS `@media print` :**
```css
@page { size: A4; margin: 0; }
@media print {
  body { display: block; }          /* sinon flex+gap:24px insère des feuilles */
  /* .page en FLEX colonne (plus fiable que table+height:100% selon le
     navigateur) → le contenu pousse le pied tout en bas de chaque feuille */
  .page { height: 296mm; min-height: 0 !important; display: flex; flex-direction: column; }
  .page-header  { flex: 0 0 auto; }
  .page-content { flex: 1 1 auto; }   /* prend la place → pied en bas */
  .page-footer  { flex: 0 0 auto; }
  .page-cell    { display: block; }
  .page-dynamic { page-break-before: always; } /* chaque page suivante sur sa feuille */
  [contenteditable]:empty::before { content: "" !important; } /* pas de placeholder fantôme */
}
```
- `body { display: block }` : INDISPENSABLE (sinon `gap:24px` du flex →
  feuilles parasites).
- `.page` en **flex colonne** + `.page-content { flex:1 }` : pousse le pied
  au bas de chaque feuille de façon fiable (le `display:table+height:100%`
  marchait sous Chrome mais pas partout).
- `.page { height: 296mm }` (< 297mm) : anti-débordement sous-pixel.
- `.page-dynamic { page-break-before: always }` : `break-BEFORE`, pas
  `break-after` (qui insère un blanc sur un élément pleine feuille).

Validation PDF (Puppeteer, pipeline **deux passes** `injectValues` fidèle,
cachet inclus) : court → 1 feuille, moyen → 2, long → 3, « corps qui
remplit presque une page » → 2. **DOM .page == feuilles PDF** (aucune
parasite), pied **au ras du bas de chaque feuille**, signature **collée au
corps** sur la dernière, zéro chevauchement, pas de placeholder.

### Pièges écartés (ne pas y revenir)
- `position: fixed` + `@page margin-bottom` → blanc sous le pied.
- `bottom: -24mm` → éjecte le pied sur la page suivante.
- `transform: translateY` sur le pied fixe → clippé.
- `table-footer-group` (tfoot) → ne se cale pas en bas d'une dernière
  page partielle (suit le contenu).
- pied fixe + spacer `tfoot` → crée une feuille quasi vide quand le texte
  remplit presque une feuille.
- `page-break-after: always` sur une `.page` pleine feuille → feuille blanche.
- mesurer `PAGE_H` sur la page, ou `PAGE_H` trop proche de 1122,5px → débord.

### Repère pour V2 → V7
- Même refonte : modèle en `display: table` (en-tête/contenu/pied en
  rangées), script de pagination avec `PAGE_H` à marge de sécurité,
  `body { display:block }` + `.page-dynamic { break-before }` en print.
  Les modèles en **flex** doivent d'abord être restructurés en tableau.

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
