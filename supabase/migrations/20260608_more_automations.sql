-- Module Automatisations MBP — 9 automatisations supplémentaires
-- Créé le 2026-06-08
--
-- Toutes désactivées par défaut (enabled = false, valeur par défaut de la table).
-- Les Edge Functions correspondantes vérifient enabled=true AVANT d'agir :
-- planifier le cron sans activer le toggle dans le dashboard est sans effet.
--
-- Convention de nommage : id avec underscores, fonction = id avec tirets
--   (ex. webinaire_reminder -> fonction « webinaire-reminder »).

INSERT INTO public.automations (id, name, description, config) VALUES
  (
    'webinaire_reminder',
    'Rappel webinaire',
    'Email Brevo envoyé aux inscrits (statut « registered ») à J-7 puis J-1 avant chaque webinaire, avec le lien de connexion ou le lieu selon le mode de participation.',
    '{"days_before": [7, 1], "cron": "0 8 * * *"}'
  ),
  (
    'signature_reminder',
    'Relance signature en attente',
    'Relance par email les signataires d''un document au statut « envoye » resté non signé depuis plus de N jours. Une seule relance par signataire et par document.',
    '{"days_after": 5, "cron": "0 8 * * *"}'
  ),
  (
    'facture_reminder',
    'Relance facture impayée',
    'Relance par email le client d''une facture au statut « émise » dont l''échéance est dépassée. Une seule relance par facture.',
    '{"cron": "0 9 * * *"}'
  ),
  (
    'sondage_reminder',
    'Relance sondage avant clôture',
    'Pour chaque sondage actif dont la clôture approche (N jours), envoie un rappel aux membres validés. Une seule relance par sondage.',
    '{"days_before": 3, "cron": "0 8 * * *"}'
  ),
  (
    'newsletter_confirm_reminder',
    'Relance confirmation newsletter',
    'Relance les inscrits à la newsletter qui n''ont jamais confirmé leur inscription (double opt-in) après N heures. Une seule relance.',
    '{"confirm_after_hours": 48, "cron": "0 10 * * *"}'
  ),
  (
    'new_contact_alert',
    'Alerte nouveau message de contact',
    'Prévient le bureau pour chaque message de contact reçu et non encore signalé (scan horaire). Une seule alerte par message.',
    '{"alert_email": "contact@mabellepromo.org", "lookback_days": 3, "cron": "0 * * * *"}'
  ),
  (
    'new_adhesion_alert',
    'Alerte nouvelle adhésion',
    'Prévient le bureau pour chaque demande d''adhésion en attente récemment soumise (scan horaire). Une seule alerte par demande.',
    '{"alert_email": "contact@mabellepromo.org", "lookback_days": 14, "cron": "0 * * * *"}'
  ),
  (
    'weekly_digest',
    'Récapitulatif hebdomadaire',
    'Envoie au bureau chaque lundi une synthèse de la semaine : adhésions en attente, messages non lus, opportunités, inscrits newsletter, cotisations encaissées, webinaires et assemblées à venir.',
    '{"alert_email": "contact@mabellepromo.org", "cron": "0 7 * * 1"}'
  ),
  (
    'mandat_expiry_alert',
    'Alerte fin de mandat',
    'Prévient le bureau lorsqu''un mandat actif arrive à échéance dans moins de N jours. Une alerte par mandat.',
    '{"alert_email": "contact@mabellepromo.org", "days_before": 60, "cron": "0 8 1 * *"}'
  )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON JOBS — à activer manuellement, UNIQUEMENT après avoir activé le toggle
-- correspondant dans le dashboard. Prérequis :
--   1. Extensions pg_cron + pg_net activées (Dashboard > Database > Extensions)
--   2. Remplacer <PROJECT_REF> et <SERVICE_ROLE_KEY> par les vraies valeurs
--
-- Les Edge Functions vérifient enabled=true : un cron qui tourne alors que le
-- toggle est sur OFF se contente de marquer le statut « skipped » (aucun envoi).
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT cron.schedule('mbp-webinaire-reminder', '0 8 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/webinaire-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-signature-reminder', '0 8 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/signature-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-facture-reminder', '0 9 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/facture-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-sondage-reminder', '0 8 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sondage-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-newsletter-confirm-reminder', '0 10 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/newsletter-confirm-reminder',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-new-contact-alert', '0 * * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/new-contact-alert',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-new-adhesion-alert', '0 * * * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/new-adhesion-alert',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-weekly-digest', '0 7 * * 1',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/weekly-digest',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);

-- SELECT cron.schedule('mbp-mandat-expiry-alert', '0 8 1 * *',
--   $$SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/mandat-expiry-alert',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb)$$);
