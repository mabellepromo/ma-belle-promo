-- Phase 1 — Signature PV et statut validation
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

ALTER TABLE assemblees
  ADD COLUMN IF NOT EXISTS pv_statut     text DEFAULT 'brouillon',
  ADD COLUMN IF NOT EXISTS pv_signataire text,
  ADD COLUMN IF NOT EXISTS pv_signe_le   timestamptz;

-- Commentaire : pv_statut ∈ { brouillon, valide, signe }
-- pv_publie reste la colonne de publication aux membres (inchangée)
