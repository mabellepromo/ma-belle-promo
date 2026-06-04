-- Chantier sécurité RLS — Étape 4, lot 1 : finances (sensible)
-- Tables : tresorerie_transactions / _budget / _remboursements / _subventions,
--          factures, payments, cotisations.
--
-- Règle appliquée :
--   - Écritures réservées au STAFF (admin OU bureau) via is_staff().
--   - On CONSERVE les actions légitimes : insertion passerelle de paiement,
--     lecture par un membre de SES propres paiements/cotisations, MAJ webhook.
--   - On RETIRE les lectures/écritures « tout authentifié » ou « public » qui
--     permettaient à n'importe qui de modifier un statut (ex. cotisations).

-- Helper réutilisable : id de la fiche membre liée au compte connecté (par email).
-- SECURITY DEFINER pour résoudre l'identité même si la RLS members restreint la vue.
create or replace function public.my_member_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.members where email = auth.email() limit 1;
$$;
revoke all on function public.my_member_id() from public;
grant execute on function public.my_member_id() to authenticated;

-- ── tresorerie_transactions ──
drop policy if exists tresorerie_select on public.tresorerie_transactions;
drop policy if exists tresorerie_insert on public.tresorerie_transactions;
drop policy if exists tresorerie_update on public.tresorerie_transactions;
drop policy if exists tresorerie_delete on public.tresorerie_transactions;
drop policy if exists tresorerie_transactions_staff_all on public.tresorerie_transactions;
create policy tresorerie_transactions_staff_all on public.tresorerie_transactions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── tresorerie_budget ──
drop policy if exists "Admins manage budget" on public.tresorerie_budget;
drop policy if exists "Public read budget" on public.tresorerie_budget;
drop policy if exists tresorerie_budget_staff_all on public.tresorerie_budget;
create policy tresorerie_budget_staff_all on public.tresorerie_budget
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── tresorerie_remboursements ──
drop policy if exists admin_full_access on public.tresorerie_remboursements;
drop policy if exists tresorerie_remboursements_staff_all on public.tresorerie_remboursements;
create policy tresorerie_remboursements_staff_all on public.tresorerie_remboursements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── tresorerie_subventions ──
drop policy if exists admin_full_access on public.tresorerie_subventions;
drop policy if exists tresorerie_subventions_staff_all on public.tresorerie_subventions;
create policy tresorerie_subventions_staff_all on public.tresorerie_subventions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── factures ──
drop policy if exists factures_authenticated on public.factures;
drop policy if exists factures_staff_all on public.factures;
create policy factures_staff_all on public.factures
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── payments ──
-- Remplace l'accès admin (user_metadata) par staff. On CONSERVE :
--   payments_public_insert (création par la passerelle FedaPay)
--   payments_self_select   (un membre lit SES paiements)
--   payments_webhook_update (mise à jour de statut par le webhook)
drop policy if exists payments_admin_all on public.payments;
drop policy if exists payments_staff_all on public.payments;
create policy payments_staff_all on public.payments
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── cotisations ──
-- RETIRE « Accès authentifiés » (FOR ALL à tout authentifié : permettait à un
-- membre de modifier son propre statut). Staff = tout ; membre = lecture des siennes.
drop policy if exists "Accès authentifiés" on public.cotisations;
drop policy if exists cotisations_staff_all on public.cotisations;
create policy cotisations_staff_all on public.cotisations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists cotisations_self_select on public.cotisations;
create policy cotisations_self_select on public.cotisations
  for select to authenticated using (member_id = public.my_member_id());
