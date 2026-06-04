-- =====================================================================
-- SAUVEGARDE COMPLÈTE DES POLITIQUES RLS — état du 2026-06-04
-- AVANT le chantier de sécurisation (migration user_metadata -> is_staff()).
-- 136 politiques, telles qu'elles fonctionnaient en production.
--
-- USAGE EN CAS DE REVERT :
--   1. Supprimer les nouvelles politiques créées par le chantier
--      (ex. pour members : DROP POLICY members_staff_all ON public.members; etc.)
--   2. Rejouer la section concernée de ce fichier pour restaurer l'état d'origine.
--   Chaque CREATE POLICY ci-dessous est un état VALIDE et FONCTIONNEL au 2026-06-04.
--
-- NOTE : ce fichier est volontairement HORS du flux de migration normal
-- (dossier backups/) pour ne pas être rejoué par `supabase db push`.
-- =====================================================================

CREATE POLICY articles_admin_delete ON public.articles AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY articles_admin_insert ON public.articles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY articles_admin_update ON public.articles AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY articles_public_read ON public.articles AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY presences_delete ON public.assemblee_presences AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY presences_insert ON public.assemblee_presences AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY presences_select ON public.assemblee_presences AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY presences_update ON public.assemblee_presences AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY resolutions_delete ON public.assemblee_resolutions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY resolutions_insert ON public.assemblee_resolutions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY resolutions_select ON public.assemblee_resolutions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY resolutions_update ON public.assemblee_resolutions AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY assemblees_delete ON public.assemblees AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY assemblees_insert ON public.assemblees AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY assemblees_select ON public.assemblees AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY assemblees_update ON public.assemblees AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY insertion_publique ON public.attestations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY lecture_publique ON public.attestations AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY all_insert_logs ON public.automation_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY auth_select_logs ON public.automation_logs AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY auth_select_automations ON public.automations AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY auth_update_automations ON public.automations AS PERMISSIVE FOR UPDATE TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY admin_full_access ON public.benevoles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY bulk_emails_authenticated ON public.bulk_emails AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins manage circulaires" ON public.circulaires AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY admins_full_access ON public.commandes AS PERMISSIVE FOR ALL TO public USING (((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))) WITH CHECK (((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)));
CREATE POLICY public_insert ON public.commandes AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY communiques_admin_write ON public.communiques AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY communiques_read ON public.communiques AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY auth_delete_conventions ON public.conventions AS PERMISSIVE FOR DELETE TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY auth_insert_conventions ON public.conventions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY auth_select_conventions ON public.conventions AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY auth_update_conventions ON public.conventions AS PERMISSIVE FOR UPDATE TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Accès authentifiés" ON public.cotisations AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY documents_admin_write ON public.documents AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY documents_read ON public.documents AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage candidats" ON public.election_candidats AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Public read candidats" ON public.election_candidats AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Admins read votes" ON public.election_votes AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Members vote once" ON public.election_votes AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins manage elections" ON public.elections AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Public read elections" ON public.elections AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY email_logs_delete_authenticated ON public.email_logs AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY email_logs_read_authenticated ON public.email_logs AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY equipe_admin_write ON public.equipe AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY equipe_read ON public.equipe AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY admin_delete ON public.evenement_presences AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY admin_select ON public.evenement_presences AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY public_insert ON public.evenement_presences AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY evenements_admin_write ON public.evenements AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY evenements_read ON public.evenements AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Admins read registrations" ON public.event_registrations AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Members manage own registrations" ON public.event_registrations AS PERMISSIVE FOR ALL TO public USING (true);
CREATE POLICY factures_authenticated ON public.factures AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY galeries_admin_write ON public.galeries AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY galeries_read ON public.galeries AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY admin_full_access ON public.heures_benevoles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins manage mandats" ON public.mandats AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Public read mandats" ON public.mandats AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY mbp_store_admin_write ON public.mbp_store AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY mbp_store_public_read ON public.mbp_store AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY media_photos_admin_write ON public.media_photos AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY media_photos_read ON public.media_photos AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY media_videos_admin_write ON public.media_videos AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY media_videos_read ON public.media_videos AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY members_admin_delete ON public.members AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY members_admin_insert ON public.members AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY members_admin_select ON public.members AS PERMISSIVE FOR SELECT TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY members_admin_update ON public.members AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY members_insert_anon ON public.members AS PERMISSIVE FOR INSERT TO anon WITH CHECK ((status = 'pending'::text));
CREATE POLICY members_select_validated ON public.members AS PERMISSIVE FOR SELECT TO public USING ((status = 'validated'::text));
CREATE POLICY members_self_select ON public.members AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.email() = email));
CREATE POLICY members_self_update ON public.members AS PERMISSIVE FOR UPDATE TO authenticated USING ((auth.email() = email)) WITH CHECK ((auth.email() = email));
CREATE POLICY insert_public ON public.messages AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY messages_admin_all ON public.messages AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY admin_full_access ON public.missions_benevoles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY newsletter_authenticated_read ON public.newsletter_subscribers AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY public_insert_newsletter ON public.newsletter_subscribers AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY opp_delete_admin ON public.opportunites AS PERMISSIVE FOR DELETE TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY opp_insert_admin ON public.opportunites AS PERMISSIVE FOR INSERT TO public WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY opp_insert_member ON public.opportunites AS PERMISSIVE FOR INSERT TO public WITH CHECK (((auth.role() = 'authenticated'::text) AND (statut = 'en_attente'::text) AND (auth.email() = poste_par_email)));
CREATE POLICY opp_select_admin ON public.opportunites AS PERMISSIVE FOR SELECT TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY opp_select_published ON public.opportunites AS PERMISSIVE FOR SELECT TO public USING (((auth.role() = 'authenticated'::text) AND (statut = 'publiee'::text)));
CREATE POLICY opp_select_self ON public.opportunites AS PERMISSIVE FOR SELECT TO public USING ((auth.email() = poste_par_email));
CREATE POLICY opp_update_admin ON public.opportunites AS PERMISSIVE FOR UPDATE TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY passation_modeles_admin_all ON public.passation_modeles AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY passations_admin_all ON public.passations AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY payments_admin_all ON public.payments AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY payments_public_insert ON public.payments AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY payments_self_select ON public.payments AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.email() = customer_email));
CREATE POLICY payments_webhook_update ON public.payments AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK ((status = ANY (ARRAY['approved'::text, 'declined'::text, 'canceled'::text, 'transferred'::text, 'refunded'::text])));
CREATE POLICY procedure_versions_admin_all ON public.procedure_versions AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY procedures_admin_all ON public.procedures AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY programmes_admin_write ON public.programmes AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY programmes_read ON public.programmes AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY projets_admin_write ON public.projets AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY projets_read ON public.projets AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY admin_full_access ON public.registre_conflits AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_full_access ON public.registre_documents_legaux AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ressources_admin_write ON public.ressources AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY ressources_read ON public.ressources AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY signatures_admin_all ON public.signatures AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Auth write sondage_invitations" ON public.sondage_invitations AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY "Public read sondage_invitations" ON public.sondage_invitations AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Auth write sondage_questions" ON public.sondage_questions AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY "Public read sondage_questions" ON public.sondage_questions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage sondage_reponses" ON public.sondage_reponses AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY "Public insert sondage_reponses" ON public.sondage_reponses AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read sondage_reponses" ON public.sondage_reponses AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY sondage_sections_delete_auth ON public.sondage_sections AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY sondage_sections_insert_auth ON public.sondage_sections AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY sondage_sections_select_all ON public.sondage_sections AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY sondage_sections_update_auth ON public.sondage_sections AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY "Auth manage sondage_soumissions" ON public.sondage_soumissions AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY "Public insert sondage_soumissions" ON public.sondage_soumissions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read sondage_soumissions" ON public.sondage_soumissions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY sondages_auth_write ON public.sondages AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY sondages_public_read ON public.sondages AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY read_public ON public.sponsors AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY sponsors_admin_write ON public.sponsors AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)) WITH CHECK ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Admins manage budget" ON public.tresorerie_budget AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Public read budget" ON public.tresorerie_budget AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY admin_full_access ON public.tresorerie_remboursements AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_full_access ON public.tresorerie_subventions AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tresorerie_delete ON public.tresorerie_transactions AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY tresorerie_insert ON public.tresorerie_transactions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY tresorerie_select ON public.tresorerie_transactions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY tresorerie_update ON public.tresorerie_transactions AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY webinar_events_all_admin ON public.webinar_events AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY webinar_events_select_public ON public.webinar_events AS PERMISSIVE FOR SELECT TO public USING ((status = ANY (ARRAY['open'::text, 'closed'::text])));
CREATE POLICY webinar_mentors_all_admin ON public.webinar_mentors_auto AS PERMISSIVE FOR ALL TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));
CREATE POLICY webinar_registrations_insert_public ON public.webinar_registrations AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY webinar_registrations_select_admin ON public.webinar_registrations AS PERMISSIVE FOR SELECT TO public USING (((user_id = auth.uid()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
CREATE POLICY webinar_registrations_select_by_token ON public.webinar_registrations AS PERMISSIVE FOR SELECT TO public USING ((unregistration_token IS NOT NULL));
CREATE POLICY webinar_registrations_update_admin ON public.webinar_registrations AS PERMISSIVE FOR UPDATE TO public USING (((user_id = auth.uid()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
CREATE POLICY webinar_registrations_update_by_token ON public.webinar_registrations AS PERMISSIVE FOR UPDATE TO public USING ((unregistration_token IS NOT NULL));
