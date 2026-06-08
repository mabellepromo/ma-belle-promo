// Automatisation — Relance facture impayée
// Déclenché chaque matin à 9h UTC via cron.
// Relance par email le client d'une facture au statut « émise » dont
// l'échéance est dépassée. Une seule relance par facture.

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
import { renderTemplate } from "../_shared/template.ts";

const AUTOMATION_ID = "facture_reminder";

function fmtMontant(n: unknown): string {
  const v = Number(n);
  if (!isFinite(v)) return "—";
  return v.toLocaleString("fr-FR") + " FCFA";
}

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextDailyRun(9));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const { data: factures, error } = await db
      .from("factures")
      .select("id, numero, client_nom, client_email, objet, montant_ttc, date_echeance, statut")
      .eq("statut", "émise")
      .lt("date_echeance", todayStr)
      .not("client_email", "is", null);
    if (error) throw new Error(`Lecture factures: ${error.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const f of (factures ?? [])) {
      if (!f.client_email) continue;
      if (await wasAlreadySent(db, AUTOMATION_ID, f.id as string, "relance")) continue;

      const content = `
        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Rappel de paiement</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">
          Bonjour ${escHtml(f.client_nom || "")}, sauf erreur de notre part, la facture suivante
          reste à régler. Son échéance est dépassée.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:110px;">Facture n° :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(f.numero || "")}</td></tr>
            ${f.objet ? `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Objet :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;">${escHtml(f.objet)}</td></tr>` : ""}
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Montant TTC :</td>
                <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${fmtMontant(f.montant_ttc)}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Échéance :</td>
                <td style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600;">${f.date_echeance ? formatDateFr(f.date_echeance) : "—"}</td></tr>
          </table>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.<br><br>
          Cordialement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      const { subject, htmlContent } = renderTemplate(
        automation.message_template,
        {
          client: f.client_nom || "",
          numero: f.numero || "",
          objet: f.objet || "",
          montant: fmtMontant(f.montant_ttc),
          date: f.date_echeance ? formatDateFr(f.date_echeance) : "—",
        },
        { subject: `[MBP] Rappel de paiement — facture ${f.numero || ""}`, htmlContent: wrapHtml(content) },
      );

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: f.client_email, name: f.client_nom || "" }],
          subject,
          htmlContent,
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        await markAsSent(db, AUTOMATION_ID, f.id as string, "relance");
        sent++;
      } catch (err) {
        errors.push(`${f.client_email}: ${(err as Error).message}`);
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(9),
    );
    return jsonResponse({ success: true, sent, total: (factures ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(9));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
