-- Chantier sécurité RLS — Étape 4, lot 3 : communication / contenu
-- Principe : on RETIRE les écritures « tout authentifié » / « public » de GESTION,
-- on les remplace par is_staff(). On CONSERVE soigneusement les accès publics
-- légitimes : insertion du formulaire de contact (messages), et lecture + insertion
-- des sondages par les répondants (page publique Sondage.jsx).

-- ── messages ── (garde insert_public = formulaire de contact)
drop policy if exists messages_admin_all on public.messages;
drop policy if exists messages_staff_all on public.messages;
create policy messages_staff_all on public.messages
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── circulaires ── (dashboard only)
drop policy if exists "Admins manage circulaires" on public.circulaires;
drop policy if exists circulaires_staff_all on public.circulaires;
create policy circulaires_staff_all on public.circulaires
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── automations ── (dashboard only)
drop policy if exists auth_select_automations on public.automations;
drop policy if exists auth_update_automations on public.automations;
drop policy if exists automations_staff_all on public.automations;
create policy automations_staff_all on public.automations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── automation_logs ── (lecture staff ; on garde l'insertion pour la journalisation)
drop policy if exists auth_select_logs on public.automation_logs;
drop policy if exists automation_logs_staff_all on public.automation_logs;
create policy automation_logs_staff_all on public.automation_logs
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- all_insert_logs (INSERT public) est CONSERVÉ.

-- ── signatures ── (dashboard only)
drop policy if exists signatures_admin_all on public.signatures;
drop policy if exists signatures_staff_all on public.signatures;
create policy signatures_staff_all on public.signatures
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── passations / passation_modeles ── (dashboard only)
drop policy if exists passations_admin_all on public.passations;
drop policy if exists passations_staff_all on public.passations;
create policy passations_staff_all on public.passations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists passation_modeles_admin_all on public.passation_modeles;
drop policy if exists passation_modeles_staff_all on public.passation_modeles;
create policy passation_modeles_staff_all on public.passation_modeles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── procedures / procedure_versions ── (dashboard only)
drop policy if exists procedures_admin_all on public.procedures;
drop policy if exists procedures_staff_all on public.procedures;
create policy procedures_staff_all on public.procedures
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists procedure_versions_admin_all on public.procedure_versions;
drop policy if exists procedure_versions_staff_all on public.procedure_versions;
create policy procedure_versions_staff_all on public.procedure_versions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── SONDAGES ── on garde les LECTURES publiques et les INSERT publics (répondre),
-- on remplace seulement la GESTION (créer/modifier/supprimer) par is_staff().

-- sondages : garde sondages_public_read
drop policy if exists sondages_auth_write on public.sondages;
drop policy if exists sondages_staff_all on public.sondages;
create policy sondages_staff_all on public.sondages
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sondage_sections : garde sondage_sections_select_all
drop policy if exists sondage_sections_insert_auth on public.sondage_sections;
drop policy if exists sondage_sections_update_auth on public.sondage_sections;
drop policy if exists sondage_sections_delete_auth on public.sondage_sections;
drop policy if exists sondage_sections_staff_all on public.sondage_sections;
create policy sondage_sections_staff_all on public.sondage_sections
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sondage_questions : garde "Public read sondage_questions"
drop policy if exists "Auth write sondage_questions" on public.sondage_questions;
drop policy if exists sondage_questions_staff_all on public.sondage_questions;
create policy sondage_questions_staff_all on public.sondage_questions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sondage_invitations : garde "Public read sondage_invitations"
drop policy if exists "Auth write sondage_invitations" on public.sondage_invitations;
drop policy if exists sondage_invitations_staff_all on public.sondage_invitations;
create policy sondage_invitations_staff_all on public.sondage_invitations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sondage_reponses : garde "Public insert" + "Public read" (résultats publics)
drop policy if exists "Auth manage sondage_reponses" on public.sondage_reponses;
drop policy if exists sondage_reponses_staff_all on public.sondage_reponses;
create policy sondage_reponses_staff_all on public.sondage_reponses
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sondage_soumissions : garde "Public insert" + "Public read"
drop policy if exists "Auth manage sondage_soumissions" on public.sondage_soumissions;
drop policy if exists sondage_soumissions_staff_all on public.sondage_soumissions;
create policy sondage_soumissions_staff_all on public.sondage_soumissions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
