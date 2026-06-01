-- Table d'audit des campagnes email de masse envoyées depuis le dashboard

CREATE TABLE IF NOT EXISTS email_logs (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at         timestamptz DEFAULT now() NOT NULL,
  subject         text        NOT NULL,
  recipient_count integer     NOT NULL DEFAULT 0,
  status          text        NOT NULL DEFAULT 'success'
                              CHECK (status IN ('success', 'error')),
  error_message   text,
  sent_by         text
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Lecture réservée aux membres authentifiés (le dashboard est déjà protégé côté application)
CREATE POLICY "email_logs_read_authenticated"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

-- Les insertions se font uniquement via la Edge Function (service role), pas via le client
-- Pas de policy INSERT pour authenticated = la EF bypass RLS avec service_role_key
