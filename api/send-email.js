// Vercel serverless function — proxy Brevo API
// La clé API reste côté serveur (jamais exposée au navigateur)

const SENDER = { name: "Ma Belle Promo", email: "contact@mabellepromo.org" };
const CONTACT_TO = [{ email: "contact@mabellepromo.org", name: "Ma Belle Promo" }];

function wrapHtml(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ma Belle Promo</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- En-tête verte -->
        <tr>
          <td style="background:linear-gradient(135deg,#15803d 0%,#16a34a 60%,#22c55e 100%);padding:28px 32px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
                    width="52" height="52" alt="Ma Belle Promo"
                    style="border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:block;float:left;margin-right:16px;" />
                  <div style="overflow:hidden;">
                    <div style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:0.3px;">Ma Belle Promo</div>
                    <div style="color:rgba(255,255,255,0.75);font-size:12px;margin-top:3px;">FDD · Université de Lomé · Promotion 1994–2000</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contenu -->
        <tr>
          <td style="padding:32px 32px 24px;">
            ${content}
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
              Ma Belle Promo · 12 BP 335 Baguida, Lomé, Togo<br>
              <a href="mailto:contact@mabellepromo.org" style="color:#16a34a;text-decoration:none;">contact@mabellepromo.org</a>
              &nbsp;·&nbsp;
              <a href="https://www.mabellepromo.org" style="color:#16a34a;text-decoration:none;">www.mabellepromo.org</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildContactPayload({ name, email, sujet, message, sent_at }) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:17px;color:#111827;border-bottom:2px solid #16a34a;padding-bottom:10px;">
      Nouveau message de contact
    </h2>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">De&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${name}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Email&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;">
          <a href="mailto:${email}" style="color:#16a34a;text-decoration:none;">${email}</a>
        </td>
      </tr>
      ${sujet ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Sujet&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#111827;">${sujet}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Reçu le&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">${sent_at || new Date().toLocaleString("fr-FR")}</td>
      </tr>
    </table>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;">
      <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      Répondez directement à cet email pour contacter <strong>${name}</strong>.
    </p>`;

  return {
    sender: SENDER,
    to: CONTACT_TO,
    replyTo: { email, name },
    subject: `[Contact] ${sujet || "Nouveau message"} — ${name}`,
    htmlContent: wrapHtml(content),
  };
}

function buildReplyPayload({ to_email, to_name, sujet, reply_message, date, sender_name, sender_poste }) {
  const greeting = to_name ? `Bonjour ${to_name},` : "Bonjour,";
  const body = reply_message?.replace(/\n/g, "<br>") || "";
  const content = `
    <p style="margin:0 0 20px;font-size:15px;color:#111827;">${greeting}</p>
    <div style="font-size:14px;color:#374151;line-height:1.8;margin-bottom:28px;">${body}</div>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:8px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">${sender_name || "Le Bureau Exécutif"}</p>
      ${sender_poste ? `<p style="margin:3px 0 0;font-size:12px;color:#6b7280;">${sender_poste}</p>` : ""}
      <p style="margin:4px 0 0;font-size:12px;color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</p>
      <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">contact@mabellepromo.org</p>
      ${date ? `<p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">Le ${date}</p>` : ""}
    </div>`;

  return {
    sender: SENDER,
    to: [{ email: to_email, name: to_name || to_email }],
    replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    subject: sujet,
    htmlContent: wrapHtml(content),
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: "BREVO_API_KEY not configured" });
  }

  const { type, ...data } = req.body;

  if (type !== "contact" && type !== "reply") {
    return res.status(400).json({ error: "Invalid type. Use 'contact' or 'reply'." });
  }

  try {
    const payload = type === "contact"
      ? buildContactPayload(data)
      : buildReplyPayload(data);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Brevo error [${type}]:`, JSON.stringify(result));
      return res.status(502).json({ error: result });
    }

    return res.status(200).json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error(`send-email error [${type}]:`, err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}
