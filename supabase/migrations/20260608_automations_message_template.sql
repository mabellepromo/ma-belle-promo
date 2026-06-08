-- Messages d'automatisation éditables depuis le dashboard
-- Créé le 2026-06-08
--
-- Ajoute une colonne message_template (jsonb : { subject, body }) sur automations.
-- Tant qu'elle vaut NULL, l'Edge Function utilise son modèle codé en dur (repli).
-- Le corps est du texte simple avec des variables {{cle}} ; le design (en-tête/pied
-- MBP) reste géré par le code via wrapHtml().

ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS message_template jsonb;

-- Pilote : pré-remplit le modèle Anniversaire avec le texte actuel, pour que
-- l'éditeur ne soit pas vide et que le rendu reste identique tant qu'on n'y touche pas.
UPDATE public.automations
SET message_template = jsonb_build_object(
  'subject', '🎂 Joyeux anniversaire, {{prenom}} ! — Ma Belle Promo',
  'body',
  'Joyeux anniversaire, {{prenom}} !' || E'\n\n' ||
  'Toute l''association Ma Belle Promo se joint à cette occasion pour vous souhaiter un excellent anniversaire et une belle année {{annee}} !' || E'\n\n' ||
  'Avec toute notre amitié et notre fraternité de promotionnaires.' || E'\n' ||
  'Le Bureau Exécutif — Ma Belle Promo'
)
WHERE id = 'birthday_reminder' AND message_template IS NULL;
