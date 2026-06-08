-- Programmation des cron jobs des automatisations MBP
-- Créé le 2026-06-08
--
-- Prérequis (déjà en place sur le projet) :
--   - Extensions pg_cron et pg_net activées (Database > Extensions).
--   - Un secret Vault nommé 'cron_anon_key' contenant la clé ANON (JWT) du projet.
--     La clé anon est publique (présente dans le bundle frontend) ; on la stocke
--     dans Vault uniquement pour qu'elle n'apparaisse pas en clair dans cron.job.
--     Création (à faire une fois, avec la vraie clé) :
--       SELECT vault.create_secret('<ANON_KEY>', 'cron_anon_key',
--         'Cle anon (JWT) pour appeler les Edge Functions depuis pg_cron');
--
-- Pourquoi la clé anon et non la service_role : l'en-tête Authorization sert
-- seulement à passer la vérification JWT du gateway. Chaque Edge Function utilise
-- ENSUITE sa propre SUPABASE_SERVICE_ROLE_KEY (injectée) pour accéder aux données.
--
-- Sécurité d'usage : chaque fonction vérifie automations.enabled AVANT d'agir.
-- Programmer un cron sans activer le toggle correspondant n'envoie donc rien.
-- Les 3 automatisations de type « trigger » (welcome_email, payment_receipt,
-- opportunite_notification) ne sont pas planifiées : elles se déclenchent à la demande.

DO $$
DECLARE
  base text := 'https://zbimhhgefmhliqiuwzvb.supabase.co/functions/v1/';
  job  record;
  cmd  text;
BEGIN
  FOR job IN
    SELECT * FROM (VALUES
      ('mbp-birthday-reminder',            '0 8 * * *', 'birthday-reminder'),
      ('mbp-cotisation-reminder',          '0 9 * * *', 'cotisation-reminder'),
      ('mbp-event-reminder',               '0 8 * * *', 'event-reminder'),
      ('mbp-ag-convocation',               '0 8 * * *', 'ag-convocation'),
      ('mbp-dormant-member-alert',         '0 8 1 * *', 'dormant-member-alert'),
      ('mbp-convention-reminder',          '0 8 * * *', 'convention-reminder'),
      ('mbp-facture-reminder',             '0 9 * * *', 'facture-reminder'),
      ('mbp-mandat-expiry-alert',          '0 8 1 * *', 'mandat-expiry-alert'),
      ('mbp-new-adhesion-alert',           '0 * * * *', 'new-adhesion-alert'),
      ('mbp-new-contact-alert',            '0 * * * *', 'new-contact-alert'),
      ('mbp-newsletter-confirm-reminder',  '0 10 * * *','newsletter-confirm-reminder'),
      ('mbp-signature-reminder',           '0 8 * * *', 'signature-reminder'),
      ('mbp-sondage-reminder',             '0 8 * * *', 'sondage-reminder'),
      ('mbp-webinaire-reminder',           '0 8 * * *', 'webinaire-reminder'),
      ('mbp-weekly-digest',                '0 7 * * 1', 'weekly-digest')
    ) AS t(jobname, sched, fn)
  LOOP
    -- La commande référence le Vault à l'exécution : la clé n'est pas écrite
    -- en clair dans cron.job.command.
    cmd := format(
      $f$SELECT net.http_post(url := %L, headers := jsonb_build_object('Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_anon_key'), 'Content-Type', 'application/json'), body := '{}'::jsonb)$f$,
      base || job.fn
    );
    -- cron.schedule(jobname, ...) crée ou remplace le job portant ce nom (idempotent).
    PERFORM cron.schedule(job.jobname, job.sched, cmd);
  END LOOP;
END $$;

-- Pour désactiver un cron sans le supprimer :
--   UPDATE cron.job SET active = false WHERE jobname = 'mbp-...';
-- Pour le supprimer définitivement :
--   SELECT cron.unschedule('mbp-...');
