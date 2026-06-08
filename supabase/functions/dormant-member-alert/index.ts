// Automatisation 7 — Alerte membre dormant
// Déclenché le 1er de chaque mois à 8h UTC via cron
// Envoie un email au trésorier listant les membres sans cotisation depuis N mois

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
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";
import { renderTemplate } from "../_shared/template.ts";

const AUTOMATION_ID = "dormant_member_alert";

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextMonthlyRun());
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const inactivityMonths = (automation.config.inactivity_months as number) ?? 12;
    const alertEmail = (automation.config.alert_email as string) ?? "contact@mabellepromo.org";

    const today = new Date();
    const cutoffYear = today.getUTCFullYear() - Math.ceil(inactivityMonths / 12);

    // Membres validés qui n'ont pas de cotisation payée depuis cutoffYear
    const { data: membres, error: membresErr } = await db
      .from("members")
      .select("id, nom, email, created_at")
      .eq("status", "validated");

    if (membresErr) throw new Error(`Lecture membres: ${membresErr.message}`);

    // Cotisations payées depuis l'année de référence
    const { data: cotisations, error: cotisErr } = await db
      .from("cotisations")
      .select("member_id, annee")
      .gte("annee", cutoffYear)
      .eq("statut", "payé");

    if (cotisErr) throw new Error(`Lecture cotisations: ${cotisErr.message}`);

    const actifIds = new Set((cotisations ?? []).map((c: { member_id: string }) => c.member_id));

    const dormants = (membres ?? []).filter((m: { id: string; created_at: string }) => {
      if (actifIds.has(m.id)) return false;
      // Exclut les membres inscrits il y a moins de inactivityMonths mois
      const anciennete = (today.getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return anciennete >= inactivityMonths;
    });

    if (dormants.length === 0) {
      await updateAutomationStatus(db, AUTOMATION_ID, "success", undefined, nextMonthlyRun());
      return jsonResponse({ success: true, sent: 0, dormants: 0, message: "Aucun membre dormant" });
    }

    const targetKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-alert`;
    const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, "tresorier", targetKey);

    if (alreadySent) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextMonthlyRun());
      return jsonResponse({ skipped: true, reason: "alerte déjà envoyée ce mois" });
    }

    const lignes = dormants.map((m: { nom: string; email: string }) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">
          ${escHtml(m.nom || "—")}
        </td>
        <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">
          <a href="mailto:${escHtml(m.email)}" style="color:#14532d;">${escHtml(m.email)}</a>
        </td>
      </tr>`).join("");

    const content = `
      <div style="display:inline-block;padding:4px 14px;background:#dc2626;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
        ⚠️ Alerte mensuelle — Membres dormants
      </div>

      <h2 style="margin:0 0 16px;font-size:17px;color:#111827;">
        ${dormants.length} membre${dormants.length > 1 ? "s" : ""} sans cotisation depuis ${inactivityMonths} mois
      </h2>

      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
        Le rapport mensuel automatique identifie les membres actifs n'ayant enregistré aucun paiement
        de cotisation depuis au moins <strong>${inactivityMonths} mois</strong>.
        Ces membres pourraient nécessiter une relance personnalisée ou un suivi particulier.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Membre</th>
            <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Email</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>

      <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.7;">
          <strong>Action suggérée :</strong> Utilisez le module Cotisations du dashboard pour envoyer
          une relance groupée ou contactez ces membres individuellement.
        </p>
      </div>

      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Rapport généré automatiquement le ${new Date().toLocaleDateString("fr-FR")} — Module Automatisations MBP
      </p>`;

    const liste = dormants.map((m: { nom: string; email: string }) => `${m.nom || "—"} — ${m.email}`).join("\n");
    const { subject, htmlContent } = renderTemplate(
      automation.message_template,
      { nombre: String(dormants.length), mois: String(inactivityMonths), liste },
      {
        subject: `[MBP] ⚠️ ${dormants.length} membre${dormants.length > 1 ? "s" : ""} dormant${dormants.length > 1 ? "s" : ""} — Rapport mensuel`,
        htmlContent: wrapHtml(content),
      },
    );

    await sendBrevoEmail(apiKey, {
      to: [{ email: alertEmail, name: "Trésorier MBP" }],
      subject,
      htmlContent,
      replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    });

    await markAsSent(db, AUTOMATION_ID, "tresorier", targetKey);
    await updateAutomationStatus(db, AUTOMATION_ID, "success", undefined, nextMonthlyRun());

    return jsonResponse({ success: true, sent: 1, dormants: dormants.length });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextMonthlyRun());
    return jsonResponse({ success: false, error: message }, 500);
  }
});
