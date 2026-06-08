// Automatisation — Alerte fin de mandat
// Déclenché le 1er de chaque mois à 8h UTC via cron.
// Prévient le bureau (config alert_email) lorsqu'un mandat actif arrive à
// échéance dans moins de N jours (config days_before). Une alerte par mandat.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  nextMonthlyRun,
  jsonResponse,
  corsHeaders,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml, formatDateFr } from "../_shared/brevo.ts";

const AUTOMATION_ID = "mandat_expiry_alert";

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextMonthlyRun());
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const alertEmail: string = (automation.config.alert_email as string) || "contact@mabellepromo.org";
    const daysBefore: number = (automation.config.days_before as number) ?? 60;

    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const limit = new Date(today); limit.setUTCDate(limit.getUTCDate() + daysBefore);
    const limitStr = limit.toISOString().slice(0, 10);

    // Mandats actifs dont la fin tombe dans la fenêtre [aujourd'hui, +daysBefore]
    const { data: mandats, error } = await db
      .from("mandats")
      .select("id, poste, member_id, date_debut, date_fin, actif")
      .eq("actif", true)
      .not("date_fin", "is", null)
      .gte("date_fin", todayStr)
      .lte("date_fin", limitStr)
      .order("date_fin", { ascending: true });
    if (error) throw new Error(`Lecture mandats: ${error.message}`);

    // Noms des membres concernés
    const memberIds = [...new Set((mandats ?? []).map((m: { member_id: string }) => m.member_id).filter(Boolean))];
    const nomById = new Map<string, string>();
    if (memberIds.length > 0) {
      const { data: membres } = await db.from("members").select("id, nom").in("id", memberIds);
      for (const mb of (membres ?? [])) nomById.set(mb.id as string, (mb.nom as string) || "");
    }

    let sent = 0;
    const errors: string[] = [];

    for (const m of (mandats ?? [])) {
      // Clé incluant la date de fin : si le mandat est prolongé, une nouvelle alerte pourra partir
      const key = `expiry-${m.date_fin}`;
      if (await wasAlreadySent(db, AUTOMATION_ID, String(m.id), key)) continue;

      const nom = m.member_id ? (nomById.get(m.member_id as string) || "") : "";
      const content = `
        <div style="display:inline-block;padding:4px 14px;background:#b45309;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          Fin de mandat à venir
        </div>
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${escHtml(m.poste || "Mandat")}</h2>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            ${nom ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">Titulaire :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(nom)}</td></tr>` : ""}
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Poste :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(m.poste || "")}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Fin de mandat :</td>
                <td style="padding:4px 0;font-size:13px;color:#b45309;font-weight:600;">${m.date_fin ? formatDateFr(m.date_fin) : "—"}</td></tr>
          </table>
        </div>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">
          Pensez à anticiper le renouvellement (élection ou reconduction) avant l'échéance.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/dashboard"
            style="display:inline-block;padding:13px 28px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Ouvrir le dashboard →
          </a>
        </div>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: alertEmail, name: "Bureau MBP" }],
          subject: `[MBP] Fin de mandat à venir — ${m.poste || ""}${nom ? ` (${nom})` : ""}`,
          htmlContent: wrapHtml(content),
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        await markAsSent(db, AUTOMATION_ID, String(m.id), key);
        sent++;
      } catch (err) {
        errors.push(`mandat ${m.id}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextMonthlyRun(),
    );
    return jsonResponse({ success: true, sent, total: (mandats ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextMonthlyRun());
    return jsonResponse({ success: false, error: message }, 500);
  }
});
