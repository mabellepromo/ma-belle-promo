-- Phase 3 — Remboursements de frais
-- Table : tresorerie_remboursements
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

CREATE TABLE IF NOT EXISTS tresorerie_remboursements (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  annee           int         NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  demandeur       text        NOT NULL,
  motif           text        NOT NULL,
  montant         numeric     NOT NULL CHECK (montant > 0),
  date_demande    date        NOT NULL DEFAULT CURRENT_DATE,
  statut          text        DEFAULT 'en_attente',
  date_traitement date,
  notes           text,
  transaction_id  uuid        REFERENCES tresorerie_transactions(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

-- statut ∈ { en_attente | approuvé | remboursé | rejeté }

ALTER TABLE tresorerie_remboursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON tresorerie_remboursements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
