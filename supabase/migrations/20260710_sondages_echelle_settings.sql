-- Sondages v3 — appliquée le 10/07/2026 via MCP
-- 1. Nouveau type de question « echelle » (échelle 1–10, stockée dans valeur_note)
-- 2. Colonne settings (jsonb) sur sondages :
--    max_soumissions : quota de réponses (clôture automatique)
--    thanks_message  : message de remerciement personnalisé après vote
--    show_results    : montrer les résultats aux répondants après vote (défaut true)

ALTER TABLE public.sondage_questions
  DROP CONSTRAINT IF EXISTS sondage_questions_type_check;
ALTER TABLE public.sondage_questions
  ADD CONSTRAINT sondage_questions_type_check
  CHECK (type = ANY (ARRAY['ouinon','single','multiple','texte','note','dropdown','date','echelle']));

ALTER TABLE public.sondages
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;
