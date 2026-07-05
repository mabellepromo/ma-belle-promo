// Edge Function — Invitation des anciens participants à un nouvel événement
//
// Déclenchée par l'admin depuis le dashboard (pas par cron). Pour un événement
// cible, envoie via Brevo une invitation aux anciens participants « présents »
// (status='attended') d'autres événements, fournis par le client après
// déduplication et exclusion des déjà-inscrits (cf. getPastAttendees côté front).
//
// Le serveur fait foi : il envoie, puis trace chaque envoi réussi dans
// `event_invitations` et journalise l'ensemble dans `email_logs`.
//
// Sécurité : JWT obligatoire (même posture que webinaire-billet). Le mode test
// global TEST_REDIRECT_EMAIL s'applique automatiquement via sendBrevoEmail.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";

const DEFAULT_INFO_URL = "https://www.mabellepromo.org/activites/webinaires";

interface Recipient {
  email: string;
  name?: string;
  registration_id?: string | null;
}

interface RequestBody {
  event_id: string;
  recipients: Recipient[];
  info_url?: string;
}

// Date + heure en français (fuseau de Lomé, UTC+0)
function formatDateTimeFr(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    });
  } catch {
    return iso;
  }
}

function firstName(nom: string | null | undefined): string {
  return (nom || "").trim().split(/\s+/)[0] || "cher(e) membre";
}

// Bloc d'email d'invitation
function invitationEmail(opts: {
  prenom: string; titre: string; dateStr: string; lieu: string | null; eventUrl: string;
}): string {
  const lieuRow = opts.lieu
    ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;vertical-align:top;width:80px;">📍 Lieu :</td>
           <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(opts.lieu)}</td></tr>`
    : "";
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Vous êtes invité(e) : ${escHtml(opts.titre)}</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">
      Bonjour ${escHtml(opts.prenom)},<br>
      Vous avez déjà participé à l'un de nos événements, et nous serions ravis de vous
      retrouver à cette nouvelle rencontre.
    </p>
    <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:80px;">📅 Date :</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(opts.dateStr)}</td></tr>
        ${lieuRow}
      </table>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${escHtml(opts.eventUrl)}"
         style="display:inline-block;background:#14532d;color:#fff;font-size:15px;font-weight:bold;
                text-decoration:none;padding:14px 32px;border-radius:9999px;">
        Voir l'événement et s'inscrire
      </a>
    </div>
    <p style="margin:0 0 24px;font-size:12px;color:#6b7280;line-height:1.7;text-align:center;">
      Si le bouton ne fonctionne pas, copiez ce lien :<br>
      <a href="${escHtml(opts.eventUrl)}" style="color:#16a34a;word-break:break-all;">${escHtml(opts.eventUrl)}</a>
    </p>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
      Au plaisir de vous retrouver,<br><br>
      <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
      <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
    </p>`;
  return wrapHtml(content);
}

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

  const { event_id, recipients, info_url } = body;
  if (!event_id) return jsonResponse({ error: "event_id obligatoire" }, 400);
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return jsonResponse({ error: "Aucun destinataire fourni" }, 400);
  }

  const db = getServiceClient();

  // ── Événement cible ──
  const { data: ev, error: evErr } = await db
    .from("webinar_events")
    .select("id, title, date_time, lieu")
    .eq("id", event_id)
    .maybeSingle();
  if (evErr) return jsonResponse({ error: `Lecture événement : ${evErr.message}` }, 500);
  if (!ev) return jsonResponse({ error: "Événement introuvable" }, 404);

  const dateStr = formatDateTimeFr(ev.date_time as string);
  // Lien public direct vers l'événement (ancre = id)
  const baseUrl = info_url || DEFAULT_INFO_URL;
  const eventUrl = `${baseUrl}#${ev.id}`;
  const subject = `Vous êtes invité(e) à ${ev.title} — Ma Belle Promo`;

  // Déduplication serveur par email (filet de sécurité)
  const seen = new Set<string>();

  let sent = 0;
  const results: Array<{ email: string; status: string }> = [];
  const traces: Array<Record<string, unknown>> = [];

  for (const r of recipients) {
    const email = (r.email || "").trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);

    try {
      const html = invitationEmail({
        prenom: firstName(r.name),
        titre: ev.title as string,
        dateStr,
        lieu: (ev.lieu as string) || null,
        eventUrl,
      });

      // skip : cette fonction écrit elle-même UNE ligne de synthèse dans email_logs
      await sendBrevoEmail(apiKey, {
        to: [{ email, name: r.name || "" }],
        subject,
        htmlContent: html,
        replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
      }, { skip: true });

      traces.push({
        event_id,
        registration_id: r.registration_id ?? null,
        email,
        invitation_type: "past_attendee",
      });
      sent++;
      results.push({ email, status: "envoyé" });
    } catch (err) {
      results.push({ email, status: `erreur : ${(err as Error).message}` });
    }
  }

  // Trace des invitations réussies (audit + anti-doublon ultérieur)
  if (traces.length) {
    const { error: trErr } = await db.from("event_invitations").insert(traces);
    if (trErr) console.error("Erreur trace event_invitations :", trErr.message);
  }

  const status: "success" | "error" = sent === 0 ? "error" : "success";

  await db.from("email_logs").insert({
    source: "event-invitation",
    subject,
    recipients: results.filter(x => x.status === "envoyé").map(x => x.email),
    recipient_count: sent,
    status,
    error_message: results.filter(x => x.status.startsWith("erreur")).map(x => `${x.email}: ${x.status}`).join(" | ") || null,
    sent_by: user.email || null,
    sent_at: new Date().toISOString(),
  });

  return jsonResponse({ success: status === "success", sent, total: recipients.length, results });
});
