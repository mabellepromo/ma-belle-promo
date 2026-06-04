-- Enrichissement du registre des signatures (2026-06-04)
-- Ajoute le type de document (catégorie) et le lien du document à signer (source).

ALTER TABLE public.signatures
  ADD COLUMN IF NOT EXISTS type       text,
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE INDEX IF NOT EXISTS signatures_type_idx ON public.signatures (type);
