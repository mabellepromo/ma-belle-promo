-- Chantier sécurité RLS — Étape 2 (table pilote : members)
-- Remplace les politiques qui lisaient user_metadata (falsifiable) par is_staff().
-- Supprime aussi members_self_update : un membre pouvait modifier TOUTES les
-- colonnes de sa fiche (dont bureau/role/status). L'édition self sûre revient
-- à l'étape 3 via la RPC update_my_profile().
--
-- Politiques CONSERVÉES (volontairement) :
--   members_self_select     -> un membre lit sa propre fiche (auth.email() = email)
--   members_select_validated-> annuaire public (status = 'validated')
--   members_insert_anon     -> formulaire d'adhésion (status = 'pending')

-- 1. Retrait des politiques admin vulnérables (user_metadata)
drop policy if exists members_admin_select on public.members;
drop policy if exists members_admin_insert on public.members;
drop policy if exists members_admin_update on public.members;
drop policy if exists members_admin_delete on public.members;

-- 2. Retrait du trou « colonne » (édition self non restreinte)
drop policy if exists members_self_update on public.members;

-- 3. Politique staff unique : admin/bureau peuvent tout faire, via le rôle infalsifiable
drop policy if exists members_staff_all on public.members;
create policy members_staff_all on public.members
  for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
