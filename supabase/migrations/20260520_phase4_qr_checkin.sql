-- Phase 4 — QR Code Check-in événements
-- Table : evenement_presences
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

CREATE TABLE IF NOT EXISTS evenement_presences (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  evenement_id   text        NOT NULL REFERENCES evenements(id) ON DELETE CASCADE,
  nom            text        NOT NULL,
  email          text,
  membre_id      text        REFERENCES members(id) ON DELETE SET NULL,
  checked_in_at  timestamptz DEFAULT now(),
  methode        text        DEFAULT 'qr',
  notes          text,
  created_at     timestamptz DEFAULT now()
);

-- methode ∈ { qr | manuel }

ALTER TABLE evenement_presences ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut s'inscrire en présence (scan QR sans compte)
CREATE POLICY "public_insert" ON evenement_presences
  FOR INSERT WITH CHECK (true);

-- Seuls les admins connectés peuvent lire et supprimer
CREATE POLICY "admin_select" ON evenement_presences
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_delete" ON evenement_presences
  FOR DELETE TO authenticated USING (true);
