// Automatisation 2 — Relance cotisation
// Déclenché chaque jour à 9h UTC via cron
// Envoie un email Brevo aux membres n'ayant pas payé à J+15, J+30, J+60

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

const AUTOMATION_ID = "cotisation_reminder";

serve(async (_req) => {
  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextDailyRun(9));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const delaysDays: number[] = (automation.config.delays_days as number[]) ?? [15, 30, 60];
    const currentYear = new Date().getUTCFullYear();
    const anneeRelance = currentYear - 1; // On relance pour l'année précédente non payée
    const echeance = new Date(`${anneeRelance}-12-31T00:00:00Z`);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Membres actifs sans cotisation payée pour l'année concernée
    const { data: membres, error: membresErr } = await db
      .from("membres")
      .select("id, prenom, nom, email, statut")
      .eq("statut", "actif")
      .not("email", "is", null);

    if (membresErr) throw new Error(`Lecture membres: ${membresErr.message}`);

    const { data: cotisationsPagees, error: cotisErr } = await db
      .from("cotisations")
      .select("membre_id")
      .eq("annee", anneeRelance)
      .eq("statut", "paye");

    if (cotisErr) throw new Error(`Lecture cotisations: ${cotisErr.message}`);

    const payesIds = new Set((cotisationsPagees ?? []).map((c: { membre_id: string }) => c.membre_id));

    const membresEnRetard = (membres ?? []).filter((m: { id: string }) => !payesIds.has(m.id));

    let sent = 0;
    const errors: string[] = [];

    for (const m of membresEnRetard) {
      const joursDepuis = Math.floor((today.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));

      // Vérifie si on est à un des jalons de relance (±2 jours de tolérance)
      const jalon = delaysDays.find(d => Math.abs(joursDepuis - d) <= 1);
      if (!jalon) continue;

      const targetKey = `${anneeRelance}-J+${jalon}`;
      const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, m.id, targetKey);
      if (alreadySent) continue;

      const prenom = escHtml(m.prenom || m.nom?.split(" ")[0] || "cher(e) membre");
      const urgence = jalon >= 60 ? "⚠️ Dernier rappel" : jalon >= 30 ? "Rappel important" : "Rappel";

      const content = `
        <div style="display:inline-block;padding:4px 14px;background:${jalon >= 60 ? "#dc2626" : "#f59e0b"};color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
          ${urgence} — J+${jalon}
        </div>
        <h2 style="margin:0 0 16px;font-size:17px;color:#111827;border-bottom:2px solid #f59e0b;padding-bottom:10px;">
          Cotisation ${anneeRelance} — En attente de règlement
        </h2>
        <p style="margin:0 0 20px;font-size:15px;color:#111827;">Cher(e) ${prenom},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
          Nous vous informons que votre cotisation annuelle pour l'exercice <strong>${anneeRelance}</strong>
          est toujours en attente de règlement, ${joursDepuis} jours après l'échéance du 31 décembre ${anneeRelance}.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.mabellepromo.org/implications/cotisation"
            style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Payer ma cotisation en ligne →
          </a>
        </div>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#78350f;line-height:1.7;">
            Besoin d'aide ? Écrivez-nous à
            <a href="mailto:contact@mabellepromo.org" style="color:#d97706;font-weight:600;">contact@mabellepromo.org</a>
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Cordialement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: m.email, name: `${m.prenom || ""} ${m.nom || ""}`.trim() }],
          subject: `[MBP] ${urgence} — Cotisation ${anneeRelance}`,
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
      nextDailyRun(9)
    );

    return jsonResponse({ success: true, sent, total: membresEnRetard.length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextDailyRun(9));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
