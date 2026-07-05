-- Enrichissement du journal des emails (email_logs).
-- La table existe depuis 20260601_email_logs.sql (subject, recipient_count,
-- status, error_message, sent_by). On ajoute de quoi garder une vraie trace :
--   - source        : d'où vient l'envoi ('courrier', 'circulaire', 'vercel:reply'…)
--   - recipients/cc : les adresses réelles (text[])
--   - html_content  : le contenu complet archivé
--   - test_redirect : true si l'email a été redirigé par TEST_REDIRECT_EMAIL
-- Alimentée côté serveur uniquement (Edge Functions + api/send-email.js Vercel).
-- La RLS existante (email_logs_staff_all, is_staff()) reste inchangée.

alter table public.email_logs
  add column if not exists source        text,
  add column if not exists recipients    text[],
  add column if not exists cc            text[],
  add column if not exists html_content  text,
  add column if not exists test_redirect boolean not null default false;

create index if not exists email_logs_sent_at_idx on public.email_logs (sent_at desc);
create index if not exists email_logs_source_idx  on public.email_logs (source);
