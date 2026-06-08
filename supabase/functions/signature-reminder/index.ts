// Automatisation — Relance signature en attente
// Déclenché chaque matin à 8h UTC via cron.
// Relance par email les signataires d'un document au statut « envoye »
// resté non signé depuis plus de N jours (config days_after). Une seule
// relance par signataire et par document.

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

const AUTOMATION_ID = "signature_reminder";

interface Signataire { name?: string; email?: string }

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

    const daysAfter: number = (automation.config.days_after as number) ?? 5;
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - daysAfter);

    const { data: docs, error } = await db
      .from("signatures")
      .select("id, document_titre, type, signataires, statut, source_url, created_at")
      .eq("statut", "envoye")
      .lte("created_at", cutoff.toISOString());
    if (error) throw new Error(`Lecture signatures: ${error.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const doc of (docs ?? [])) {
      const signataires = (doc.signataires as Signataire[] | null) ?? [];
      for (const s of signataires) {
        if (!s.email) continue;
        if (await wasAlreadySent(db, AUTOMATION_ID, doc.id as string, s.email)) continue;

        const lien = doc.source_url
          ? `<div style="text-align:center;margin:24px 0;">
               <a href="${escHtml(doc.source_url)}" style="display:inline-block;padding:13px 28px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
                 Consulter et signer le document →
               </a></div>`
          : "";

        const content = `
          <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Signature en attente</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.8;">
            Bonjour ${escHtml(s.name?.split(" ")[0] || "")}, le document suivant attend votre signature :
          </p>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:8px;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#92400e;">${escHtml(doc.document_titre)}</p>
            ${doc.type ? `<p style="margin:6px 0 0;font-size:12px;color:#b45309;">${escHtml(doc.type)}</p>` : ""}
          </div>
          ${lien}
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
            Merci de procéder à la signature dès que possible.<br><br>
            Cordialement,<br>
            <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
            <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
          </p>`;

        try {
          await sendBrevoEmail(apiKey, {
            to: [{ email: s.email, name: s.name || "" }],
            subject: `[MBP] Rappel — signature en attente : ${doc.document_titre}`,
            htmlContent: wrapHtml(content),
            replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          });
          await markAsSent(db, AUTOMATION_ID, doc.id as string, s.email);
          sent++;
        } catch (err) {
          errors.push(`${s.email}: ${(err as Error).message}`);
        }
      }
    }

    await updateAutomationStatus(
      db, AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8),
    );
    return jsonResponse({ success: true, sent, total_docs: (docs ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
