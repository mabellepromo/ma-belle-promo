// Automatisation 4 — Rappel événement
// Déclenché chaque matin à 8h UTC via cron
// Envoie un email Brevo aux membres à J-7 et J-1 avant chaque événement publié

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
import { sendBrevoEmail, wrapHtml, escHtml, formatDateFr } from "../_shared/brevo.ts";

const AUTOMATION_ID = "event_reminder";

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

    // Dates cibles : événements qui auront lieu dans exactement daysBefore[i] jours
    const targetDates = daysBefore.map(d => {
      const t = new Date(today);
      t.setUTCDate(t.getUTCDate() + d);
      return { jours: d, date: t };
    });

    // Récupère les événements publiés dans la fenêtre de rappel
    const minDate = targetDates[targetDates.length - 1].date;
    const maxDate = targetDates[0].date;
    maxDate.setUTCDate(maxDate.getUTCDate() + 1);

    const { data: evenements, error: evErr } = await db
      .from("evenements")
      .select("id, titre, date_debut, lieu, description, statut")
      .eq("statut", "publie")
      .gte("date_debut", minDate.toISOString())
      .lt("date_debut", maxDate.toISOString());

    if (evErr) throw new Error(`Lecture événements: ${evErr.message}`);

    // Membres validés avec email
    const { data: membres, error: membresErr } = await db
      .from("members")
      .select("id, nom, email")
      .eq("status", "validated")
      .not("email", "is", null);

    if (membresErr) throw new Error(`Lecture membres: ${membresErr.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const ev of (evenements ?? [])) {
      const evDate = new Date(ev.date_debut);
      evDate.setUTCHours(0, 0, 0, 0);
      const joursRestants = Math.round((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (!daysBefore.includes(joursRestants)) continue;

      const targetKey = `J-${joursRestants}`;
      const dateStr = formatDateFr(ev.date_debut);
      const lieu = ev.lieu ? escHtml(ev.lieu) : null;
      const badge = joursRestants === 1 ? "⏰ Demain !" : `Dans ${joursRestants} jours`;

      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#14532d;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          ${badge}
        </div>
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(ev.titre)}</h2>

        <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#6b7280;width:80px;">📅 Date :</td>
              <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${dateStr}</td>
            </tr>
            ${lieu ? `<tr>
              <td style="padding:4px 0;font-size:13px;color:#6b7280;">📍 Lieu :</td>
              <td style="padding:4px 0;font-size:13px;color:#111827;">${lieu}</td>
            </tr>` : ""}
          </table>
        </div>

        ${ev.description ? `
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">
          ${escHtml(String(ev.description)).replace(/\n/g, "<br>")}
        </p>` : ""}

        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/activites/evenements"
            style="display:inline-block;padding:13px 28px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Voir tous les événements →
          </a>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Cordialement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      for (const m of (membres ?? [])) {
        const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, m.id, `${ev.id}-${targetKey}`);
        if (alreadySent) continue;

        try {
          await sendBrevoEmail(apiKey, {
            to: [{ email: m.email, name: m.nom || "" }],
            subject: `[MBP] ${badge} — ${ev.titre}`,
            htmlContent: wrapHtml(content),
            replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          });
          await markAsSent(db, AUTOMATION_ID, m.id, `${ev.id}-${targetKey}`);
          sent++;
        } catch (err) {
          errors.push(`${m.email}: ${(err as Error).message}`);
        }
      }
    }

    await updateAutomationStatus(
      db,
      AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8)
    );

    return jsonResponse({ success: true, sent, total_events: (evenements ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
