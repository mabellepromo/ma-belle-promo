-- Phase 2a — Registre légal
-- Tables : registre_documents_legaux, registre_conflits
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

CREATE TABLE IF NOT EXISTS registre_documents_legaux (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  categorie      text        NOT NULL DEFAULT 'autre',
  titre          text        NOT NULL,
  description    text,
  version        text,
  date_adoption  date,
  url_fichier    text,
  actif          boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

-- categorie ∈ { statuts | reglement_interieur | rgpd | charte | autre }

CREATE TABLE IF NOT EXISTS registre_conflits (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  declarant        text        NOT NULL,
  date_declaration date        NOT NULL DEFAULT CURRENT_DATE,
  objet            text        NOT NULL,
  mesures          text,
  statut           text        DEFAULT 'déclaré',
  date_resolution  date,
  created_at       timestamptz DEFAULT now()
);

-- statut ∈ { déclaré | résolu | archivé }
