// Automatisation — Alerte nouveau message de contact
// Déclenché chaque heure via cron (scan côté serveur).
// Prévient le bureau (config alert_email) pour chaque message de contact
// reçu et non encore signalé. Une seule alerte par message.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  nextHourlyRun,
  jsonResponse,
  corsHeaders,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";

const AUTOMATION_ID = "new_contact_alert";

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextHourlyRun());
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const alertEmail: string = (automation.config.alert_email as string) || "contact@mabellepromo.org";
    const lookbackDays: number = (automation.config.lookback_days as number) ?? 3;

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - lookbackDays);

    // Messages récents non encore alertés (on borne dans le temps pour ne pas
    // ressortir tout l'historique au premier passage)
    const { data: messages, error } = await db
      .from("messages")
      .select("id, name, email, sujet, message, created_at, received_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Lecture messages: ${error.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const m of (messages ?? [])) {
      const idStr = String(m.id);
      if (await wasAlreadySent(db, AUTOMATION_ID, idStr, "alert")) continue;

      const extrait = String(m.message || "").slice(0, 500);
      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#2563eb;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          Nouveau message de contact
        </div>
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(m.sujet || "(sans sujet)")}</h2>
        <div style="background:#eff6ff;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:70px;">De :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(m.name || "")}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Email :</td>
                <td style="padding:4px 0;font-size:13px;"><a href="mailto:${escHtml(m.email || "")}" style="color:#16a34a;">${escHtml(m.email || "")}</a></td></tr>
          </table>
        </div>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;">${escHtml(extrait).replace(/\n/g, "<br>")}</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/dashboard"
            style="display:inline-block;padding:13px 28px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Ouvrir le dashboard →
          </a>
        </div>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: alertEmail, name: "Bureau MBP" }],
          subject: `[MBP] Nouveau contact — ${m.sujet || m.name || "message"}`,
          htmlContent: wrapHtml(content),
          replyTo: m.email ? { email: m.email, name: m.name || "" } : undefined,
        });
        await markAsSent(db, AUTOMATION_ID, idStr, "alert");
        sent++;
      } catch (err) {
        errors.push(`msg ${idStr}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextHourlyRun(),
    );
    return jsonResponse({ success: true, sent, total: (messages ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextHourlyRun());
    return jsonResponse({ success: false, error: message }, 500);
  }
});
