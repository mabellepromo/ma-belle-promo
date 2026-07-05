// Edge Function — Envoi d'un courrier officiel au format email (via Brevo)
//
// Déclenchée par le bureau depuis le dashboard (rubrique Courrier). Le HTML
// email est assemblé côté client (src/lib/courrierEmail.js) et transmis ici ;
// la fonction l'envoie via Brevo et journalise dans email_logs.
//
// Sécurité : JWT obligatoire (même posture que webinaire-billet /
// event-invitation). Le mode test global TEST_REDIRECT_EMAIL s'applique
// automatiquement via sendBrevoEmail.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/db.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

interface RequestBody {
  to: string;
  cc?: string | null;
  subject: string;
  html: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // ── Auth JWT ──
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Non autorisé" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return jsonResponse({ error: "Configuration Supabase manquante" }, 500);

  const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }).auth.getUser();
  if (authErr || !user) return jsonResponse({ error: "Token invalide ou expiré" }, 401);

  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) return jsonResponse({ error: "BREVO_API_KEY non configurée" }, 500);

  let body: RequestBody;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: "JSON invalide" }, 400); }

  const to = (body.to || "").trim().toLowerCase();
  const cc = (body.cc || "").trim().toLowerCase();
  const subject = (body.subject || "").trim();
  const html = body.html || "";

  if (!EMAIL_RE.test(to)) return jsonResponse({ error: "Email destinataire invalide" }, 400);
  if (cc && !EMAIL_RE.test(cc)) return jsonResponse({ error: "Email CC invalide" }, 400);
  if (!subject) return jsonResponse({ error: "Objet (subject) obligatoire" }, 400);
  if (!html) return jsonResponse({ error: "Contenu HTML manquant" }, 400);

  try {
    // La journalisation dans email_logs (succès comme erreur) est assurée
    // par sendBrevoEmail — plus besoin d'insert manuel ici.
    await sendBrevoEmail(apiKey, {
      to: [{ email: to }],
      cc: cc ? [{ email: cc }] : undefined,
      subject,
      htmlContent: html,
      replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    }, { source: "courrier", sentBy: user.email || undefined });

    return jsonResponse({ success: true, sent: 1 });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
