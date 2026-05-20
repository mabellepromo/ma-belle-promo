// Automatisation 5 — Convocation AG
// Déclenché chaque matin à 8h UTC via cron
// Envoie une convocation officielle X jours avant l'événement de type AG

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  nextDailyRun,
  jsonResponse,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml, formatDateFr } from "../_shared/brevo.ts";

const AUTOMATION_ID = "ag_convocation";

serve(async (_req) => {
  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextDailyRun(8));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const daysBefore = (automation.config.days_before as number) ?? 30;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setUTCDate(targetDate.getUTCDate() + daysBefore);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setUTCDate(targetDateEnd.getUTCDate() + 1);

    // Cherche les assemblées générales prévues exactement dans daysBefore jours
    const { data: assemblees, error: assErr } = await db
      .from("assemblees")
      .select("id, titre, date, lieu, ordre_du_jour, type")
      .gte("date", targetDate.toISOString())
      .lt("date", targetDateEnd.toISOString());

    if (assErr) throw new Error(`Lecture assemblées: ${assErr.message}`);

    // Membres validés avec email
    const { data: membres, error: membresErr } = await db
      .from("members")
      .select("id, nom, email")
      .eq("status", "validated")
      .not("email", "is", null);

    if (membresErr) throw new Error(`Lecture membres: ${membresErr.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const ag of (assemblees ?? [])) {
      const dateStr = formatDateFr(ag.date);
      const lieu = ag.lieu ? escHtml(ag.lieu) : "À préciser";
      const odj = ag.ordre_du_jour
        ? (ag.ordre_du_jour as string[]).map((p, i) => `<li style="margin:4px 0;">${i + 1}. ${escHtml(p)}</li>`).join("")
        : "<li>Ordre du jour à définir</li>";

      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#14532d;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          📋 Convocation officielle — J-${daysBefore}
        </div>

        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">
          ${escHtml(ag.titre || "Assemblée Générale")}
        </h2>
        <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">
          Association Ma Belle Promo — FDD Lomé 1994–2000
        </p>

        <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#6b7280;width:100px;">📅 Date :</td>
              <td style="padding:6px 0;font-size:13px;color:#111827;font-weight:700;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#6b7280;">📍 Lieu :</td>
              <td style="padding:6px 0;font-size:13px;color:#111827;">${lieu}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111827;">Ordre du jour :</p>
          <ol style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.8;">
            ${odj}
          </ol>
        </div>

        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
            <strong>Votre présence est vivement souhaitée.</strong><br>
            En cas d'empêchement, veuillez nous le signaler en répondant à cet email.
          </p>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Fraternellement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      for (const m of (membres ?? [])) {
        const targetKey = `${ag.id}-convoc`;
        const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, m.id, targetKey);
        if (alreadySent) continue;

        const prenom = m.nom?.split(" ")[0] || m.nom || "";

        try {
          await sendBrevoEmail(apiKey, {
            to: [{ email: m.email, name: m.nom || "" }],
            subject: `[MBP] Convocation — ${ag.titre || "Assemblée Générale"} — ${dateStr}`,
            htmlContent: wrapHtml(content.replace("Cher(e) membre", prenom ? `Cher(e) ${escHtml(prenom)}` : "Cher(e) membre")),
            replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          });
          await markAsSent(db, AUTOMATION_ID, m.id, targetKey);
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

    return jsonResponse({ success: true, sent, total_ag: (assemblees ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
