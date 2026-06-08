// Automatisation — Relance conventions / partenariats
// Déclenché chaque jour à 8h UTC via cron.
// Envoie un email Brevo au contact du partenaire avant l'échéance (J-30, J-15, J-7).
// Une seule relance par palier (dédoublonnage via automation_logs).

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

const AUTOMATION_ID = "convention_reminder";

interface Convention {
  id: string;
  partenaire_nom: string;
  objet: string | null;
  date_echeance: string | null;
  statut: string;
  contact_email: string | null;
}

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

    // Paliers de relance avant échéance (jours), triés croissants (palier le plus urgent en tête)
    const paliers: number[] = ((automation.config.days_before as number[]) ?? [30, 15, 7])
      .slice()
      .sort((a, b) => a - b);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Conventions encore actives, avec une échéance et un email de contact
    const { data: conventions, error: convErr } = await db
      .from("conventions")
      .select("id, partenaire_nom, objet, date_echeance, statut, contact_email")
      .neq("statut", "expiree")
      .not("date_echeance", "is", null)
      .not("contact_email", "is", null);

    if (convErr) throw new Error(`Lecture conventions: ${convErr.message}`);

    let sent = 0;
    const errors: string[] = [];

    for (const c of (conventions ?? []) as Convention[]) {
      const ech = new Date(`${c.date_echeance}T00:00:00Z`);
      const joursAvant = Math.ceil((ech.getTime() - today.getTime()) / 86400000);
      if (joursAvant < 0) continue; // déjà expirée, géré côté dashboard

      // Paliers atteints (échéance dans <= d jours). On envoie le palier le plus avancé
      // (plus petit d) non encore relancé, puis on s'arrête : une relance par exécution.
      const palierDu = paliers.find(d => joursAvant <= d);
      if (palierDu === undefined) continue;

      const targetKey = `J-${palierDu}`;
      if (await wasAlreadySent(db, AUTOMATION_ID, c.id, targetKey)) continue;

      const urgent = palierDu <= 7;
      const content = `
        <div style="display:inline-block;padding:4px 14px;background:${urgent ? "#dc2626" : "#f0a030"};color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          ${urgent ? "⚠️ Échéance imminente" : "Échéance à venir"} — J-${palierDu}
        </div>
        <h2 style="margin:0 0 16px;font-size:17px;color:#111827;border-bottom:2px solid #f0a030;padding-bottom:10px;">
          Renouvellement de convention — ${escHtml(c.partenaire_nom)}
        </h2>
        <p style="margin:0 0 20px;font-size:15px;color:#111827;">Bonjour,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
          La convention de partenariat${c.objet ? ` portant sur « ${escHtml(c.objet)} »` : ""}
          qui nous lie arrive à échéance le <strong>${formatDateFr(c.date_echeance!)}</strong>
          (dans ${joursAvant} jour${joursAvant > 1 ? "s" : ""}).
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">
          Nous serions heureux de poursuivre cette collaboration et restons à votre disposition
          pour échanger sur les modalités de son renouvellement.
        </p>
        <div style="background:#fffbeb;border-left:4px solid #f0a030;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#78350f;line-height:1.7;">
            Pour en discuter, écrivez-nous à
            <a href="mailto:contact@mabellepromo.org" style="color:#d97706;font-weight:600;">contact@mabellepromo.org</a>
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Bien cordialement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      const { subject, htmlContent } = renderTemplate(
        automation.message_template,
        {
          partenaire: c.partenaire_nom,
          objet: c.objet || "",
          date: formatDateFr(c.date_echeance!),
          jours: String(joursAvant),
          palier: String(palierDu),
        },
        { subject: `[MBP] Convention — échéance le ${formatDateFr(c.date_echeance!)} (J-${palierDu})`, htmlContent: wrapHtml(content) },
      );

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: c.contact_email!, name: c.partenaire_nom }],
          subject,
          htmlContent,
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        await markAsSent(db, AUTOMATION_ID, c.id, targetKey);
        sent++;
      } catch (err) {
        errors.push(`${c.contact_email}: ${(err as Error).message}`);
      }
      // NB : canal WhatsApp non câblé côté serveur (whatsapp-web.js nécessite un process dédié).
      // Le flag config.whatsapp_enabled reste prêt pour une intégration ultérieure.
    }

    await updateAutomationStatus(
      db,
      AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined,
      nextDailyRun(8)
    );

    return jsonResponse({ success: true, sent, total: (conventions ?? []).length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(8));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
