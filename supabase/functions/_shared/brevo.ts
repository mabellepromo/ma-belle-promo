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
              Ma Belle Promo<br>
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
  cc?: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

// Options de journalisation dans email_logs (trace consultable au dashboard).
// skip: true → la fonction appelante journalise elle-même (ex. envois en masse
// qui écrivent une ligne de synthèse plutôt qu'une ligne par destinataire).
export interface EmailLogInfo {
  source?: string;  // ex. 'courrier', 'event-invitation' ; défaut 'automatisation'
  sentBy?: string;  // email du membre du bureau à l'origine de l'envoi
  skip?: boolean;
}

// Insertion dans email_logs via l'API REST (service role, injecté par Supabase).
// Ne doit JAMAIS faire échouer l'envoi : toute erreur est avalée et loggée.
async function logEmail(row: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const resp = await fetch(`${url}/rest/v1/email_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) console.error("email_logs insert failed:", resp.status, await resp.text());
  } catch (err) {
    console.error("email_logs insert error:", (err as Error).message);
  }
}

// Mémoire courte (mode test) : évite que les automatisations qui bouclent sur tous
// les membres envoient des dizaines de copies identiques à l'adresse de test.
// Clé = sujet + contenu ; on ignore un doublon vu il y a moins de 2 minutes.
const recentTestSends = new Map<string, number>();
const TEST_DEDUP_WINDOW_MS = 120_000;

export async function sendBrevoEmail(apiKey: string, payload: EmailPayload, log?: EmailLogInfo): Promise<void> {
  // Trace : destinataires réels et sujet AVANT la redirection éventuelle du mode test.
  const logRecipients = payload.to.map((r) => r.email);
  const logCc = payload.cc?.map((r) => r.email) ?? null;
  const logSubject = payload.subject;

  // Mode test : si le secret TEST_REDIRECT_EMAIL est défini, TOUS les emails sont
  // redirigés vers cette unique adresse (les vrais destinataires ne reçoivent rien).
  // Le sujet est préfixé par le destinataire réel pour garder la traçabilité.
  // Pour désactiver : supprimer le secret (supabase secrets unset TEST_REDIRECT_EMAIL).
  const testRedirect = Deno.env.get("TEST_REDIRECT_EMAIL");
  if (testRedirect) {
    // Dédoublonnage : un même contenu (ex. rappel d'événement adressé à 48 membres)
    // ne part qu'une seule fois vers l'adresse de test.
    const dedupKey = `${payload.subject}::${payload.htmlContent}`;
    const now = Date.now();
    const last = recentTestSends.get(dedupKey);
    if (last && now - last < TEST_DEDUP_WINDOW_MS) return;
    recentTestSends.set(dedupKey, now);

    const originalRecipients = [...payload.to, ...(payload.cc ?? [])].map((r) => r.email).join(", ");
    payload = {
      ...payload,
      to: [{ email: testRedirect, name: "TEST" }],
      cc: undefined, // en mode test, aucun CC réel ne doit partir
      subject: `[TEST → ${originalRecipients}] ${payload.subject}`,
    };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ sender: SENDER, ...payload }),
  });

  // Journalisation centralisée : chaque envoi laisse une trace dans email_logs,
  // sauf si l'appelant journalise lui-même (log.skip).
  const errMessage = response.ok
    ? null
    : ((await response.json().catch(() => ({}))) as { message?: string }).message ||
      `Brevo HTTP ${response.status}`;

  if (!log?.skip) {
    await logEmail({
      source: log?.source || "automatisation",
      sent_by: log?.sentBy || null,
      subject: logSubject,
      recipients: logRecipients,
      cc: logCc,
      recipient_count: logRecipients.length + (logCc?.length ?? 0),
      html_content: payload.htmlContent,
      status: errMessage ? "error" : "success",
      error_message: errMessage,
      test_redirect: Boolean(testRedirect),
    });
  }

  if (errMessage) throw new Error(errMessage);
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
