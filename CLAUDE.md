# Projet MBP - Instructions pour Claude Code

## Contexte du projet
Site web de l'association FDD Ma Belle Promo, association des
diplômés de la Faculté de Droit du Développement de l'Université
de Lomé au Togo, promotion 1994-2000. Le projet remplace un
ancien site Wix par une application React moderne et autogérable.

## Profil du développeur
Eric, développeur autodidacte en montée en compétence. Comprend
les concepts généraux de React mais manque d'expérience des
bonnes pratiques industrielles. Préfère qu'on lui explique le
raisonnement derrière les recommandations plutôt que de recevoir
des solutions clé en main.

## Histoire du projet
Le projet a d'abord été développé sur la plateforme no-code
base44.app, puis exporté pour être poursuivi avec Claude Code et
hébergé sur Vercel à l'adresse mabellepromo.vercel.app.

## Stack technique
React 18 avec Vite, TailwindCSS avec variables CSS pour le thème
clair sombre, Framer Motion pour les animations, React Router v6,
Supabase pour le backend (PostgreSQL, Auth, Storage), ReactMarkdown
et ReactQuill pour les contenus riches, Cormorant Garamond et Lato
pour la typographie, hébergement Vercel.

## Dettes techniques conscientes

### Dette 1 : structure de données mbp_store
La table Supabase mbp_store utilise un format clé-valeur JSON
introduit pour résoudre un problème de synchronisation entre
appareils. Fonctionnelle mais non optimale pour les fonctionnalités
de recherche avancée. Migration progressive vers un schéma
relationnel classique planifiée mais non urgente.

### Dette 2 : authentification LocalAuth
Le fichier LocalAuth.jsx utilise localStorage pour simuler une
authentification. N'offre aucune sécurité réelle. Migration vers
Supabase Auth impérative avant toute mise en production.

## Comportement attendu de Claude Code

### Posture générale
Considérer que ce projet est à la fois un livrable pour
l'association et un terrain d'apprentissage pour Eric. Toujours
expliquer le pourquoi avant le comment. Pour les alternatives
techniques, présenter plusieurs options avec leurs avantages et
inconvénients plutôt que de choisir sans discuter.

### Gestion des dettes techniques
Ne pas proposer de refactorisation massive non demandée. Mais
signaler calmement quand une tâche en cours offre une occasion
naturelle de progresser sur une dette.

### Mode de travail
Eric alterne entre deux modes de travail qu'il annoncera en début
de session. Mode livraison pour avancer vite et obtenir des
résultats concrets. Mode apprentissage pour explorer et comprendre
en profondeur. Adapter les réponses au mode annoncé.

### Conventions de code
Commentaires en français, variables et fonctions en anglais.
Toujours donner le code complet et exécutable, jamais de fragments
avec des "..." ou "reste du code". Respecter ESLint standard pour
JavaScript et TypeScript. Préférer les fonctions pures et le code
typé. Mentionner les versions de dépendances quand c'est pertinent.

### En cas de doute
Si incertain sur une API ou une syntaxe, utiliser la recherche web
plutôt que d'inventer. Pour le debug, demander le message d'erreur
complet si absent.

## Roadmap actuelle

Trois sessions prioritaires identifiées dans cet ordre.

Session A prioritaire : audit et stabilisation du Dashboard. Traite
les patterns useCrud qui peuvent perdre des données silencieusement
et met en place une gestion propre des états de chargement et d'erreur.

Session B : migration vers Supabase Auth pour remplacer LocalAuth.
Débloque la mise en production.

Session C : migration des articles vers une table relationnelle
dédiée. Entrée dans la réduction de la dette 1.

## Contraintes de production
Budget limité association. Privilégier solutions gratuites. Respect
de l'accessibilité WCAG AA. Performance mobile prioritaire car une
partie du public accède depuis des connexions mobiles en Afrique.