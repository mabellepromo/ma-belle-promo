-- Module Opportunités juridiques (job board alumni) MBP
-- Créé le 2026-06-04
-- Offres de stage/emploi/collaboration/mission postées par les membres,
-- modérées par le bureau avant publication.

-- ─── Table ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunites (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre            text        NOT NULL,
  type             text        NOT NULL DEFAULT 'emploi'
                               CHECK (type IN ('stage', 'emploi', 'collaboration', 'mission')),
  structure        text,
  ville            text,
  pays             text,
  specialite       text,
  description      text,
  date_limite      date,
  contact          text,
  poste_par        text,                 -- nom affiché du membre posteur
  poste_par_email  text        DEFAULT auth.email(),  -- = auth.email() pour la RLS « self »
  statut           text        NOT NULL DEFAULT 'en_attente'
                               CHECK (statut IN ('en_attente', 'publiee', 'expiree', 'refusee')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS opportunites_statut_idx     ON public.opportunites (statut);
CREATE INDEX IF NOT EXISTS opportunites_date_limite_idx ON public.opportunites (date_limite);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.opportunites_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS opportunites_updated_at ON public.opportunites;
CREATE TRIGGER opportunites_updated_at
  BEFORE UPDATE ON public.opportunites
  FOR EACH ROW EXECUTE FUNCTION public.opportunites_set_updated_at();

-- ─── RLS — modération côté serveur ───────────────────────────────────────────
-- Lecture : offres publiées pour tout membre connecté ; ses propres offres
-- (même en attente) ; tout pour l'admin.
-- Insertion : un membre ne peut créer QU'EN « en_attente » et à son propre nom.
-- Publication/refus/édition/suppression : admin uniquement.
ALTER TABLE public.opportunites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opp_select_published" ON public.opportunites;
DROP POLICY IF EXISTS "opp_select_self"      ON public.opportunites;
DROP POLICY IF EXISTS "opp_select_admin"     ON public.opportunites;
DROP POLICY IF EXISTS "opp_insert_member"    ON public.opportunites;
DROP POLICY IF EXISTS "opp_insert_admin"     ON public.opportunites;
DROP POLICY IF EXISTS "opp_update_admin"     ON public.opportunites;
DROP POLICY IF EXISTS "opp_delete_admin"     ON public.opportunites;

CREATE POLICY "opp_select_published" ON public.opportunites
  FOR SELECT USING (auth.role() = 'authenticated' AND statut = 'publiee');
CREATE POLICY "opp_select_self" ON public.opportunites
  FOR SELECT USING (auth.email() = poste_par_email);
CREATE POLICY "opp_select_admin" ON public.opportunites
  FOR SELECT USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

CREATE POLICY "opp_insert_member" ON public.opportunites
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND statut = 'en_attente'
    AND auth.email() = poste_par_email
  );
CREATE POLICY "opp_insert_admin" ON public.opportunites
  FOR INSERT WITH CHECK (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

CREATE POLICY "opp_update_admin" ON public.opportunites
  FOR UPDATE USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
  WITH CHECK (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');
CREATE POLICY "opp_delete_admin" ON public.opportunites
  FOR DELETE USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- ─── Automatisation de notification (désactivée par défaut) ──────────────────
INSERT INTO public.automations (id, name, description, config) VALUES
  (
    'opportunite_notification',
    'Notification nouvelle opportunité',
    'Email Brevo envoyé aux membres lorsqu''une nouvelle offre est publiée par le bureau. Déclenchement manuel à la validation.',
    '{"email_enabled": true, "cron": "trigger"}'
  )
ON CONFLICT (id) DO NOTHING;
