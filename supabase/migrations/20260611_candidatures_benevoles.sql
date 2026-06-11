-- Module : Candidatures bénévoles (formulaire public unifié) MBP
-- Date : 2026-06-11
--
-- Table DISTINCTE de `benevoles` (gestion interne du bureau) : on stocke ici les
-- CANDIDATURES soumises publiquement (diaspora + Togo), avant revue du bureau.
-- Cycle de vie : nouvelle → en_revue → acceptee (→ converti en `benevoles`) | refusee | archivee.
--
-- Sécurité (RLS) :
--   - INSERT : public (anon + authenticated), UNIQUEMENT en statut 'nouvelle'
--     (le candidat ne peut pas s'auto-accepter).
--   - SELECT / UPDATE / DELETE : staff uniquement via public.is_staff()
--     (rôle admin|bureau lu dans app_metadata — non falsifiable).
--   - Aucune lecture publique : les données personnelles ne fuient pas.

-- ─── Table ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidatures_benevoles (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section 1 : profil (pilote les champs conditionnels)
  profile_type             text        NOT NULL
                             CHECK (profile_type IN ('student', 'professional', 'tech', 'other')),

  -- Section 2 : identification
  full_name                text        NOT NULL,
  email                    text        NOT NULL,
  phone                    text        NOT NULL,
  country_code             text        NOT NULL,           -- ISO alpha-3 (ou 'OTHER')
  professional_link        text,                            -- URL https (LinkedIn / CV)
  current_title            text,                            -- conditionnel (non-étudiant)
  university               text,                            -- conditionnel (étudiant)
  study_year               text,                            -- conditionnel (étudiant) : l3|m1|m2
  study_field              text,

  -- Section 3 : profil professionnel
  expertise_domains        text[]      NOT NULL DEFAULT '{}',
  skills_description        text        NOT NULL,
  years_experience         integer     NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  employment_sector        text,
  languages                text[]      NOT NULL DEFAULT '{}',

  -- Section 4 : mission & projet
  project_interest         text        NOT NULL,            -- passerelles|event|social|...
  mission_types            text[]      NOT NULL DEFAULT '{}',

  -- Section 5 : disponibilité & engagement
  engagement_level         text        NOT NULL,
  start_date               date        NOT NULL,
  engagement_duration      text,
  preferred_schedule       text,
  modality                 text        NOT NULL
                             CHECK (modality IN ('remote', 'onsite', 'hybrid')),
  timezone                 text,                            -- conditionnel (distant/hybride)
  available_for_events     boolean     NOT NULL DEFAULT false,

  -- Section 6 : origine
  referral_source          text        NOT NULL,
  referred_by              text,

  -- Section 7 : motivation
  motivation               text,

  -- Section 9 : photo
  avatar_url               text,

  -- Section 8 : consentements ATOMISÉS (chacun tracé séparément)
  consent_contact          boolean     NOT NULL DEFAULT false,
  consent_charter          boolean     NOT NULL DEFAULT false,
  consent_data             boolean     NOT NULL DEFAULT false,
  consent_data_at          timestamptz,                     -- horodatage RGPD (preuve)
  consent_visibility       boolean     NOT NULL DEFAULT false,
  consent_newsletter       boolean     NOT NULL DEFAULT false,
  newsletter_frequency     text,                            -- conditionnel (newsletter)
  consent_photo            boolean     NOT NULL DEFAULT false,
  consent_background_check boolean     NOT NULL DEFAULT false,

  -- Métadonnées / suivi bureau
  statut                   text        NOT NULL DEFAULT 'nouvelle'
                             CHECK (statut IN ('nouvelle', 'en_revue', 'acceptee', 'refusee', 'archivee')),
  notes_internes           text,                            -- visible bureau uniquement
  benevole_id              uuid        REFERENCES public.benevoles(id) ON DELETE SET NULL,
                                                            -- lien si converti en bénévole actif
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ─── Index (recherche & segmentation CRM) ────────────────────────────────────
CREATE INDEX IF NOT EXISTS cand_ben_email_idx          ON public.candidatures_benevoles (email);
CREATE INDEX IF NOT EXISTS cand_ben_country_idx        ON public.candidatures_benevoles (country_code);
CREATE INDEX IF NOT EXISTS cand_ben_profile_idx        ON public.candidatures_benevoles (profile_type);
CREATE INDEX IF NOT EXISTS cand_ben_project_idx        ON public.candidatures_benevoles (project_interest);
CREATE INDEX IF NOT EXISTS cand_ben_statut_idx         ON public.candidatures_benevoles (statut);
CREATE INDEX IF NOT EXISTS cand_ben_created_idx        ON public.candidatures_benevoles (created_at DESC);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.candidatures_benevoles_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS candidatures_benevoles_updated_at ON public.candidatures_benevoles;
CREATE TRIGGER candidatures_benevoles_updated_at
  BEFORE UPDATE ON public.candidatures_benevoles
  FOR EACH ROW EXECUTE FUNCTION public.candidatures_benevoles_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.candidatures_benevoles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cand_ben_insert_public" ON public.candidatures_benevoles;
DROP POLICY IF EXISTS "cand_ben_select_staff"  ON public.candidatures_benevoles;
DROP POLICY IF EXISTS "cand_ben_update_staff"  ON public.candidatures_benevoles;
DROP POLICY IF EXISTS "cand_ben_delete_staff"  ON public.candidatures_benevoles;

-- Soumission publique : seulement en 'nouvelle' (pas d'auto-validation possible).
CREATE POLICY "cand_ben_insert_public" ON public.candidatures_benevoles
  FOR INSERT TO anon, authenticated
  WITH CHECK (statut = 'nouvelle');

-- Lecture / modération / suppression : staff uniquement.
CREATE POLICY "cand_ben_select_staff" ON public.candidatures_benevoles
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "cand_ben_update_staff" ON public.candidatures_benevoles
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "cand_ben_delete_staff" ON public.candidatures_benevoles
  FOR DELETE TO authenticated USING (public.is_staff());

-- ─── Upload photo par un visiteur anonyme ────────────────────────────────────
-- L'upload de la photo (facultative) est géré dans une migration dédiée et scopée :
--   20260611_candidatures_avatar_storage.sql
-- (INSERT anonyme autorisé UNIQUEMENT sous le préfixe `candidatures/` du bucket).

-- ─── (OPTIONNEL) Automatisation de notification ──────────────────────────────
-- Si la table `automations` existe, on enregistre un déclencheur (désactivé tant
-- que le bureau ne l'active pas) pour notifier d'une nouvelle candidature.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'automations') THEN
    INSERT INTO public.automations (id, name, description, config) VALUES
      (
        'candidature_benevole_notification',
        'Notification nouvelle candidature bénévole',
        'Email envoyé au bureau lorsqu''un visiteur soumet le formulaire de bénévolat.',
        '{"email_enabled": true, "cron": "trigger"}'
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
