-- Chantier sécurité RLS — Étape 1
-- Fonction « juge » unique : détermine si l'appelant fait partie du staff
-- (bureau ou admin) en lisant le rôle depuis app_metadata du jeton JWT.
--
-- POINTS CLÉS DE SÉCURITÉ :
--  - On lit app_metadata (posé côté serveur, NON falsifiable), jamais user_metadata.
--  - search_path figé à '' + schémas qualifiés (auth.jwt) : empêche le détournement
--    de la fonction via un objet malveillant placé dans un schéma prioritaire.
--  - SECURITY INVOKER (défaut) : la fonction ne lit que le jeton, aucun privilège
--    élevé nécessaire — on n'en accorde donc pas.

create or replace function public.is_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'bureau'),
    false
  );
$$;

comment on function public.is_staff() is
  'Vrai si le rôle (app_metadata.role) de l''appelant est admin ou bureau. Base des politiques RLS.';
