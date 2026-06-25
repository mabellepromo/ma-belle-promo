// Edge Function — Envoi à la demande des billets / liens de webinaire
//
// Déclenchée par l'admin depuis le dashboard (pas par cron). Pour un événement
// donné, envoie via Brevo :
//   • channel "zoom" → le lien de connexion aux inscrits en mode `en_ligne`
//   • channel "qr"   → un billet QR aux inscrits en mode `presentiel`
// Met à jour les colonnes de suivi (zoom_sent / qr_sent / qr_generated) et
// journalise l'envoi dans `email_logs`.
//
// Sécurité : JWT obligatoire (même posture que send-bulk-email). Le mode test
// global TEST_REDIRECT_EMAIL s'applique automatiquement via sendBrevoEmail.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";

const DEFAULT_INFO_URL = "https://www.mabellepromo.org/activites/webinaires";

interface RequestBody {
  event_id: string;
  channel: "zoom" | "qr";
  registration_ids?: string[]; // optionnel : sous-ensemble. Absent = tous les éligibles.
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

function firstName(nom: string | null): string {
  return (nom || "").trim().split(/\s+/)[0] || "cher(e) membre";
}

// Bloc d'email pour le lien Zoom (participants en ligne)
function zoomEmail(opts: {
  prenom: string; titre: string; dateStr: string; zoomLink: string; infoUrl: string;
}): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(opts.titre)}</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">
      Bonjour ${escHtml(opts.prenom)},<br>
      Voici votre lien de connexion pour suivre le webinaire en ligne.
    </p>
    <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:80px;">📅 Date :</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(opts.dateStr)}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${escHtml(opts.zoomLink)}"
         style="display:inline-block;background:#14532d;color:#fff;font-size:15px;font-weight:bold;
                text-decoration:none;padding:14px 32px;border-radius:9999px;">
        🔗 Rejoindre en ligne
      </a>
    </div>
    <p style="margin:0 0 24px;font-size:12px;color:#6b7280;line-height:1.7;text-align:center;">
      Si le bouton ne fonctionne pas, copiez ce lien :<br>
      <a href="${escHtml(opts.zoomLink)}" style="color:#16a34a;word-break:break-all;">${escHtml(opts.zoomLink)}</a>
    </p>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
      Plus d'infos : <a href="${escHtml(opts.infoUrl)}" style="color:#16a34a;">page de l'événement</a><br><br>
      Cordialement,<br>
      <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
      <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
    </p>`;
  return wrapHtml(content);
}

// Bloc d'email pour le billet QR (participants présentiel)
function qrEmail(opts: {
  prenom: string; titre: string; dateStr: string; lieu: string; qrUrl: string; infoUrl: string;
  nom: string; modeLabel: string;
}): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(opts.titre)}</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">
      Bonjour ${escHtml(opts.prenom)},<br>
      Voici votre billet d'entrée pour la rencontre en présentiel.
    </p>
    <div style="text-align:center;margin:0 0 16px;">
      <p style="margin:0;font-size:16px;font-weight:bold;color:#14532d;">${escHtml(opts.nom)}</p>
      <span style="display:inline-block;margin-top:4px;font-size:11px;font-weight:bold;color:#6d28d9;background:#ede9fe;border-radius:9999px;padding:3px 10px;">
        ${escHtml(opts.modeLabel)}
      </span>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:80px;">📅 Date :</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(opts.dateStr)}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;vertical-align:top;">📍 Lieu :</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(opts.lieu)}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:0 0 12px;">
      <img src="${escHtml(opts.qrUrl)}" width="220" height="220" alt="Billet QR"
           style="border:1px solid #e5e7eb;border-radius:12px;padding:8px;background:#fff;" />
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#111827;font-weight:bold;text-align:center;">
      Présentez ce QR code à l'entrée.
    </p>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
      Plus d'infos : <a href="${escHtml(opts.infoUrl)}" style="color:#16a34a;">page de l'événement</a><br><br>
      Cordialement,<br>
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

  const { event_id, channel, registration_ids, info_url } = body;
  if (!event_id) return jsonResponse({ error: "event_id obligatoire" }, 400);
  if (channel !== "zoom" && channel !== "qr") {
    return jsonResponse({ error: "channel doit être 'zoom' ou 'qr'" }, 400);
  }

  const db = getServiceClient();

  // ── Événement ──
  const { data: ev, error: evErr } = await db
    .from("webinar_events")
    .select("id, title, date_time, lieu, zoom_link, format")
    .eq("id", event_id)
    .maybeSingle();
  if (evErr) return jsonResponse({ error: `Lecture événement : ${evErr.message}` }, 500);
  if (!ev) return jsonResponse({ error: "Événement introuvable" }, 404);

  // Pré-conditions par canal
  if (channel === "zoom" && !ev.zoom_link) {
    return jsonResponse({ error: "Lien Zoom manquant sur l'événement : impossible d'envoyer les liens." }, 400);
  }
  if (channel === "qr" && !ev.lieu) {
    return jsonResponse({ error: "Lieu manquant (événement 100% en ligne) : billet QR non applicable." }, 400);
  }

  // ── Inscrits ciblés ──
  // Les inscrits « mixte » (présentiel + en ligne) reçoivent les deux canaux.
  const wantedMode = channel === "zoom" ? "en_ligne" : "presentiel";
  let query = db
    .from("webinar_registrations")
    .select("id, email, nom_complet, mode_participation, status")
    .eq("event_id", event_id)
    .eq("status", "registered")
    .in("mode_participation", [wantedMode, "mixte"])
    .not("email", "is", null);
  if (Array.isArray(registration_ids) && registration_ids.length) {
    query = query.in("id", registration_ids);
  }
  const { data: regs, error: regErr } = await query;
  if (regErr) return jsonResponse({ error: `Lecture inscrits : ${regErr.message}` }, 500);

  if (!regs || regs.length === 0) {
    return jsonResponse({ success: true, channel, sent: 0, total: 0, results: [], note: "Aucun destinataire éligible." });
  }

  const dateStr = formatDateTimeFr(ev.date_time as string);
  const infoUrl = info_url || DEFAULT_INFO_URL;
  const subject = channel === "zoom"
    ? `Votre lien de connexion – ${ev.title}`
    : `Votre billet d'entrée – ${ev.title}`;

  let sent = 0;
  const results: Array<{ email: string; nom: string; status: string }> = [];

  for (const r of regs) {
    const prenom = firstName(r.nom_complet as string);
    try {
      let html: string;
      if (channel === "zoom") {
        html = zoomEmail({ prenom, titre: ev.title as string, dateStr, zoomLink: ev.zoom_link as string, infoUrl });
      } else {
        const qrData = `MBP-WEBINAIRE|${ev.id}|${r.id}|${r.nom_complet}|${r.email}|${r.mode_participation}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;
        const modeLabel = r.mode_participation === "mixte" ? "Présentiel + En ligne" : "Présentiel";
        html = qrEmail({
          prenom, titre: ev.title as string, dateStr, lieu: ev.lieu as string, qrUrl, infoUrl,
          nom: (r.nom_complet as string) || "", modeLabel,
        });
      }

      await sendBrevoEmail(apiKey, {
        to: [{ email: r.email as string, name: (r.nom_complet as string) || "" }],
        subject,
        htmlContent: html,
        replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
      });

      // Mise à jour des flags de suivi
      const patch = channel === "zoom"
        ? { zoom_sent: true }
        : { qr_sent: true, qr_generated: true };
      await db.from("webinar_registrations").update(patch).eq("id", r.id);

      sent++;
      results.push({ email: r.email as string, nom: (r.nom_complet as string) || "", status: "envoyé" });
    } catch (err) {
      results.push({ email: r.email as string, nom: (r.nom_complet as string) || "", status: `erreur : ${(err as Error).message}` });
    }
  }

  const status: "success" | "error" = sent === 0 ? "error" : "success";

  await db.from("email_logs").insert({
    subject,
    recipient_count: sent,
    status,
    error_message: results.filter(x => x.status.startsWith("erreur")).map(x => `${x.email}: ${x.status}`).join(" | ") || null,
    sent_by: user.email || null,
    sent_at: new Date().toISOString(),
  });

  return jsonResponse({ success: status === "success", channel, sent, total: regs.length, results });
});
