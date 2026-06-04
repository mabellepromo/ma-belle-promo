-- Module Conventions / Partenariats MBP
-- Créé le 2026-06-04
-- Suivi des échéances de renouvellement + relances automatiques (Brevo)

-- ─── Table principale ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conventions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partenaire_nom  text        NOT NULL,
  objet           text,
  date_debut      date,
  date_echeance   date,
  -- statut calculé/ajusté à la main : active / a_renouveler / expiree
  statut          text        NOT NULL DEFAULT 'active'
                              CHECK (statut IN ('active', 'a_renouveler', 'expiree')),
  contact_email   text,
  contact_whatsapp text,
  montant         numeric,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conventions_echeance_idx ON public.conventions (date_echeance);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.conventions_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS conventions_updated_at ON public.conventions;
CREATE TRIGGER conventions_updated_at
  BEFORE UPDATE ON public.conventions
  FOR EACH ROW EXECUTE FUNCTION public.conventions_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Lecture/écriture réservées aux utilisateurs authentifiés (dashboard bureau).
-- L'edge function de relance utilise la service_role qui contourne la RLS.
ALTER TABLE public.conventions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_conventions" ON public.conventions;
DROP POLICY IF EXISTS "auth_insert_conventions" ON public.conventions;
DROP POLICY IF EXISTS "auth_update_conventions" ON public.conventions;
DROP POLICY IF EXISTS "auth_delete_conventions" ON public.conventions;

CREATE POLICY "auth_select_conventions" ON public.conventions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert_conventions" ON public.conventions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_conventions" ON public.conventions
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_conventions" ON public.conventions
  FOR DELETE USING (auth.role() = 'authenticated');

-- ─── Automatisation associée (désactivée par défaut) ─────────────────────────
INSERT INTO public.automations (id, name, description, config) VALUES
  (
    'convention_reminder',
    'Relance conventions partenaires',
    'Email Brevo de relance au contact du partenaire avant l''échéance de la convention (J-30, J-15, J-7). Vérification quotidienne, une seule relance par palier.',
    '{"days_before": [30, 15, 7], "email_enabled": true, "whatsapp_enabled": false, "cron": "0 8 * * *"}'
  )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOB — à activer manuellement après avoir :
--   1. Activé l'extension pg_cron (Dashboard Supabase > Database > Extensions)
--   2. Remplacé <PROJECT_REF> et <SERVICE_ROLE_KEY>
--   3. Déployé la fonction : supabase functions deploy convention-reminder
--
-- L'edge function vérifie enabled=true AVANT d'agir.
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT cron.schedule('mbp-convention-reminder',
--   '0 8 * * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/convention-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );
