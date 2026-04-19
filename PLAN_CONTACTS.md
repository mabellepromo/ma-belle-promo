# Plan — Refonte page Contacts

## État actuel

- Hero `PageHero` standard (déjà mis à jour en vert foncé ✓)
- Colonne gauche : coordonnées + encart vert "Faculté de Droit"
- Colonne droite : formulaire de contact
- **Problème majeur** : le formulaire sauvegarde les messages en `localStorage` uniquement — ils n'arrivent jamais par email ni dans Supabase. L'admin ne les reçoit pas vraiment.

---

## Points à discuter / décider

### 1. Formulaire de contact — que se passe-t-il après l'envoi ?
Options :
- **A) EmailJS** (déjà installé dans le projet) → envoie un vrai email à mabellepromo@gmail.com à chaque soumission. Gratuit jusqu'à 200 emails/mois.
- **B) Supabase** → stocke les messages en base, visibles dans le Dashboard. Déjà utilisé pour les messages du Dashboard.
- **C) Les deux** → stocke dans Supabase ET envoie un email de notification.

### 2. Contenu et design
- Ajouter une **carte Google Maps** (ou carte statique) pour localiser Baguida ?
- Ajouter les **réseaux sociaux** (Facebook, WhatsApp, LinkedIn) si l'association en a ?
- Reformuler / enrichir le texte de présentation dans l'encart vert ?
- Changer la mise en page ? (ex : hero avec photo de fond, sections plus aérées)

### 3. Informations de contact à vérifier
- Adresse : `12 BP 335 Baguida, Togo` — est-ce le bon format / la bonne adresse ?
- Téléphones TMoney / Flooz — toujours valides ?
- Disponibilité `Lun – Ven : 8h – 18h` — à conserver ?

---

## Proposition de plan d'action

1. **Brancher EmailJS** sur le formulaire (rapide, déjà installé)
2. **Sauvegarder aussi dans Supabase** (table `contact_messages`)
3. **Redesign** : mise en page plus impactante avec les éléments validés ci-dessus
4. **Déployer**

---

## Questions pour Eric

- Option A, B ou C pour l'envoi des messages ?
- Tu as des réseaux sociaux à afficher ?
- Tu veux une carte de localisation ?
- L'adresse et les numéros sont-ils toujours valides ?
