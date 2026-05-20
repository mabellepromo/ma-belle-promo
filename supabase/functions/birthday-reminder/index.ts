// Automatisation 1 — Anniversaires membres
// Déclenché chaque matin à 8h UTC via cron
// Envoie un email Brevo (et optionnellement un WhatsApp) aux membres dont c'est l'anniversaire

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
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";

const AUTOMATION_ID = "birthday_reminder";

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

    const today = new Date();
    const month = today.getUTCMonth() + 1;
    const day   = today.getUTCDate();
    const year  = today.getUTCFullYear();

    // Membres dont le mois et le jour de naissance correspondent à aujourd'hui
    const { data: membres, error } = await db
      .from("members")
      .select("id, nom, email, anniversaire")
      .not("anniversaire", "is", null)
      .not("email", "is", null)
      .eq("status", "validated");

    if (error) throw new Error(`Lecture membres: ${error.message}`);

    const anniversaires = (membres ?? []).filter((m: { anniversaire: string }) => {
      try {
        const d = new Date(m.anniversaire);
        return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
      } catch {
        return false;
      }
    });

    let sent = 0;
    const errors: string[] = [];

    for (const m of anniversaires) {
      const targetKey = `${year}-birthday`;
      const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, m.id, targetKey);
      if (alreadySent) continue;

      const prenom = escHtml(m.nom?.split(" ")[0] || m.nom || "cher(e) membre");

      const content = `
        <h2 style="margin:0 0 20px;font-size:22px;color:#111827;text-align:center;">
          🎂 Joyeux anniversaire, ${prenom} !
        </h2>
        <p style="font-size:15px;color:#374151;line-height:1.8;text-align:center;margin:0 0 24px;">
          Toute l'association <strong>Ma Belle Promo</strong> se joint à cette occasion
          pour vous souhaiter un excellent anniversaire et une belle année ${year} !
        </p>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">🎉</div>
          <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">
            FDD · Promotion 1994–2000
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;line-height:1.7;">
          Avec toute notre amitié et notre fraternité de promotionnaires.<br>
          <strong style="color:#111827;">Le Bureau Exécutif — Ma Belle Promo</strong>
        </p>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: m.email, name: m.nom || "" }],
          subject: `🎂 Joyeux anniversaire, ${m.nom?.split(" ")[0] || m.nom} ! — Ma Belle Promo`,
          htmlContent: wrapHtml(content),
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        await markAsSent(db, AUTOMATION_ID, m.id, targetKey);
        sent++;
      } catch (err) {
        errors.push(`${m.email}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db,
      AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8)
    );

    return jsonResponse({ success: true, sent, total: anniversaires.length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
