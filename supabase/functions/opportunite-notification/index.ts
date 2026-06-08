// Automatisation — Notification nouvelle opportunité
// Déclenché manuellement (trigger) quand le bureau publie une offre.
// Appelée depuis le dashboard avec { opportunite_id } dans le body.
// Envoie un email Brevo à tous les membres validés. Une seule notif par offre.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  jsonResponse,
  corsHeaders,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";
import { renderTemplate } from "../_shared/template.ts";

const AUTOMATION_ID = "opportunite_notification";

const TYPE_LABEL: Record<string, string> = {
  stage: "Stage", emploi: "Emploi", collaboration: "Collaboration", mission: "Mission",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped");
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const body = await req.json().catch(() => ({}));
    const { opportunite_id } = body as { opportunite_id?: string };
    if (!opportunite_id) throw new Error("opportunite_id manquant");

    // Une seule notification par offre (dédoublonnage au niveau de l'offre)
    if (await wasAlreadySent(db, AUTOMATION_ID, opportunite_id, "notified")) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped");
      return jsonResponse({ skipped: true, reason: "already notified" });
    }

    const { data: opp, error: oppErr } = await db
      .from("opportunites")
      .select("id, titre, type, structure, ville, pays, specialite, statut")
      .eq("id", opportunite_id)
      .maybeSingle();
    if (oppErr) throw new Error(`Lecture opportunité: ${oppErr.message}`);
    if (!opp || opp.statut !== "publiee") {
      return jsonResponse({ skipped: true, reason: "opportunité non publiée" });
    }

    const { data: membres, error: memErr } = await db
      .from("members")
      .select("email, nom")
      .eq("status", "validated")
      .not("email", "is", null);
    if (memErr) throw new Error(`Lecture membres: ${memErr.message}`);

    const destinataires = (membres ?? []).filter((m: { email: string }) => m.email);
    if (destinataires.length === 0) {
      return jsonResponse({ success: true, sent: 0, total: 0 });
    }

    const lieu = [opp.ville, opp.pays].filter(Boolean).join(", ");
    const content = `
      <div style="display:inline-block;padding:4px 14px;background:#f0a030;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
        Nouvelle opportunité — ${escHtml(TYPE_LABEL[opp.type] || opp.type)}
      </div>
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;border-bottom:2px solid #f0a030;padding-bottom:10px;">
        ${escHtml(opp.titre)}
      </h2>
      <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.8;">
        Une nouvelle opportunité vient d'être publiée sur l'espace membres de Ma Belle Promo${
          opp.structure ? ` par <strong>${escHtml(opp.structure)}</strong>` : ""
        }${lieu ? ` (${escHtml(lieu)})` : ""}${
          opp.specialite ? ` — spécialité : ${escHtml(opp.specialite)}` : ""
        }.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://www.mabellepromo.org/opportunites"
          style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
          Voir l'opportunité →
        </a>
      </div>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
        Fraternellement,<br>
        <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
        <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
      </p>`;

    const { subject, htmlContent } = renderTemplate(
      automation.message_template,
      {
        titre: opp.titre || "",
        type: TYPE_LABEL[opp.type] || opp.type || "",
        structure: opp.structure || "",
        lieu,
        specialite: opp.specialite || "",
      },
      { subject: `[MBP] Nouvelle opportunité — ${opp.titre}`, htmlContent: wrapHtml(content) },
    );
    let sent = 0;
    const errors: string[] = [];

    // Brevo accepte plusieurs destinataires par envoi ; on borne par lots de 50
    for (let i = 0; i < destinataires.length; i += 50) {
      const lot = destinataires.slice(i, i + 50);
      try {
        await sendBrevoEmail(apiKey, {
          to: lot.map((m: { email: string; nom: string }) => ({ email: m.email, name: m.nom || "" })),
          subject,
          htmlContent,
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
        });
        sent += lot.length;
      } catch (err) {
        errors.push((err as Error).message);
      }
    }

    if (sent > 0) await markAsSent(db, AUTOMATION_ID, opportunite_id, "notified");

    await updateAutomationStatus(
      db,
      AUTOMATION_ID,
      errors.length > 0 && sent === 0 ? "error" : "success",
      errors.length > 0 ? errors.join("; ") : undefined
    );

    return jsonResponse({ success: true, sent, total: destinataires.length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
