-- Migration : système d'inscription aux webinaires MBP
-- Date : 2026-05-28

-- ── Table des événements webinaires ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webinar_events (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text        NOT NULL,
  description           text,
  date_time             timestamptz,
  zoom_link             text,
  max_participants      integer,
  event_type            text        NOT NULL DEFAULT 'webinaire'
                          CHECK (event_type IN ('webinaire', 'atelier', 'reunion')),
  status                text        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  gdpr_consent_required boolean     NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ── Table des inscriptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                uuid        NOT NULL REFERENCES webinar_events(id) ON DELETE CASCADE,
  user_id                 uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email                   text        NOT NULL,
  nom_complet             text        NOT NULL,
  telephone               text,
  profession              text,
  organisation            text,
  raison_participation    text        CHECK (raison_participation IN ('professionnel', 'etudiant', 'autre')),
  gdpr_consent            boolean     NOT NULL DEFAULT false,
  newsletter_opt_in       boolean     NOT NULL DEFAULT false,
  registration_date       timestamptz NOT NULL DEFAULT now(),
  unregistration_date     timestamptz,
  status                  text        NOT NULL DEFAULT 'registered'
                            CHECK (status IN ('registered', 'unregistered', 'attended')),
  unregistration_token    text        UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  UNIQUE(event_id, email)
);

-- ── Table import auto mentors/mentorés Passerelles ───────────────────────────
CREATE TABLE IF NOT EXISTS webinar_mentors_auto (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id      uuid    NOT NULL REFERENCES webinar_events(id) ON DELETE CASCADE,
  person_id       text    REFERENCES members(id) ON DELETE SET NULL,
  role            text    NOT NULL CHECK (role IN ('mentor', 'mentee')),
  auto_included   boolean NOT NULL DEFAULT true,
  registration_id uuid    REFERENCES webinar_registrations(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Index ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_event_id ON webinar_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_email    ON webinar_registrations(email);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_token    ON webinar_registrations(unregistration_token);
CREATE INDEX IF NOT EXISTS idx_webinar_events_status          ON webinar_events(status);
CREATE INDEX IF NOT EXISTS idx_webinar_mentors_webinar_id     ON webinar_mentors_auto(webinar_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE webinar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_mentors_auto ENABLE ROW LEVEL SECURITY;

-- webinar_events : lecture publique des events ouverts/fermés, CRUD admin
CREATE POLICY "webinar_events_select_public"
  ON webinar_events FOR SELECT
  USING (status IN ('open', 'closed'));

CREATE POLICY "webinar_events_all_admin"
  ON webinar_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

-- webinar_registrations : inscription publique, lecture/update owner ou admin
CREATE POLICY "webinar_registrations_insert_public"
  ON webinar_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "webinar_registrations_select_admin"
  ON webinar_registrations FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "webinar_registrations_update_admin"
  ON webinar_registrations FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

-- Désinscription par token (sans authentification) : lecture seule par token
CREATE POLICY "webinar_registrations_select_by_token"
  ON webinar_registrations FOR SELECT
  USING (unregistration_token IS NOT NULL);

CREATE POLICY "webinar_registrations_update_by_token"
  ON webinar_registrations FOR UPDATE
  USING (unregistration_token IS NOT NULL);

-- webinar_mentors_auto : admin uniquement
CREATE POLICY "webinar_mentors_all_admin"
  ON webinar_mentors_auto FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role') = 'admin'
    )
  );
