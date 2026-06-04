-- Module Mémoire institutionnelle / Passation MBP
-- Créé le 2026-06-04
-- Base de procédures (savoir-faire interne) + checklists de passation de bureau.
-- Distinct de « ressources » (documents téléchargeables) : ici, contenu rédigé,
-- versionné, lié aux décisions d'AG.

-- ─── Procédures (fiches de savoir-faire) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.procedures (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre        text        NOT NULL,
  categorie    text,
  tags         text[]      DEFAULT '{}',
  contenu      text,                       -- HTML (RichEditor)
  auteur       text,                       -- dernier éditeur
  assemblee_id uuid        REFERENCES public.assemblees(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── Historique des versions (versionnement simple) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.procedure_versions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id uuid        NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  contenu      text,
  auteur       text,
  modifie_le   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS procedure_versions_proc_idx ON public.procedure_versions (procedure_id, modifie_le DESC);

-- Archive l'ANCIEN contenu dans procedure_versions à chaque modification
CREATE OR REPLACE FUNCTION public.procedures_archive_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  -- On archive uniquement si le contenu a réellement changé
  IF OLD.contenu IS DISTINCT FROM NEW.contenu THEN
    INSERT INTO public.procedure_versions (procedure_id, contenu, auteur, modifie_le)
    VALUES (OLD.id, OLD.contenu, OLD.auteur, OLD.updated_at);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS procedures_versioning ON public.procedures;
CREATE TRIGGER procedures_versioning
  BEFORE UPDATE ON public.procedures
  FOR EACH ROW EXECUTE FUNCTION public.procedures_archive_version();

-- ─── Modèles de passation réutilisables ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.passation_modeles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       text        NOT NULL,
  description text,
  taches      jsonb       NOT NULL DEFAULT '[]',   -- ["Remettre les accès", "Transmettre les statuts", …]
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Passations (instances lors d'un changement de bureau) ───────────────────
CREATE TABLE IF NOT EXISTS public.passations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre          text        NOT NULL,
  date_passation date        DEFAULT CURRENT_DATE,
  modele_id      uuid        REFERENCES public.passation_modeles(id) ON DELETE SET NULL,
  -- [{ libelle, assignee_member_id, assignee_nom, fait (bool), fait_le }]
  taches         jsonb       NOT NULL DEFAULT '[]',
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── Trigger updated_at générique pour modeles + passations ──────────────────
CREATE OR REPLACE FUNCTION public.memoire_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS passation_modeles_updated_at ON public.passation_modeles;
CREATE TRIGGER passation_modeles_updated_at
  BEFORE UPDATE ON public.passation_modeles
  FOR EACH ROW EXECUTE FUNCTION public.memoire_set_updated_at();

DROP TRIGGER IF EXISTS passations_updated_at ON public.passations;
CREATE TRIGGER passations_updated_at
  BEFORE UPDATE ON public.passations
  FOR EACH ROW EXECUTE FUNCTION public.memoire_set_updated_at();

-- ─── RLS — module réservé au bureau/admin ────────────────────────────────────
-- Tout est réservé au rôle admin (le dashboard est lui-même admin-only).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['procedures','procedure_versions','passation_modeles','passations']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON public.%I;', t, t);
    EXECUTE format($f$CREATE POLICY "%s_admin_all" ON public.%I
      FOR ALL
      USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
      WITH CHECK (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');$f$, t, t);
  END LOOP;
END $$;
