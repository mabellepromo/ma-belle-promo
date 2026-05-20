-- Phase 2b — Bénévoles
-- Tables : benevoles, missions_benevoles, heures_benevoles
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

CREATE TABLE IF NOT EXISTS benevoles (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom             text        NOT NULL,
  email           text,
  telephone       text,
  competences     text,
  disponibilite   text,
  statut          text        DEFAULT 'actif',
  date_engagement date,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- statut ∈ { actif | inactif | ponctuel }

CREATE TABLE IF NOT EXISTS missions_benevoles (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  titre       text        NOT NULL,
  description text,
  date_debut  date,
  date_fin    date,
  responsable text,
  statut      text        DEFAULT 'planifiée',
  created_at  timestamptz DEFAULT now()
);

-- statut ∈ { planifiée | en_cours | terminée | annulée }

CREATE TABLE IF NOT EXISTS heures_benevoles (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  benevole_id uuid        NOT NULL REFERENCES benevoles(id) ON DELETE CASCADE,
  mission_id  uuid        REFERENCES missions_benevoles(id) ON DELETE SET NULL,
  date        date        NOT NULL DEFAULT CURRENT_DATE,
  heures      numeric     NOT NULL CHECK (heures > 0),
  activite    text,
  valide      boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE benevoles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions_benevoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE heures_benevoles   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON benevoles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access" ON missions_benevoles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access" ON heures_benevoles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
