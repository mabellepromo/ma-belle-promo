// Automatisation — Récapitulatif hebdomadaire au bureau
// Déclenché chaque lundi à 7h UTC via cron.
// Envoie au bureau (config alert_email) une synthèse de la semaine :
// adhésions en attente, messages non lus, nouvelles opportunités, nouveaux
// inscrits newsletter, cotisations encaissées, webinaires et assemblées à venir.
// Un seul envoi par semaine.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getServiceClient,
  getAutomation,
  updateAutomationStatus,
  wasAlreadySent,
  markAsSent,
  nextWeeklyRun,
  jsonResponse,
  corsHeaders,
} from "../_shared/db.ts";
import { sendBrevoEmail, wrapHtml } from "../_shared/brevo.ts";

const AUTOMATION_ID = "weekly_digest";

// Identifiant de semaine ISO (année-Wsemaine), pour le dédoublonnage
function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function countSince(
  db: ReturnType<typeof getServiceClient>,
  table: string, column: string, sinceIso: string,
): Promise<number> {
  const { count } = await db.from(table).select("*", { count: "exact", head: true })
    .gte(column, sinceIso);
  return count ?? 0;
}

serve(async (_req) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = getServiceClient();

  try {
    const automation = await getAutomation(db, AUTOMATION_ID);
    if (!automation || !automation.enabled) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextWeeklyRun(1, 7));
      return jsonResponse({ skipped: true, reason: "automation disabled" });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY non configurée");

    const alertEmail: string = (automation.config.alert_email as string) || "contact@mabellepromo.org";

    const now = new Date();
    const weekKey = isoWeekKey(now);
    if (await wasAlreadySent(db, AUTOMATION_ID, weekKey, "digest")) {
      await updateAutomationStatus(db, AUTOMATION_ID, "skipped", undefined, nextWeeklyRun(1, 7));
      return jsonResponse({ skipped: true, reason: "déjà envoyé cette semaine" });
    }

    const weekAgo = new Date(now); weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    const weekAgoIso = weekAgo.toISOString();
    const todayStr = new Date(now); todayStr.setUTCHours(0, 0, 0, 0);
    const in7 = new Date(todayStr); in7.setUTCDate(in7.getUTCDate() + 7);

    // Compteurs « état courant »
    const { count: pendingMembers } = await db.from("members")
      .select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: unreadMessages } = await db.from("messages")
      .select("*", { count: "exact", head: true }).eq("read", false);

    // Compteurs « 7 derniers jours »
    const newOpportunites = await countSince(db, "opportunites", "created_at", weekAgoIso);
    const newSubscribers  = await countSince(db, "newsletter_subscribers", "subscribed_at", weekAgoIso);

    // Cotisations encaissées (date_paiement dans les 7 jours)
    const { data: cotis } = await db.from("cotisations")
      .select("montant, date_paiement")
      .gte("date_paiement", weekAgo.toISOString().slice(0, 10))
      .not("date_paiement", "is", null);
    const cotisCount = (cotis ?? []).length;
    const cotisSum = (cotis ?? []).reduce((s: number, c: { montant: number }) => s + (Number(c.montant) || 0), 0);

    // Webinaires à venir (7 prochains jours)
    const { data: webinaires } = await db.from("webinar_events")
      .select("title, date_time")
      .gte("date_time", todayStr.toISOString())
      .lt("date_time", in7.toISOString())
      .order("date_time", { ascending: true });

    // Assemblées à venir (7 prochains jours)
    const { data: assemblees } = await db.from("assemblees")
      .select("titre, date")
      .gte("date", todayStr.toISOString().slice(0, 10))
      .lt("date", in7.toISOString().slice(0, 10))
      .order("date", { ascending: true });

    const fmt = (iso: string, withTime: boolean) => {
      try {
        return new Date(iso).toLocaleString("fr-FR", withTime
          ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome" }
          : { day: "2-digit", month: "short", timeZone: "Africa/Lome" });
      } catch { return iso; }
    };

    const row = (label: string, value: string, color = "#111827") =>
      `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:15px;font-weight:700;color:${color};text-align:right;">${value}</td>
      </tr>`;

    const listEvents = (items: Array<{ name: string; when: string }>) =>
      items.length === 0 ? "" :
      `<ul style="margin:4px 0 0;padding-left:18px;font-size:13px;color:#374151;line-height:1.9;">
        ${items.map(e => `<li>${e.when} — ${e.name}</li>`).join("")}
      </ul>`;

    const webItems = (webinaires ?? []).map((w: { title: string; date_time: string }) =>
      ({ name: w.title, when: fmt(w.date_time, true) }));
    const agItems = (assemblees ?? []).map((a: { titre: string; date: string }) =>
      ({ name: a.titre, when: fmt(a.date, false) }));

    const content = `
      <div style="display:inline-block;padding:4px 14px;background:#14532d;color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
        Récapitulatif de la semaine
      </div>
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Bonjour le Bureau 👋</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
        Voici la synthèse des 7 derniers jours sur Ma Belle Promo.
      </p>

      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        ${row("📝 Adhésions en attente de validation", String(pendingMembers ?? 0), (pendingMembers ?? 0) > 0 ? "#d97706" : "#111827")}
        ${row("✉️ Messages de contact non lus", String(unreadMessages ?? 0), (unreadMessages ?? 0) > 0 ? "#d97706" : "#111827")}
        ${row("💼 Nouvelles opportunités publiées", String(newOpportunites))}
        ${row("📰 Nouveaux inscrits newsletter", String(newSubscribers))}
        ${row("💳 Cotisations encaissées", `${cotisCount} (${cotisSum.toLocaleString("fr-FR")} FCFA)`, "#16a34a")}
      </table>

      ${webItems.length > 0 ? `<h3 style="margin:0 0 4px;font-size:15px;color:#111827;">🎥 Webinaires à venir</h3>${listEvents(webItems)}` : ""}
      ${agItems.length > 0 ? `<h3 style="margin:16px 0 4px;font-size:15px;color:#111827;">🏛️ Assemblées à venir</h3>${listEvents(agItems)}` : ""}

      <div style="text-align:center;margin:28px 0 8px;">
        <a href="https://www.mabellepromo.org/dashboard"
          style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;">
          Ouvrir le dashboard →
        </a>
      </div>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280;line-height:1.8;">
        Bonne semaine,<br>
        <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
      </p>`;

    await sendBrevoEmail(apiKey, {
      to: [{ email: alertEmail, name: "Bureau MBP" }],
      subject: `[MBP] Récapitulatif hebdomadaire — ${weekKey}`,
      htmlContent: wrapHtml(content),
      replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    });
    await markAsSent(db, AUTOMATION_ID, weekKey, "digest");

    await updateAutomationStatus(db, AUTOMATION_ID, "success", undefined, nextWeeklyRun(1, 7));
    return jsonResponse({ success: true, sent: 1, week: weekKey });

  } catch (err) {
    const message = (err as Error).message;
    await updateAutomationStatus(db, AUTOMATION_ID, "error", message, nextWeeklyRun(1, 7));
    return jsonResponse({ success: false, error: message }, 500);
  }
});
