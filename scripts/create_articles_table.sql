-- Migration Session C — Table articles dédiée
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.articles (
  id          text PRIMARY KEY,
  titre       text NOT NULL,
  extrait     text,
  date        text,
  categorie   text,
  image       text,
  youtube     text,
  photos      jsonb        DEFAULT '[]'::jsonb,
  contenu     text,
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "articles_public_read"
  ON public.articles FOR SELECT USING (true);

-- Écriture réservée aux utilisateurs authentifiés (admin)
CREATE POLICY "articles_auth_insert"
  ON public.articles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "articles_auth_update"
  ON public.articles FOR UPDATE TO authenticated USING (true);

CREATE POLICY "articles_auth_delete"
  ON public.articles FOR DELETE TO authenticated USING (true);
