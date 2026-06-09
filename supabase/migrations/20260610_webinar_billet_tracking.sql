-- Migration : suivi des envois de billets/liens pour les inscriptions webinaire
-- Date : 2026-06-10
--
-- Colonnes ajoutées à webinar_registrations pour tracer les envois faits via
-- l'Edge Function `webinaire-billet` (déclenchée depuis le dashboard) :
--   qr_generated : le QR (billet présentiel) a été généré
--   qr_sent      : le billet QR a été envoyé par email au participant présentiel
--   zoom_sent    : le lien de connexion a été envoyé au participant en ligne

ALTER TABLE webinar_registrations
  ADD COLUMN IF NOT EXISTS qr_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS qr_sent      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zoom_sent    boolean NOT NULL DEFAULT false;
