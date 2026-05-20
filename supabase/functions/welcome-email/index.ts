// Automatisation 3 — Mail de bienvenue
// Déclenché manuellement (trigger) après validation d'un nouveau membre
// Peut être appelé depuis le dashboard avec { membre_id } dans le body

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  jsonResponse,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml, escHtml } from "../_shared/brevo.ts";

const AUTOMATION_ID = "welcome_email";

serve(async (req) => {
  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped");
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    let membres: Array<{ id: string; prenom: string; nom: string; email: string }> = [];

    const body = await req.json().catch(() => ({}));
    const { membre_id } = body as { membre_id?: string };

    if (membre_id) {
      const { data, error } = await db
        .from("membres")
        .select("id, prenom, nom, email")
        .eq("id", membre_id)
        .maybeSingle();
      if (error) throw new Error(`Lecture membre: ${error.message}`);
      if (data) membres = [data];
    } else {
      // Mode test : membres validés récemment (24h) sans bienvenue envoyé
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - 1);
      const { data, error } = await db
        .from("membres")
        .select("id, prenom, nom, email")
        .eq("statut", "actif")
        .gte("created_at", since.toISOString())
        .not("email", "is", null);
      if (error) throw new Error(`Lecture membres récents: ${error.message}`);
      membres = data ?? [];
    }

    let sent = 0;
    const errors: string[] = [];

    for (const m of membres) {
      const targetKey = "welcome";
      const alreadySent = await wasAlreadySent(db, AUTOMATION_ID, m.id, targetKey);
      if (alreadySent) continue;

      const prenom = escHtml(m.prenom || m.nom?.split(" ")[0] || "cher(e) nouveau membre");

      const content = `
        <h2 style="margin:0 0 20px;font-size:20px;color:#111827;">
          Bienvenue parmi nous, ${prenom} ! 🎓
        </h2>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
          C'est avec une grande joie que l'association <strong>Ma Belle Promo (MBP)</strong> vous accueille
          officiellement en tant que nouveau membre. Votre dossier d'adhésion a bien été validé.
        </p>

        <div style="background:#f0fdf4;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#14532d;">Vos avantages en tant que membre :</p>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:2;">
            <li>Accès à l'espace membres privé sur <a href="https://www.mabellepromo.org" style="color:#16a34a;">mabellepromo.org</a></li>
            <li>Invitation aux événements et assemblées générales</li>
            <li>Accès aux ressources, documents et archives de la promotion</li>
            <li>Réseau des diplômés FDD Lomé 1994–2000</li>
          </ul>
        </div>

        <div style="text-align:center;margin:28px 0;">
          <a href="https://www.mabellepromo.org"
            style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
            Accéder à l'espace membres →
          </a>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
          Pour toute question, n'hésitez pas à nous écrire à
          <a href="mailto:contact@mabellepromo.org" style="color:#16a34a;">contact@mabellepromo.org</a>.<br><br>
          Fraternellement,<br>
          <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
          <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
        </p>`;

      try {
        await sendBrevoEmail(apiKey, {
          to: [{ email: m.email, name: `${m.prenom || ""} ${m.nom || ""}`.trim() }],
          subject: "Bienvenue dans l'association Ma Belle Promo ! 🎓",
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
      errors.length > 0 ? errors.join("; ") : undefined
    );

    return jsonResponse({ success: true, sent, total: membres.length, errors });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
