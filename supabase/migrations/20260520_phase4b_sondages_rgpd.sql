-- RGPD — contraintes sur les sondages
-- À exécuter dans le SQL Editor de Supabase (projet zbimhhgefmhliqiuwzvb)

ALTER TABLE sondages
  ADD COLUMN IF NOT EXISTS anonyme      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mention_rgpd text;

-- anonyme = true  → les noms/emails ne sont pas stockés dans sondage_soumissions
-- mention_rgpd    → texte RGPD affiché sur la page publique (null = mention standard MBP)
