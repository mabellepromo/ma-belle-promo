// Automatisation — Relance confirmation newsletter (double opt-in)
// Déclenché chaque matin à 10h UTC via cron.
// Relance les inscrits à la newsletter qui n'ont jamais confirmé leur
// inscription après N heures (config confirm_after_hours). Une seule relance.

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

const AUTOMATION_ID = "newsletter_confirm_reminder";

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextDailyRun(10));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const hours: number = (automation.config.confirm_after_hours as number) ?? 48;
    const cutoff = new Date();
    cutoff.setUTCHours(cutoff.getUTCHours() - hours);

    // Inscrits jamais confirmés, anciens d'au moins N heures, avec un token
    const { data: subs, error } = await db
      .from("newsletter_subscribers")
      .select("id, email, name, token, confirmed_at, subscribed_at")
      .is("confirmed_at", null)
      .not("token", "is", null)
      .lte("subscribed_at", cutoff.toISOString());
    if (error) throw new Error(`Lecture inscrits: ${error.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const sub of (subs ?? [])) {
      if (!sub.email || !sub.token) continue;
      if (await wasAlreadySent(db, AUTOMATION_ID, String(sub.id), "confirm_reminder")) continue;

      const confirmUrl = `https://www.mabellepromo.org/newsletter/confirmer?token=${encodeURIComponent(String(sub.token))}`;

      const content = `
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Confirmez votre inscription ✉️</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
          Bonjour ${escHtml(sub.name?.split(" ")[0] || "")}, vous vous êtes inscrit(e) à la newsletter de
          Ma Belle Promo, mais votre inscription n'a pas encore été confirmée. Un seul clic suffit :
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${confirmUrl}"
            style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Confirmer mon inscription →
          </a>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.<br><br>
          Cordialement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: sub.email, name: sub.name || "" }],
          subject: "[MBP] Confirmez votre inscription à la newsletter",
          htmlContent: wrapHtml(content),
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        await markAsSent(db, AUTOMATION_ID, String(sub.id), "confirm_reminder");
        sent++;
      } catch (err) {
        errors.push(`${sub.email}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(10),
    );
    return jsonResponse({ success: true, sent, total: (subs ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(10));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
