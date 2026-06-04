-- Chantier sécurité RLS — Étape 4, lot 2 : vie associative (interne)
-- Tables : assemblees (+presences/resolutions), mandats, registre_documents_legaux,
--          registre_conflits, benevoles (+missions/heures), conventions.
-- Vérifié : toutes ces tables ne sont lues/écrites QUE par le dashboard (staff).
-- => écriture ET lecture réservées au staff (admin OU bureau) via is_staff().

-- ── assemblees ──
drop policy if exists assemblees_select on public.assemblees;
drop policy if exists assemblees_insert on public.assemblees;
drop policy if exists assemblees_update on public.assemblees;
drop policy if exists assemblees_delete on public.assemblees;
drop policy if exists assemblees_staff_all on public.assemblees;
create policy assemblees_staff_all on public.assemblees
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── assemblee_presences ──
drop policy if exists presences_select on public.assemblee_presences;
drop policy if exists presences_insert on public.assemblee_presences;
drop policy if exists presences_update on public.assemblee_presences;
drop policy if exists presences_delete on public.assemblee_presences;
drop policy if exists assemblee_presences_staff_all on public.assemblee_presences;
create policy assemblee_presences_staff_all on public.assemblee_presences
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── assemblee_resolutions ──
drop policy if exists resolutions_select on public.assemblee_resolutions;
drop policy if exists resolutions_insert on public.assemblee_resolutions;
drop policy if exists resolutions_update on public.assemblee_resolutions;
drop policy if exists resolutions_delete on public.assemblee_resolutions;
drop policy if exists assemblee_resolutions_staff_all on public.assemblee_resolutions;
create policy assemblee_resolutions_staff_all on public.assemblee_resolutions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── mandats ──
drop policy if exists "Admins manage mandats" on public.mandats;
drop policy if exists "Public read mandats" on public.mandats;
drop policy if exists mandats_staff_all on public.mandats;
create policy mandats_staff_all on public.mandats
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── registre_documents_legaux ──
drop policy if exists admin_full_access on public.registre_documents_legaux;
drop policy if exists registre_documents_legaux_staff_all on public.registre_documents_legaux;
create policy registre_documents_legaux_staff_all on public.registre_documents_legaux
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── registre_conflits ──
drop policy if exists admin_full_access on public.registre_conflits;
drop policy if exists registre_conflits_staff_all on public.registre_conflits;
create policy registre_conflits_staff_all on public.registre_conflits
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── benevoles ──
drop policy if exists admin_full_access on public.benevoles;
drop policy if exists benevoles_staff_all on public.benevoles;
create policy benevoles_staff_all on public.benevoles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── missions_benevoles ──
drop policy if exists admin_full_access on public.missions_benevoles;
drop policy if exists missions_benevoles_staff_all on public.missions_benevoles;
create policy missions_benevoles_staff_all on public.missions_benevoles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── heures_benevoles ──
drop policy if exists admin_full_access on public.heures_benevoles;
drop policy if exists heures_benevoles_staff_all on public.heures_benevoles;
create policy heures_benevoles_staff_all on public.heures_benevoles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── conventions ──
drop policy if exists auth_select_conventions on public.conventions;
drop policy if exists auth_insert_conventions on public.conventions;
drop policy if exists auth_update_conventions on public.conventions;
drop policy if exists auth_delete_conventions on public.conventions;
drop policy if exists conventions_staff_all on public.conventions;
create policy conventions_staff_all on public.conventions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
