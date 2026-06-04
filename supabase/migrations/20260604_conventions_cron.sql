-- Planification du cron de relance des conventions (appliqué le 2026-06-04)
-- Active pg_net puis planifie la vérification quotidienne à 8h UTC.
--
-- Choix : clé anon (publique, suffit à passer verify_jwt ; la fonction agit en
-- service_role EN INTERNE) plutôt que la service_role en clair dans cron.job.
--
-- L'automatisation convention_reminder reste sur enabled=false : le cron tourne
-- À VIDE (la fonction répond « skipped ») tant qu'elle n'est pas activée dans
-- l'onglet Automatisations du dashboard. Voir [[project_conventions_cron]].

create extension if not exists pg_net;

select cron.schedule(
  'mbp-convention-reminder',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://zbimhhgefmhliqiuwzvb.supabase.co/functions/v1/convention-reminder',
    headers := '{"Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaW1oaGdlZm1obGlxaXV3enZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTQyODIsImV4cCI6MjA5MTY5MDI4Mn0.KYoT8yhJk0baVKjVVRwtN6mu1oOtPkkBk_EIl8V9wWk","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Pour supprimer ce cron si besoin :
--   select cron.unschedule('mbp-convention-reminder');
