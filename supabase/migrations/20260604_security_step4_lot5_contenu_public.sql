-- Chantier sécurité RLS — Étape 4, lot 5 : contenu public (site vitrine) + divers
-- Motif : on CONSERVE la lecture publique (c'est le contenu du site) et on bascule
-- les écritures user_metadata=admin -> is_staff(). Cas particuliers en fin de fichier.

-- ── CMS : <table>_admin_write (user_metadata) -> <table>_staff_all, lecture publique gardée ──

-- articles (3 policies admin séparées)
drop policy if exists articles_admin_insert on public.articles;
drop policy if exists articles_admin_update on public.articles;
drop policy if exists articles_admin_delete on public.articles;
drop policy if exists articles_staff_all on public.articles;
create policy articles_staff_all on public.articles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- communiques
drop policy if exists communiques_admin_write on public.communiques;
drop policy if exists communiques_staff_all on public.communiques;
create policy communiques_staff_all on public.communiques
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- documents
drop policy if exists documents_admin_write on public.documents;
drop policy if exists documents_staff_all on public.documents;
create policy documents_staff_all on public.documents
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- equipe
drop policy if exists equipe_admin_write on public.equipe;
drop policy if exists equipe_staff_all on public.equipe;
create policy equipe_staff_all on public.equipe
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- evenements
drop policy if exists evenements_admin_write on public.evenements;
drop policy if exists evenements_staff_all on public.evenements;
create policy evenements_staff_all on public.evenements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- galeries
drop policy if exists galeries_admin_write on public.galeries;
drop policy if exists galeries_staff_all on public.galeries;
create policy galeries_staff_all on public.galeries
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- media_photos
drop policy if exists media_photos_admin_write on public.media_photos;
drop policy if exists media_photos_staff_all on public.media_photos;
create policy media_photos_staff_all on public.media_photos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- media_videos
drop policy if exists media_videos_admin_write on public.media_videos;
drop policy if exists media_videos_staff_all on public.media_videos;
create policy media_videos_staff_all on public.media_videos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- programmes
drop policy if exists programmes_admin_write on public.programmes;
drop policy if exists programmes_staff_all on public.programmes;
create policy programmes_staff_all on public.programmes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- projets
drop policy if exists projets_admin_write on public.projets;
drop policy if exists projets_staff_all on public.projets;
create policy projets_staff_all on public.projets
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ressources
drop policy if exists ressources_admin_write on public.ressources;
drop policy if exists ressources_staff_all on public.ressources;
create policy ressources_staff_all on public.ressources
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- sponsors (lecture publique = read_public)
drop policy if exists sponsors_admin_write on public.sponsors;
drop policy if exists sponsors_staff_all on public.sponsors;
create policy sponsors_staff_all on public.sponsors
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- mbp_store (table héritée, lecture publique)
drop policy if exists mbp_store_admin_write on public.mbp_store;
drop policy if exists mbp_store_staff_all on public.mbp_store;
create policy mbp_store_staff_all on public.mbp_store
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── Cas particuliers ──

-- newsletter_subscribers : on garde l'inscription publique, la liste passe en staff
drop policy if exists newsletter_authenticated_read on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_staff_all on public.newsletter_subscribers;
create policy newsletter_subscribers_staff_all on public.newsletter_subscribers
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- public_insert_newsletter (INSERT) CONSERVÉ.

-- attestations : lecture publique gardée (vérification QR), écriture staff (retire l'insert public)
drop policy if exists insertion_publique on public.attestations;
drop policy if exists attestations_staff_all on public.attestations;
create policy attestations_staff_all on public.attestations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- lecture_publique (SELECT) CONSERVÉE.

-- commandes : on garde l'insertion publique (boutique), gestion en staff
drop policy if exists admins_full_access on public.commandes;
drop policy if exists commandes_staff_all on public.commandes;
create policy commandes_staff_all on public.commandes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- public_insert (INSERT) CONSERVÉ.

-- email_logs : entièrement staff (insertion par Edge Functions en service_role)
drop policy if exists email_logs_read_authenticated on public.email_logs;
drop policy if exists email_logs_delete_authenticated on public.email_logs;
drop policy if exists email_logs_staff_all on public.email_logs;
create policy email_logs_staff_all on public.email_logs
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
