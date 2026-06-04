-- Chantier sécurité RLS — Étape 4, lot 6 : finitions
-- Table oubliée des lots précédents + durcissement du helper.

-- bulk_emails (brouillons d'emails de masse) : usage dashboard only -> staff.
drop policy if exists bulk_emails_authenticated on public.bulk_emails;
drop policy if exists bulk_emails_staff_all on public.bulk_emails;
create policy bulk_emails_staff_all on public.bulk_emails
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- my_member_id() : inutile pour les anonymes (renvoie null) -> on retire l'accès anon.
revoke execute on function public.my_member_id() from anon;
