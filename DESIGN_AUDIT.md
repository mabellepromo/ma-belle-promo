# Audit Design — Ma Belle Promo
*Réalisé le 10 mai 2026*

---

## Palette de couleurs

### Mode clair

| Rôle | Valeur HSL | Hex approximatif |
|------|-----------|-----------------|
| Background | hsl(150, 10%, 97%) | `#f5f7f5` — blanc cassé verdâtre |
| Foreground | hsl(150, 30%, 10%) | `#111a13` — quasi-noir |
| **Primary** | hsl(153, 50%, 28%) | `#237842` — vert forêt |
| **Accent** | hsl(38, 70%, 55%) | `#c89b3c` — or/ambre |
| Muted foreground | hsl(150, 10%, 45%) | `#697069` — gris moyen |
| Border | hsl(150, 10%, 87%) | `#dce4dc` — gris clair |

### Hero (section sombre — couleurs hardcodées)

| Usage | Valeur |
|-------|--------|
| Fond | `hsl(150, 28%, 8%)` — vert nuit |
| Bouton "Notre mission" | `rgba(52,211,153,0.30)` + texte `#6ee7b7` — vert menthe |
| Bouton "Nous soutenir" | `#f59e0b → #fbbf24` — or chaud |

**Identité chromatique** : vert forêt + or ambre = référence au droit togolais + nature.
Cohérent, distinctif, crédible pour une association juridique.

---

## Typographie

| Usage | Police | Taille | Poids |
|-------|--------|--------|-------|
| Titres h1 | Cormorant Garamond | clamp(2rem, 4vw, 3.2rem) | 700 |
| Titres h2 | Cormorant Garamond | clamp(1.5rem, 2.8vw, 2.4rem) | 700 |
| Titres h3 | Cormorant Garamond | clamp(1.1rem, 2vw, 1.5rem) | 600 |
| Corps (body) | DM Sans | **14px** / line-height 1.50 | 400 |
| Eyebrow (label décoratif) | DM Sans | **0.65rem (10.4px)** | 700 |
| `<strong>` | DM Sans | 14px | **400** (gras désactivé) |

> **Note :** CLAUDE.md mentionne "Lato" mais le code utilise DM Sans — documentation à corriger.

---

## Layout

- Conteneur max : `max-w-7xl` (1280px)
- Padding horizontal : `px-6` (24px)
- Sections : `py-16 md:py-24`
- Grilles : `md:grid-cols-2`, `lg:grid-cols-3`
- Navbar fixe + safe area iOS (`env(safe-area-inset-top)`)
- Footer inversé (bg-foreground / text-background)

---

## Composants clés

| Composant | Description |
|-----------|-------------|
| `HeroSection` | Fond sombre dégradé vert, bulle d'eau animée, stats counter, 2 CTAs |
| `MissionSection` | 2 colonnes texte/image + 3 tuiles de navigation (Statut, Credo, Ambition) |
| `Navbar` | Dropdowns multi-niveau, logo centré, auth, safe area |
| `FooterSection` | Dark, newsletter double opt-in, réseaux sociaux, logo |
| Eyebrow | Label DM Sans uppercase 0.65rem, pattern répété sur toutes les sections |

---

## Points forts

### 1. Identité visuelle forte
Vert forêt + or ambre + Cormorant Garamond = registre "cabinet d'avocat élégant".
Cohérent avec l'identité juridique de l'association FDD. Mémorable et distinctif.

### 2. Typographie à deux niveaux bien dosée
Cormorant Garamond pour les titres crée de la noblesse. DM Sans pour les corps
garantit la lisibilité. Le contraste serif/sans-serif fonctionne bien ensemble.

### 3. Système de variables CSS solide
Tout passe par `--primary`, `--accent`, etc. — thème clair/sombre cohérent et maintenable.

### 4. Animations respectueuses
`useReducedMotion()` appliqué partout — accessibilité motion correcte.
Les effets (bulle d'eau, glow, parallax) enrichissent sans alourdir.

### 5. Hiérarchie visuelle constante
Le pattern `eyebrow → titre → corps → CTA` est appliqué de façon uniforme
d'une section à l'autre. Lecture guidée, expérience prévisible.

---

## Faiblesses et recommandations

| Priorité | Point | Problème | Action recommandée |
|----------|-------|----------|-------------------|
| 🔴 Haute | Body à 14px | Trop petit pour le public mobile africain. WCAG AA recommande 16px minimum. | Passer `font-size: 16px` dans `body` (index.css:98) |
| 🔴 Haute | Logo Footer externe | `media.base44.com` — si base44 coupe l'hébergement, le logo disparaît en production. | Télécharger le logo et le servir depuis `/public/images/` |
| 🟡 Moyenne | Eyebrow à 10.4px | En dessous du seuil WCAG (12px min). Quasi illisible sur petit écran avec luminosité réduite. | Passer à `0.75rem` (12px) dans index.css |
| 🟡 Moyenne | Couleurs Hero hardcodées | `rgba(52,211,153,...)`, `#6ee7b7`, `#f59e0b` non liées aux variables CSS — le thème sombre ne s'applique pas au Hero. | Remplacer par `var(--primary)`, `var(--accent)` |
| 🟢 Basse | `strong { font-weight: 400 }` | Le gras est invisible dans tous les articles Markdown — l'emphase éditoriale ne fonctionne pas. | Restreindre la règle aux titres uniquement, passer `strong` à `font-weight: 500` |
| 🟢 Basse | Documentation "Lato" | CLAUDE.md mentionne Lato mais le code utilise DM Sans. | Corriger CLAUDE.md |

---

## Résumé

Le design de Ma Belle Promo est **solide dans son identité et sa cohérence visuelle**.
Les deux fragilités les plus importantes à corriger sont la taille du corps (accessibilité mobile)
et le logo Footer externe (résilience production). Le reste relève de l'affinement.
