// Automatisation — Relance sondage avant clôture
// Déclenché chaque matin à 8h UTC via cron.
// Pour chaque sondage actif dont la clôture (expires_at) approche
// (config days_before), envoie un rappel aux membres validés.
// Une seule relance par sondage.

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

const AUTOMATION_ID = "sondage_reminder";

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

    const daysBefore: number = (automation.config.days_before as number) ?? 3;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const limit = new Date(today);
    limit.setUTCDate(limit.getUTCDate() + daysBefore);
    const limitStr = limit.toISOString().slice(0, 10);

    // Sondages actifs dont la clôture tombe dans la fenêtre [aujourd'hui, +daysBefore]
    const { data: sondages, error } = await db
      .from("sondages")
      .select("id, titre, description, actif, expires_at")
      .eq("actif", true)
      .not("expires_at", "is", null)
      .gte("expires_at", todayStr)
      .lte("expires_at", limitStr);
    if (error) throw new Error(`Lecture sondages: ${error.message}`);

    if ((sondages ?? []).length === 0) {
      await updateAutomationStatus(db, AUTOMATION_ID, "success", undefined, nextDailyRun(8));
      return jsonResponse({ success: true, sent: 0, total: 0 });
    }

    const { data: membres, error: memErr } = await db
      .from("members")
      .select("email, nom")
      .eq("status", "validated")
      .not("email", "is", null);
    if (memErr) throw new Error(`Lecture membres: ${memErr.message}`);
    const destinataires = (membres ?? []).filter((m: { email: string }) => m.email);

    let sent = 0;
    const errors: string[] = [];

    for (const s of sondages!) {
      if (await wasAlreadySent(db, AUTOMATION_ID, s.id as string, "closing")) continue;

      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#7c3aed;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          Sondage — clôture le ${s.expires_at ? formatDateFr(s.expires_at) : "bientôt"}
        </div>
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(s.titre)}</h2>
        ${s.description ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">${escHtml(String(s.description)).replace(/\n/g, "<br>")}</p>` : ""}
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
          Si ce n'est pas déjà fait, votre avis compte : merci de prendre un instant pour répondre avant la clôture.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/sondage/${s.id}"
            style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Répondre au sondage →
          </a>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Merci de votre participation,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;
      const html = wrapHtml(content);

      let sondageSent = 0;
      for (let i = 0; i < destinataires.length; i += 50) {
        const lot = destinataires.slice(i, i + 50);
        try {
          await sendBrevoEmail(apiKey, {
            to: lot.map((m: { email: string; nom: string }) => ({ email: m.email, name: m.nom || "" })),
            subject: `[MBP] Sondage à compléter — ${s.titre}`,
            htmlContent: html,
            replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          });
          sondageSent += lot.length;
        } catch (err) {
          errors.push(`${s.id}: ${(err as Error).message}`);
        }
      }
      if (sondageSent > 0) {
        await markAsSent(db, AUTOMATION_ID, s.id as string, "closing");
        sent += sondageSent;
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8),
    );
    return jsonResponse({ success: true, sent, total: (sondages ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
