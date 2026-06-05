-- Enrichissement du module Passation MBP
-- Créé le 2026-06-05
-- Objectif : passer la checklist de passation au niveau « passation de bureau complète ».
--   1. Colonnes bureau sortant/entrant, date de clôture et statut sur les instances.
--   2. Items désormais catégorisés et enrichis (responsable, date_fait, notes par item).
--      Le shape jsonb évolue — aucune donnée existante (0 ligne), migration sans risque :
--        passation_modeles.taches : [{ categorie, libelle }]
--        passations.taches        : [{ categorie, libelle, responsable, fait, date_fait, notes }]
--   3. Seed d'un modèle par défaut « Passation de bureau — modèle complet MBP ».
-- RLS : déjà migrée en is_staff() (cf. 20260604_security_step4_lot3_communication.sql),
--       les politiques sont au niveau table → les nouvelles colonnes sont couvertes.

-- ─── Nouvelles colonnes sur les instances de passation ───────────────────────
ALTER TABLE public.passations
  ADD COLUMN IF NOT EXISTS bureau_sortant text,
  ADD COLUMN IF NOT EXISTS bureau_entrant text,
  ADD COLUMN IF NOT EXISTS date_cloture   date,
  ADD COLUMN IF NOT EXISTS statut         text NOT NULL DEFAULT 'en_cours';

-- Garde-fou sur les valeurs de statut (en_cours / cloturee)
ALTER TABLE public.passations DROP CONSTRAINT IF EXISTS passations_statut_check;
ALTER TABLE public.passations
  ADD CONSTRAINT passations_statut_check CHECK (statut IN ('en_cours', 'cloturee'));

-- ─── Modèle par défaut catégorisé ────────────────────────────────────────────
-- Inséré une seule fois (idempotent par titre) : le bureau peut ensuite l'éditer.
INSERT INTO public.passation_modeles (titre, description, taches)
SELECT
  'Passation de bureau — modèle complet MBP',
  'Checklist exhaustive de transmission lors d''un changement de bureau, organisée par catégorie. À adapter à chaque mandat.',
  $json$[
    { "categorie": "Accès numériques & comptes", "libelle": "Identifiants du dashboard mabellepromo.org (rôles admin/bureau)" },
    { "categorie": "Accès numériques & comptes", "libelle": "Accès Supabase (projet, mot de passe, rôles)" },
    { "categorie": "Accès numériques & comptes", "libelle": "Accès Vercel (déploiement)" },
    { "categorie": "Accès numériques & comptes", "libelle": "Propriété et renouvellement du nom de domaine" },
    { "categorie": "Accès numériques & comptes", "libelle": "Compte email institutionnel (mabellepromo@gmail.com)" },
    { "categorie": "Accès numériques & comptes", "libelle": "Accès aux réseaux sociaux (Facebook, LinkedIn, etc.)" },
    { "categorie": "Accès numériques & comptes", "libelle": "WhatsApp Business MBP (SIM dédiée)" },
    { "categorie": "Accès numériques & comptes", "libelle": "Comptes des services tiers (Brevo, Zoom, Canva…)" },

    { "categorie": "Finances", "libelle": "Relevés et accès du/des compte(s) bancaire(s)" },
    { "categorie": "Finances", "libelle": "Mise à jour des signatures autorisées à la banque" },
    { "categorie": "Finances", "libelle": "État de la trésorerie (solde, recettes, dépenses en cours)" },
    { "categorie": "Finances", "libelle": "Factures émises/reçues non soldées" },
    { "categorie": "Finances", "libelle": "Cotisations en cours et impayés" },
    { "categorie": "Finances", "libelle": "Budget prévisionnel de l''exercice" },

    { "categorie": "Documents légaux & administratifs", "libelle": "Statuts et règlement intérieur" },
    { "categorie": "Documents légaux & administratifs", "libelle": "Récépissé de déclaration / enregistrement de l''association" },
    { "categorie": "Documents légaux & administratifs", "libelle": "Registre légal et registre RGPD (Article 30)" },
    { "categorie": "Documents légaux & administratifs", "libelle": "PV des dernières assemblées et élections" },
    { "categorie": "Documents légaux & administratifs", "libelle": "Déclarations administratives à jour" },
    { "categorie": "Documents légaux & administratifs", "libelle": "Mandats en cours et leurs échéances" },

    { "categorie": "Membres & relations", "libelle": "Base de membres à jour" },
    { "categorie": "Membres & relations", "libelle": "Contacts des partenaires et conventions (échéances de renouvellement)" },
    { "categorie": "Membres & relations", "libelle": "Contacts fournisseurs/prestataires" },

    { "categorie": "Activités & projets en cours", "libelle": "État du programme Passerelles (binômes mentor-mentoré)" },
    { "categorie": "Activités & projets en cours", "libelle": "Événements et webinaires planifiés" },
    { "categorie": "Activités & projets en cours", "libelle": "Projets en cours et engagements pris" },
    { "categorie": "Activités & projets en cours", "libelle": "Articles/publications en attente" },

    { "categorie": "Communication & médias", "libelle": "Accès aux supports de communication (Galeries, Médiathèque, Documents)" },
    { "categorie": "Communication & médias", "libelle": "Listes de diffusion / newsletter (Brevo)" },
    { "categorie": "Communication & médias", "libelle": "Chartes graphiques et logos" },

    { "categorie": "Biens & matériel", "libelle": "Inventaire du matériel physique" },
    { "categorie": "Biens & matériel", "libelle": "Biens et ressources de l''association" },

    { "categorie": "Obligations & échéances à venir", "libelle": "Renouvellements à venir (domaine, conventions, abonnements gratuits)" },
    { "categorie": "Obligations & échéances à venir", "libelle": "Échéances déclaratives" },
    { "categorie": "Obligations & échéances à venir", "libelle": "Prochaines assemblées prévues" }
  ]$json$::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.passation_modeles
  WHERE titre = 'Passation de bureau — modèle complet MBP'
);
