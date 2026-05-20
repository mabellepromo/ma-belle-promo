-- Phase 3c — Colonne source_ref dans tresorerie_transactions
-- Permet de marquer les transactions créées automatiquement (remboursements, subventions)
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

ALTER TABLE tresorerie_transactions
  ADD COLUMN IF NOT EXISTS source_ref text;

-- source_ref examples:
--   'subvention:{uuid}'   → versement de subvention
--   'remboursement:{uuid}'→ remboursement de frais (rétrocompatible)
--   'cotisation:{membre}' → cotisation synchronisée (usage futur)
