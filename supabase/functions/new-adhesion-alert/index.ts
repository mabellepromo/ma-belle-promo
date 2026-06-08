// Automatisation — Alerte nouvelle demande d'adhésion
// Déclenché chaque heure via cron (scan côté serveur).
// Prévient le bureau (config alert_email) pour chaque membre au statut
// « pending » récemment soumis et non encore signalé. Une alerte par membre.

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

const AUTOMATION_ID = "new_adhesion_alert";

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
    const lookbackDays: number = (automation.config.lookback_days as number) ?? 14;

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - lookbackDays);

    // Demandes d'adhésion en attente, récentes, non encore signalées.
    // On filtre côté serveur sur submitted_at OU created_at.
    const { data: membres, error } = await db
      .from("members")
      .select("id, nom, email, profession, ville, pays, telephone, status, submitted_at, created_at")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });
    if (error) throw new Error(`Lecture demandes: ${error.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const m of (membres ?? [])) {
      const ref = (m.submitted_at as string) || (m.created_at as string) || null;
      if (ref && new Date(ref) < since) continue; // trop ancienne, on ignore
      if (await wasAlreadySent(db, AUTOMATION_ID, String(m.id), "alert")) continue;

      const lieu = [m.ville, m.pays].filter(Boolean).join(", ");
      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#0d9488;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          Nouvelle demande d'adhésion
        </div>
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(m.nom || "")}</h2>
        <div style="background:#f0fdfa;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table cellpadding="0" cellspacing="0">
            ${m.email ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">Email :</td>
                <td style="padding:4px 0;font-size:13px;"><a href="mailto:${escHtml(m.email)}" style="color:#16a34a;">${escHtml(m.email)}</a></td></tr>` : ""}
            ${m.telephone ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Téléphone :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(m.telephone)}</td></tr>` : ""}
            ${m.profession ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Profession :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(m.profession)}</td></tr>` : ""}
            ${lieu ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Lieu :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(lieu)}</td></tr>` : ""}
          </table>
        </div>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">
          Une nouvelle demande d'adhésion attend validation dans le dashboard.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/dashboard"
            style="display:inline-block;padding:13px 28px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Valider la demande →
          </a>
        </div>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: alertEmail, name: "Bureau MBP" }],
          subject: `[MBP] Nouvelle adhésion à valider — ${m.nom || ""}`,
          htmlContent: wrapHtml(content),
          replyTo: m.email ? { email: m.email, name: m.nom || "" } : undefined,
        });
        await markAsSent(db, AUTOMATION_ID, String(m.id), "alert");
        sent++;
      } catch (err) {
        errors.push(`membre ${m.id}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextHourlyRun(),
    );
    return jsonResponse({ success: true, sent, total: (membres ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextHourlyRun());
    return jsonResponse({ success: false, error: message }, 500);
  }
});
