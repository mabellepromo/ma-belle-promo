// Automatisation 6 — Reçu de paiement cotisation
// Déclenché manuellement (trigger) après enregistrement d'un paiement
// Body attendu : { cotisation_id } ou { member_id, annee }

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
import { sendBrevoEmail, wrapHtml, escHtml, formatDateFr } from "../_shared/brevo.ts";
import { renderTemplate } from "../_shared/template.ts";

const AUTOMATION_ID = "payment_receipt";

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
    const { cotisation_id, member_id, annee } = body as {
      cotisation_id?: string;
      member_id?: string;
      annee?: number;
    };

    // Récupère la cotisation selon le paramètre fourni
    let cotisationData: {
      id: string;
      member_id: string;
      annee: number;
      montant: number;
      date_paiement: string;
      statut: string;
      members: { nom: string; email: string };
    } | null = null;

    if (cotisation_id) {
      const { data, error } = await db
        .from("cotisations")
        .select("id, member_id, annee, montant, date_paiement, statut, members(nom, email)")
        .eq("id", cotisation_id)
        .maybeSingle();
      if (error) throw new Error(`Lecture cotisation: ${error.message}`);
      cotisationData = data;
    } else if (member_id && annee) {
      const { data, error } = await db
        .from("cotisations")
        .select("id, member_id, annee, montant, date_paiement, statut, members(nom, email)")
        .eq("member_id", member_id)
        .eq("annee", annee)
        .eq("statut", "payé")
        .maybeSingle();
      if (error) throw new Error(`Lecture cotisation membre: ${error.message}`);
      cotisationData = data;
    } else {
      return jsonResponse({ error: "cotisation_id ou (member_id + annee) requis" }, 400);
    }

    if (!cotisationData) {
      return jsonResponse({ error: "Cotisation introuvable" }, 404);
    }

    const membre = cotisationData.members;
    if (!membre?.email) {
      return jsonResponse({ error: "Email du membre manquant" }, 422);
    }

    const targetKey = `receipt-${cotisationData.annee}`;
    const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, cotisationData.member_id, targetKey);
    if (alreadySent) {
      return jsonResponse({ skipped: true, reason: "reçu déjà envoyé" });
    }

    const prenomRaw = membre.nom?.split(" ")[0] || membre.nom || "cher(e) membre";
    const prenom = escHtml(prenomRaw);
    const montant = cotisationData.montant
      ? new Intl.NumberFormat("fr-FR").format(cotisationData.montant) + " FCFA"
      : "selon barème";
    const datePaiement = cotisationData.date_paiement
      ? formatDateFr(cotisationData.date_paiement)
      : formatDateFr(new Date().toISOString());

    const content = `
      <div style="display:inline-block;padding:4px 14px;background:#16a34a;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
        ✅ Paiement confirmé
      </div>

      <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">
        Reçu de cotisation ${cotisationData.annee}
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:#374151;">Cher(e) ${prenom},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
        Nous avons bien enregistré votre paiement de cotisation pour l'exercice
        <strong>${cotisationData.annee}</strong>. Merci de votre contribution à la vie de notre association !
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
          Récapitulatif
        </p>
        <table cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;width:140px;">Membre :</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-weight:600;">
              ${escHtml(membre.nom || "")}
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Exercice :</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-weight:600;">${cotisationData.annee}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Montant :</td>
            <td style="padding:5px 0;font-size:15px;color:#14532d;font-weight:900;">${montant}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Date :</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;">${datePaiement}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Statut :</td>
            <td style="padding:5px 0;">
              <span style="display:inline-block;padding:2px 10px;background:#16a34a;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;">
                Payé ✓
              </span>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Conservez cet email comme preuve de paiement.
      </p>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.8;">
        Avec toute notre gratitude,<br>
        <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
        <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
      </p>`;

    const { subject, htmlContent } = renderTemplate(
      automation.message_template,
      { prenom: prenomRaw, nom: membre.nom || "", annee: String(cotisationData.annee), montant, date: datePaiement },
      { subject: `[MBP] Reçu de cotisation ${cotisationData.annee} — Merci !`, htmlContent: wrapHtml(content) },
    );

    await sendBrevoEmail(apiKey, {
      to: [{ email: membre.email, name: membre.nom || "" }],
      subject,
      htmlContent,
      replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    });

    await markAsSent(db, AUTOMATION_ID, cotisationData.member_id, targetKey);
    await updateAutomationStatus(db, AUTOMATION_ID, "success");

    return jsonResponse({ success: true, sent: 1 });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
