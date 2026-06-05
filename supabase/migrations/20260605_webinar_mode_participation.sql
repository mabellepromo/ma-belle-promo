-- Migration : mode de participation pour les inscriptions aux webinaires
-- Date : 2026-06-05
--
-- Pour les événements hybrides (présentiel + diffusion en ligne), on demande
-- à l'inscrit s'il vient sur place ou s'il suit la diffusion. L'info sert à la
-- logistique du bureau (places en salle vs participants à distance).
-- Pour les événements mono-format, la valeur est déduite automatiquement.

ALTER TABLE webinar_registrations
  ADD COLUMN IF NOT EXISTS mode_participation text
    CHECK (mode_participation IN ('presentiel', 'en_ligne'));
