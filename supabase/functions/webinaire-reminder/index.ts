// Automatisation — Rappel webinaire
// Déclenché chaque matin à 8h UTC via cron.
// Envoie un email Brevo aux inscrits (status « registered ») à J-7 et J-1
// avant chaque webinaire, avec le lien de connexion ou le lieu selon le mode.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  nextDailyRun,
  jsonResponse,
  corsHeaders,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";
import { renderTemplate } from "../_shared/template.ts";

const AUTOMATION_ID = "webinaire_reminder";

// Date + heure en français à partir d'un timestamptz
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

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextDailyRun(8));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const daysBefore: number[] = (automation.config.days_before as number[]) ?? [7, 1];

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const maxBefore = Math.max(...daysBefore);
    const minDate = new Date(today);
    const maxDate = new Date(today);
    maxDate.setUTCDate(maxDate.getUTCDate() + maxBefore + 1);

    const { data: events, error: evErr } = await db
      .from("webinar_events")
      .select("id, title, date_time, format, lieu, plateforme, zoom_link, status")
      .gte("date_time", minDate.toISOString())
      .lt("date_time", maxDate.toISOString());
    if (evErr) throw new Error(`Lecture webinaires: ${evErr.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const ev of (events ?? [])) {
      if (ev.status === "cancelled" || ev.status === "draft") continue;

      const evDay = new Date(ev.date_time);
      evDay.setUTCHours(0, 0, 0, 0);
      const joursRestants = Math.round((evDay.getTime() - today.getTime()) / 86400000);
      if (!daysBefore.includes(joursRestants)) continue;

      const targetKey = `${ev.id}-J-${joursRestants}`;
      const badge = joursRestants === 1 ? "⏰ Demain !" : `Dans ${joursRestants} jours`;
      const dateStr = formatDateTimeFr(ev.date_time);

      const { data: regs, error: regErr } = await db
        .from("webinar_registrations")
        .select("id, email, nom_complet, mode_participation, status")
        .eq("event_id", ev.id)
        .eq("status", "registered")
        .not("email", "is", null);
      if (regErr) { errors.push(`regs ${ev.id}: ${regErr.message}`); continue; }

      for (const r of (regs ?? [])) {
        if (await wasAlreadySent(db, AUTOMATION_ID, r.id, targetKey)) continue;

        const enLigne = r.mode_participation === "en_ligne" || r.mode_participation === "en ligne";
        const presentiel = r.mode_participation === "presentiel" || r.mode_participation === "présentiel";

        const accesBloc = enLigne && ev.zoom_link
          ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:90px;">🔗 Connexion :</td>
               <td style="padding:4px 0;font-size:13px;"><a href="${escHtml(ev.zoom_link)}" style="color:#16a34a;font-weight:600;">Rejoindre en ligne</a></td></tr>`
          : presentiel && ev.lieu
          ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:90px;">📍 Lieu :</td>
               <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(ev.lieu)}</td></tr>`
          : ev.lieu || ev.zoom_link
          ? `${ev.lieu ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:90px;">📍 Lieu :</td><td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(ev.lieu)}</td></tr>` : ""}
             ${ev.zoom_link ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">🔗 Connexion :</td><td style="padding:4px 0;font-size:13px;"><a href="${escHtml(ev.zoom_link)}" style="color:#16a34a;font-weight:600;">Rejoindre en ligne</a></td></tr>` : ""}`
          : "";

        const content = `
          <div style="display:inline-block;padding:4px 14px;background:#14532d;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
            ${badge}
          </div>
          <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(ev.title)}</h2>
          <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:90px;">📅 Date :</td>
                  <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${dateStr}</td></tr>
              ${accesBloc}
            </table>
          </div>
          <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">
            Bonjour ${escHtml(r.nom_complet?.split(" ")[0] || "")}, nous vous rappelons votre inscription à ce webinaire.
            Au plaisir de vous y retrouver !
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
            Cordialement,<br>
            <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
            <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
          </p>`;

        const { subject, htmlContent } = renderTemplate(
          automation.message_template,
          {
            titre: ev.title || "",
            date: dateStr,
            badge,
            prenom: r.nom_complet?.split(" ")[0] || "",
            jours: String(joursRestants),
            lien: ev.zoom_link || "",
            lieu: ev.lieu || "",
          },
          { subject: `[MBP] ${badge} — ${ev.title}`, htmlContent: wrapHtml(content) },
        );

        try {
          await sendBrevoEmail(apiKey, {
            to: [{ email: r.email, name: r.nom_complet || "" }],
            subject,
            htmlContent,
            replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          });
          await markAsSent(db, AUTOMATION_ID, r.id, targetKey);
          sent++;
        } catch (err) {
          errors.push(`${r.email}: ${(err as Error).message}`);
        }
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8),
    );
    return jsonResponse({ success: true, sent, total_events: (events ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
