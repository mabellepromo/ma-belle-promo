-- Table de gestion des brouillons d'emails de masse
-- Permet de créer, modifier et supprimer des brouillons avant envoi

CREATE TABLE IF NOT EXISTS bulk_emails (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  subject             text        NOT NULL DEFAULT '',
  body                text        NOT NULL DEFAULT '',
  sent_by             uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  bureau_member_name  text,
  status              text        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft', 'sent')),
  attachments         jsonb       NOT NULL DEFAULT '[]',
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bulk_emails ENABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION bulk_emails_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bulk_emails_updated_at
  BEFORE UPDATE ON bulk_emails
  FOR EACH ROW EXECUTE FUNCTION bulk_emails_set_updated_at();

-- Politique permissive : tout membre authentifié du dashboard peut accéder aux brouillons
-- (le dashboard lui-même est déjà protégé par Supabase Auth)
CREATE POLICY "bulk_emails_authenticated"
  ON bulk_emails FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
