-- Traçabilité de l'acceptation de la charte de bénévolat (approche légère)
-- Date : 2026-06-11
--
-- On ne crée pas de table d'audit séparée : l'acceptation est tracée directement
-- sur la candidature (formulaire public) et sur la fiche bénévole. Le consentement
-- métier reste consent_charter (booléen obligatoire). Ici on ajoute la VERSION
-- acceptée + l'horodatage (+ user agent côté candidature, à titre de preuve).
-- Pas d'adresse IP : le formulaire public est anonyme et l'IP n'est pas fiable
-- côté navigateur (la capter exigerait une route serveur — écarté volontairement).

ALTER TABLE public.candidatures_benevoles
  ADD COLUMN IF NOT EXISTS charter_version     text,
  ADD COLUMN IF NOT EXISTS charter_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS charter_user_agent  text;

ALTER TABLE public.benevoles
  ADD COLUMN IF NOT EXISTS charter_version     text,
  ADD COLUMN IF NOT EXISTS charter_accepted_at timestamptz;
