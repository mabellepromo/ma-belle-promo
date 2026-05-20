-- Phase 3b — Subventions
-- Table : tresorerie_subventions
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

CREATE TABLE IF NOT EXISTS tresorerie_subventions (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  annee            int         NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  organisme        text        NOT NULL,
  objet            text        NOT NULL,
  montant_accorde  numeric     NOT NULL CHECK (montant_accorde > 0),
  montant_recu     numeric     NOT NULL DEFAULT 0 CHECK (montant_recu >= 0),
  date_accord      date,
  date_echeance    date,
  statut           text        DEFAULT 'en_attente',
  notes            text,
  created_at       timestamptz DEFAULT now()
);

-- statut ∈ { en_attente | partiellement_reçu | reçu | clôturé }

ALTER TABLE tresorerie_subventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON tresorerie_subventions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
