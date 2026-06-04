-- Chantier sécurité RLS — Étape 4, lot 4 : actions des membres
-- Le plus délicat : un membre DOIT pouvoir écrire, mais SEULEMENT pour lui-même.
-- On remplace les USING(true) (n'importe qui écrit / vote forgeable) par des
-- restrictions « self » (my_member_id() / auth.uid() / auth.email()), et les
-- contrôles user_metadata=admin / auth.role()=authenticated par is_staff().
-- On CONSERVE les accès publics légitimes (check-in, lecture élections, inscription webinaire).

-- ── event_registrations ── (s'inscrire à un événement = sa propre ligne)
drop policy if exists "Admins read registrations" on public.event_registrations;
drop policy if exists "Members manage own registrations" on public.event_registrations;
drop policy if exists event_registrations_staff_all on public.event_registrations;
drop policy if exists event_registrations_self_all on public.event_registrations;
create policy event_registrations_staff_all on public.event_registrations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy event_registrations_self_all on public.event_registrations
  for all to authenticated
  using (member_id = public.my_member_id())
  with check (member_id = public.my_member_id());

-- ── evenement_presences ── (check-in public conservé)
drop policy if exists admin_select on public.evenement_presences;
drop policy if exists admin_delete on public.evenement_presences;
drop policy if exists evenement_presences_staff_all on public.evenement_presences;
create policy evenement_presences_staff_all on public.evenement_presences
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- public_insert (INSERT) est CONSERVÉ.

-- ── elections ── (lecture publique conservée)
drop policy if exists "Admins manage elections" on public.elections;
drop policy if exists elections_staff_all on public.elections;
create policy elections_staff_all on public.elections
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── election_candidats ── (lecture publique conservée)
drop policy if exists "Admins manage candidats" on public.election_candidats;
drop policy if exists election_candidats_staff_all on public.election_candidats;
create policy election_candidats_staff_all on public.election_candidats
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── election_votes ── (un membre vote AVEC SON id, ne peut forger un vote)
-- NB : « une seule fois » devra être garanti par un index unique (election_id, voter_id).
drop policy if exists "Admins read votes" on public.election_votes;
drop policy if exists "Members vote once" on public.election_votes;
drop policy if exists election_votes_staff_all on public.election_votes;
drop policy if exists election_votes_self_select on public.election_votes;
drop policy if exists election_votes_self_insert on public.election_votes;
create policy election_votes_staff_all on public.election_votes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy election_votes_self_select on public.election_votes
  for select to authenticated using (voter_id = public.my_member_id());
create policy election_votes_self_insert on public.election_votes
  for insert to authenticated with check (voter_id = public.my_member_id());

-- ── opportunites ── (remplace les 4 policies user_metadata=admin par staff ;
--    conserve opp_insert_member / opp_select_published / opp_select_self)
drop policy if exists opp_select_admin on public.opportunites;
drop policy if exists opp_insert_admin on public.opportunites;
drop policy if exists opp_update_admin on public.opportunites;
drop policy if exists opp_delete_admin on public.opportunites;
drop policy if exists opportunites_staff_all on public.opportunites;
create policy opportunites_staff_all on public.opportunites
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── webinar_events ── (lecture publique conservée)
drop policy if exists webinar_events_all_admin on public.webinar_events;
drop policy if exists webinar_events_staff_all on public.webinar_events;
create policy webinar_events_staff_all on public.webinar_events
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── webinar_registrations ── (inscription publique + désinscription par token conservées ;
--    accès self via user_id = auth.uid())
drop policy if exists webinar_registrations_select_admin on public.webinar_registrations;
drop policy if exists webinar_registrations_update_admin on public.webinar_registrations;
drop policy if exists webinar_registrations_staff_all on public.webinar_registrations;
drop policy if exists webinar_registrations_self_select on public.webinar_registrations;
drop policy if exists webinar_registrations_self_update on public.webinar_registrations;
create policy webinar_registrations_staff_all on public.webinar_registrations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy webinar_registrations_self_select on public.webinar_registrations
  for select to authenticated using (user_id = auth.uid());
create policy webinar_registrations_self_update on public.webinar_registrations
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- conservés : webinar_registrations_insert_public, _select_by_token, _update_by_token.

-- ── webinar_mentors_auto ── (interne)
drop policy if exists webinar_mentors_all_admin on public.webinar_mentors_auto;
drop policy if exists webinar_mentors_auto_staff_all on public.webinar_mentors_auto;
create policy webinar_mentors_auto_staff_all on public.webinar_mentors_auto
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
