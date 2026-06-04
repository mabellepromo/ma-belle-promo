-- Chantier sécurité RLS — Étape 5 : édition self du profil membre (champs sûrs)
-- Rouvre ce qu'on avait fermé à l'étape 2 (suppression de members_self_update), mais
-- SANS le trou « colonne » : la RPC n'expose QUE les 4 champs inoffensifs et ne touche
-- que la fiche du membre connecté (email = auth.email()). Impossible de modifier
-- statut, bureau, role, notes_internes : ils ne sont pas dans la signature.
--
-- SECURITY DEFINER : nécessaire pour écrire dans members (le membre n'a aucun UPDATE direct).
-- coalesce : un argument null laisse la valeur existante inchangée (pas d'effacement accidentel).

create or replace function public.update_my_profile(
  p_telephone  text default null,
  p_ville      text default null,
  p_pays       text default null,
  p_profession text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.members
     set telephone  = coalesce(p_telephone,  telephone),
         ville       = coalesce(p_ville,       ville),
         pays        = coalesce(p_pays,        pays),
         profession  = coalesce(p_profession,  profession),
         updated_at  = now()
   where email = auth.email();
end;
$$;

revoke all on function public.update_my_profile(text, text, text, text) from public, anon;
grant execute on function public.update_my_profile(text, text, text, text) to authenticated;

comment on function public.update_my_profile(text, text, text, text) is
  'Édition self du profil membre, champs sûrs uniquement (telephone/ville/pays/profession), sur sa propre fiche.';
