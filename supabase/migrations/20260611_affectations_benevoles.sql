-- Module : Affectations bénévoles ↔ missions
-- Date : 2026-06-11
--
-- Lie une candidature (candidatures_benevoles) OU une fiche (benevoles) à une
-- mission (missions_benevoles), avec rôle, statut d'affectation, dates et notes.
--
-- Convention projet : statuts en text + CHECK (pas de CREATE TYPE enum), comme
-- partout ailleurs (missions_benevoles.statut, opportunites.type, etc.).
--
-- Sécurité : table 100 % staff (is_staff()). Le formulaire PUBLIC n'écrit PAS ici
-- (RLS anon impossible + id de candidature non relisible) : les missions qui
-- intéressent un candidat sont stockées dans candidatures_benevoles.mission_interets,
-- puis matérialisées en affectations par le bureau lors de la revue.

-- ─── Intérêts de mission capturés à la candidature (écrits par l'anonyme) ─────
ALTER TABLE public.candidatures_benevoles
  ADD COLUMN IF NOT EXISTS mission_interets uuid[] NOT NULL DEFAULT '{}';

-- ─── Table de liaison ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affectations_benevoles (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id         uuid        NOT NULL REFERENCES public.missions_benevoles(id) ON DELETE CASCADE,
  volunteer_source   text        NOT NULL CHECK (volunteer_source IN ('CANDIDATE', 'SHEET')),
  candidature_id     uuid        REFERENCES public.candidatures_benevoles(id) ON DELETE CASCADE,
  benevole_id        uuid        REFERENCES public.benevoles(id) ON DELETE CASCADE,
  assigned_role      text        NOT NULL,
  assignment_status  text        NOT NULL DEFAULT 'CANDIDATE'
                       CHECK (assignment_status IN ('CANDIDATE', 'ASSIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  assigned_date      date        DEFAULT CURRENT_DATE,
  start_date         date,
  end_date           date,
  admin_notes        text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Au moins un bénévole renseigné
  CONSTRAINT at_least_one_volunteer CHECK (
    (candidature_id IS NOT NULL) OR (benevole_id IS NOT NULL)
  ),
  -- La source doit correspondre à la colonne renseignée
  CONSTRAINT source_matches_volunteer CHECK (
    (volunteer_source = 'CANDIDATE' AND candidature_id IS NOT NULL) OR
    (volunteer_source = 'SHEET'     AND benevole_id    IS NOT NULL)
  ),
  -- Une candidature / une fiche ne peut être affectée qu'une fois par mission
  CONSTRAINT uniq_candidature_mission UNIQUE (mission_id, candidature_id),
  CONSTRAINT uniq_benevole_mission    UNIQUE (mission_id, benevole_id)
);

CREATE INDEX IF NOT EXISTS aff_ben_mission_idx     ON public.affectations_benevoles(mission_id);
CREATE INDEX IF NOT EXISTS aff_ben_candidature_idx ON public.affectations_benevoles(candidature_id);
CREATE INDEX IF NOT EXISTS aff_ben_benevole_idx    ON public.affectations_benevoles(benevole_id);
CREATE INDEX IF NOT EXISTS aff_ben_status_idx      ON public.affectations_benevoles(assignment_status);
CREATE INDEX IF NOT EXISTS aff_ben_source_idx      ON public.affectations_benevoles(volunteer_source);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.affectations_benevoles_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS affectations_benevoles_updated_at ON public.affectations_benevoles;
CREATE TRIGGER affectations_benevoles_updated_at
  BEFORE UPDATE ON public.affectations_benevoles
  FOR EACH ROW EXECUTE FUNCTION public.affectations_benevoles_set_updated_at();

-- ─── RLS : staff uniquement ──────────────────────────────────────────────────
ALTER TABLE public.affectations_benevoles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aff_ben_all_staff" ON public.affectations_benevoles;
CREATE POLICY "aff_ben_all_staff" ON public.affectations_benevoles
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ─── Lecture publique des missions ACTIVES (pour le formulaire de candidature) ─
-- Le formulaire public propose au candidat les missions en cours / planifiées.
-- On n'expose QUE le titre via ces statuts ; les missions terminées/annulées
-- restent invisibles au public.
DROP POLICY IF EXISTS "missions_ben_select_public_active" ON public.missions_benevoles;
CREATE POLICY "missions_ben_select_public_active" ON public.missions_benevoles
  FOR SELECT TO anon, authenticated
  USING (statut IN ('planifiée', 'en_cours'));
