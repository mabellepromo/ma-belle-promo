# 🔒 GEL — Rubrique Courriers (originale)

**Date du gel : 30 juin 2026**
**Tag git associé : `courrier-original-freeze`**

## Pourquoi ce dossier

Copie **strictement intacte** de la rubrique Courriers et de ses 7 modèles
de papier à en-tête, faite **avant** la création des versions au format
courriel (email). Cette copie est la référence de restauration.

## Contenu

- `CourrierSection.jsx` — composant dashboard d'origine (copie de
  `src/pages/dashboard/CourrierSection.jsx`)
- `docs/papier-entete-v1..v7*.html` — les 7 modèles HTML d'origine (copie de
  `public/docs/`)

## ⚠️ Règle

**Ne jamais modifier ce dossier.** Il sert uniquement de référence figée.
Toute évolution (version courriel) se fait sur des fichiers séparés, sans
toucher aux originaux ci-dessus ni aux fichiers de production.

## Restauration

- Depuis le tag : `git checkout courrier-original-freeze -- public/docs src/pages/dashboard/CourrierSection.jsx`
- Ou copier manuellement les fichiers de ce dossier vers leur emplacement.
