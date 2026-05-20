-- Module Automatisations MBP
-- Créé le 2026-05-19

-- ─── Table principale ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automations (
  id          text        PRIMARY KEY,
  name        text        NOT NULL,
  description text,
  enabled     boolean     NOT NULL DEFAULT false,
  config      jsonb       NOT NULL DEFAULT '{}',
  last_run    timestamptz,
  next_run    timestamptz,
  last_status text        CHECK (last_status IN ('success', 'error', 'skipped')),
  last_error  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Table de logs pour éviter les doublons d'envoi ─────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id text        NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  target_id     text        NOT NULL,
  target_key    text        NOT NULL,
  channel       text        NOT NULL DEFAULT 'email',
  sent_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (automation_id, target_id, target_key, channel)
);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.automations_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS automations_updated_at ON public.automations;
CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.automations_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.automations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_automations" ON public.automations;
DROP POLICY IF EXISTS "auth_update_automations" ON public.automations;
DROP POLICY IF EXISTS "auth_select_logs"        ON public.automation_logs;
DROP POLICY IF EXISTS "all_insert_logs"         ON public.automation_logs;

CREATE POLICY "auth_select_automations" ON public.automations
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update_automations" ON public.automations
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_select_logs" ON public.automation_logs
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "all_insert_logs" ON public.automation_logs
  FOR INSERT WITH CHECK (true);

-- ─── Données par défaut (toutes désactivées) ─────────────────────────────────
INSERT INTO public.automations (id, name, description, config) VALUES
  (
    'birthday_reminder',
    'Anniversaires membres',
    'Email Brevo envoyé chaque matin pour les membres dont c''est l''anniversaire. WhatsApp optionnel (serveur dédié requis).',
    '{"email_enabled": true, "whatsapp_enabled": false, "cron": "0 8 * * *"}'
  ),
  (
    'cotisation_reminder',
    'Relance cotisation',
    'Email Brevo de relance à J+15, J+30 et J+60 après la fin de l''année de cotisation pour les membres n''ayant pas payé.',
    '{"delays_days": [15, 30, 60], "cron": "0 9 * * *"}'
  ),
  (
    'welcome_email',
    'Mail de bienvenue',
    'Email Brevo envoyé automatiquement dès qu''un nouveau membre est validé par un administrateur.',
    '{"cron": "trigger"}'
  ),
  (
    'event_reminder',
    'Rappel événement',
    'Email Brevo envoyé aux membres à J-7 puis J-1 avant la date de chaque événement publié.',
    '{"days_before": [7, 1], "cron": "0 8 * * *"}'
  ),
  (
    'ag_convocation',
    'Convocation AG',
    'Email Brevo de convocation à l''Assemblée Générale, envoyé X jours à l''avance (X configurable).',
    '{"days_before": 30, "cron": "0 8 * * *"}'
  ),
  (
    'payment_receipt',
    'Reçu de paiement cotisation',
    'Email Brevo de reçu envoyé automatiquement après l''enregistrement d''un paiement de cotisation.',
    '{"cron": "trigger"}'
  ),
  (
    'dormant_member_alert',
    'Alerte membre dormant',
    'Email au trésorier si un membre n''a pas payé sa cotisation depuis plus de N mois consécutifs.',
    '{"inactivity_months": 12, "alert_email": "contact@mabellepromo.org", "cron": "0 8 1 * *"}'
  )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOBS — à activer manuellement après avoir :
--   1. Activé l'extension pg_cron dans Dashboard Supabase > Database > Extensions
--   2. Remplacé <PROJECT_REF> par la référence réelle du projet Supabase
--   3. Configuré CRON_SECRET dans les secrets de l'edge function
--
-- Les edge functions vérifient enabled=true AVANT d'agir.
-- Activer le cron job sans activer l'automatisation est sans effet.
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT cron.schedule('mbp-birthday-reminder',
--   '0 8 * * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/birthday-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );

-- SELECT cron.schedule('mbp-cotisation-reminder',
--   '0 9 * * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/cotisation-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );

-- SELECT cron.schedule('mbp-event-reminder',
--   '0 8 * * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/event-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );

-- SELECT cron.schedule('mbp-ag-convocation',
--   '0 8 * * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/ag-convocation',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );

-- SELECT cron.schedule('mbp-dormant-member-alert',
--   '0 8 1 * *',
--   $$SELECT net.http_post(
--     url  := 'https://<PROJECT_REF>.supabase.co/functions/v1/dormant-member-alert',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );
