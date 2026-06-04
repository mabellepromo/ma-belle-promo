-- Module Signature électronique (DocuSeal) MBP
-- Créé le 2026-06-04
-- Suivi des demandes de signature envoyées via une instance DocuSeal self-hosted.
-- La table ne stocke que le SUIVI ; les documents vivent dans DocuSeal (les URLs
-- signées expirent → on conserve le submission_id et on récupère une URL fraîche
-- à la demande via l'API DocuSeal).

CREATE TABLE IF NOT EXISTS public.signatures (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_titre        text        NOT NULL,
  docuseal_template_id  text,                       -- modèle DocuSeal (champs de signature placés)
  signataires           jsonb       NOT NULL DEFAULT '[]',  -- [{ name, email, status }]
  statut                text        NOT NULL DEFAULT 'brouillon'
                                    CHECK (statut IN ('brouillon', 'envoye', 'signe')),
  docuseal_submission_id text,
  date_signature        timestamptz,
  signed_url            text,                        -- dernière URL connue (peut expirer)
  created_by            text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signatures_submission_idx ON public.signatures (docuseal_submission_id);

CREATE OR REPLACE FUNCTION public.signatures_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS signatures_updated_at ON public.signatures;
CREATE TRIGGER signatures_updated_at
  BEFORE UPDATE ON public.signatures
  FOR EACH ROW EXECUTE FUNCTION public.signatures_set_updated_at();

-- ─── RLS — réservé au rôle admin ─────────────────────────────────────────────
-- L'edge function docuseal-webhook utilise la service_role (contourne la RLS)
-- pour mettre à jour le statut à réception du webhook DocuSeal.
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signatures_admin_all" ON public.signatures;
CREATE POLICY "signatures_admin_all" ON public.signatures
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
  WITH CHECK (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');
