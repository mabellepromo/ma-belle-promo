-- Upload photo par un candidat bénévole ANONYME (formulaire public).
-- Date : 2026-06-11
--
-- Sécurité : on autorise l'INSERT anonyme dans le bucket `mbp-media` UNIQUEMENT
-- sous le préfixe `candidatures/` (jamais le dossier `images/` partagé du site).
-- La lecture publique des fichiers reste assurée par le bucket public existant.
-- Limites de taille/MIME : contrôlées côté client (uploadCandidateAvatar : JPEG/PNG, 2 Mo).

DROP POLICY IF EXISTS "candidatures_avatar_anon_insert" ON storage.objects;

CREATE POLICY "candidatures_avatar_anon_insert" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'mbp-media'
    AND (storage.foldername(name))[1] = 'candidatures'
  );
