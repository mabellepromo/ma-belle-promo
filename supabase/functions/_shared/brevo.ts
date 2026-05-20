// Utilitaires partagés pour l'envoi d'emails via Brevo

const SENDER = {
  name: "Association Ma Belle Promo (MBP)",
  email: "contact@mabellepromo.org",
};

export function escHtml(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function wrapHtml(content: string): string {
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

        <tr>
          <td style="background:#14532d;padding:28px 32px;text-align:center;">
            <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              width="56" height="56" alt="MBP"
              style="border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:block;margin:0 auto 12px;" />
            <div style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:0.3px;">Association Ma Belle Promo (MBP)</div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px;">FDD · Université de Lomé · Promotion 1994–2000</div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 32px 24px;">${content}</td>
        </tr>

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

export interface EmailPayload {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendBrevoEmail(apiKey: string, payload: EmailPayload): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ sender: SENDER, ...payload }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Brevo HTTP ${response.status}`);
  }
}

// Formate une date en français lisible
export function formatDateFr(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
