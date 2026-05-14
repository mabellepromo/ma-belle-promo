// Vercel serverless function — proxy Brevo API
// La clé API reste côté serveur (jamais exposée au navigateur)

const SENDER = { name: "Association Ma Belle Promo (MBP)", email: "contact@mabellepromo.org" };
const CONTACT_TO = [{ email: "contact@mabellepromo.org", name: "Ma Belle Promo" }];

/* ── Origines autorisées ── */
const ALLOWED_ORIGINS = [
  "https://mabellepromo.org",
  "https://www.mabellepromo.org",
  "https://mabellepromo.org",
];

/* ── Validation email basique ── */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email);
}

/* ── Validation URL de confirmation (domaines MBP uniquement) ── */
function isValidConfirmUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return ALLOWED_ORIGINS.some(o => url.startsWith(o));
  } catch {
    return false;
  }
}

function getAllowedOrigin(req) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // localhost autorisé uniquement en dev local
  if (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost")) return origin;
  return ALLOWED_ORIGINS[0];
}

/* ── Rate limiting en mémoire (max 5 requêtes / IP / 5 min) ── */
const rateLimitMap = new Map();
const RATE_LIMIT   = 5;
const RATE_WINDOW  = 5 * 60 * 1000;

/* ── Rate limiting relance cotisations (max 1 envoi-masse / heure / IP) ── */
const relanceRateLimitMap = new Map();
function checkRelanceRateLimit(ip) {
  const now  = Date.now();
  const last = relanceRateLimitMap.get(ip) || 0;
  if (now - last < 60 * 60 * 1000) return false;
  relanceRateLimitMap.set(ip, now);
  return true;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  // Nettoyage périodique pour éviter les fuites mémoire
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (val.every(t => now - t >= RATE_WINDOW)) rateLimitMap.delete(key);
    }
  }
  return true;
}

/* ── Échappement HTML pour les données utilisateur ── */
function escHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

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
          <td style="background:#14532d;padding:28px 32px;text-align:center;">
            <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              width="56" height="56" alt="Association Ma Belle Promo (MBP)"
              style="border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:block;margin:0 auto 12px;" />
            <div style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:0.3px;">Association Ma Belle Promo (MBP)</div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px;">FDD · Université de Lomé · Promotion 1994–2000</div>
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
  // Toutes les données utilisateur sont échappées avant injection dans le HTML
  const safeName    = escHtml(name);
  const safeEmail   = escHtml(email);
  const safeSujet   = escHtml(sujet);
  const safeMessage = escHtml(message);
  const safeSentAt  = escHtml(sent_at || new Date().toLocaleString("fr-FR"));

  const content = `
    <h2 style="margin:0 0 20px;font-size:17px;color:#111827;border-bottom:2px solid #16a34a;padding-bottom:10px;">
      Nouveau message de contact
    </h2>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">De&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Email&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;">
          <a href="mailto:${safeEmail}" style="color:#16a34a;text-decoration:none;">${safeEmail}</a>
        </td>
      </tr>
      ${safeSujet ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Sujet&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#111827;">${safeSujet}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Reçu le&nbsp;:</td>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">${safeSentAt}</td>
      </tr>
    </table>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;">
      <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      Répondez directement à cet email pour contacter <strong>${safeName}</strong>.
    </p>`;

  return {
    sender: SENDER,
    to: CONTACT_TO,
    replyTo: { email, name },
    subject: `[Contact] ${safeSujet || "Nouveau message"} — ${safeName}`,
    htmlContent: wrapHtml(content),
  };
}

function buildReplyPayload({ to_email, to_name, sujet, reply_message, date, sender_name, sender_poste }) {
  const greeting = to_name ? `Bonjour ${escHtml(to_name)},` : "Bonjour,";
  const body = escHtml(reply_message || "").replace(/\n/g, "<br>");
  const content = `
    <p style="margin:0 0 20px;font-size:15px;color:#111827;">${greeting}</p>
    <div style="font-size:14px;color:#374151;line-height:1.8;margin-bottom:28px;">${body}</div>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:8px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">${escHtml(sender_name || "Le Bureau Exécutif")}</p>
      ${sender_poste ? `<p style="margin:3px 0 0;font-size:12px;color:#6b7280;">${escHtml(sender_poste)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:12px;color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</p>
      <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">contact@mabellepromo.org</p>
      ${date ? `<p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">Le ${escHtml(date)}</p>` : ""}
    </div>`;

  return {
    sender: SENDER,
    to: [{ email: to_email, name: to_name || to_email }],
    replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    subject: sujet,
    htmlContent: wrapHtml(content),
  };
}

function buildNewsletterConfirmPayload({ email, token, confirm_url }) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:17px;color:#111827;">Confirmez votre inscription</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
      Merci de votre intérêt pour les actualités de <strong>l'Association Ma Belle Promo (MBP)</strong>.<br>
      Cliquez sur le bouton ci-dessous pour confirmer votre inscription à la newsletter.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${confirm_url}"
        style="display:inline-block;padding:13px 32px;background:#14532d;color:#fff;font-weight:bold;font-size:14px;text-decoration:none;border-radius:9999px;letter-spacing:0.3px;">
        Confirmer mon inscription
      </a>
    </div>
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.<br>
      Ce lien est valable 48 heures.
    </p>`;
  return {
    sender: SENDER,
    to: [{ email }],
    subject: "Confirmez votre inscription à la newsletter — Ma Belle Promo",
    htmlContent: wrapHtml(content),
  };
}

function buildRelanceCotisationPayload({ to_email, to_name, annee, message }) {
  const greeting = to_name ? `Cher(e) <strong>${escHtml(to_name)}</strong>,` : "Cher(e) membre,";
  const corps = message
    ? escHtml(message).replace(/\n/g, "<br>")
    : `Nous vous informons que votre cotisation annuelle pour l'exercice <strong>${escHtml(String(annee))}</strong> est en attente de règlement.<br><br>Nous vous remercions de bien vouloir procéder au paiement dans les meilleurs délais en contactant le bureau de l'association.`;

  const content = `
    <h2 style="margin:0 0 16px;font-size:17px;color:#111827;border-bottom:2px solid #f59e0b;padding-bottom:10px;">
      Rappel — Cotisation ${escHtml(String(annee))}
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#111827;">${greeting}</p>
    <div style="font-size:14px;color:#374151;line-height:1.8;margin-bottom:24px;">${corps}</div>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">Pour régler votre cotisation :</p>
      <p style="margin:6px 0 0;font-size:13px;color:#78350f;">Contactez le bureau ou écrivez-nous à <a href="mailto:contact@mabellepromo.org" style="color:#d97706;">contact@mabellepromo.org</a></p>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280;">
      Cordialement,<br>
      <strong style="color:#111827;">Le Bureau Exécutif</strong><br>
      <span style="color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</span>
    </p>`;

  return {
    sender: SENDER,
    to: [{ email: to_email, name: to_name || to_email }],
    replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    subject: `[MBP] Rappel cotisation ${annee}`,
    htmlContent: wrapHtml(content),
  };
}

function buildInvitationPayload({ to_name, titre, description, lien }) {
  const greeting = to_name ? `Bonjour <strong>${escHtml(to_name)}</strong>,` : "Bonjour,";
  const content = `
    <p style="margin:0 0 20px;font-size:15px;color:#111827;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
      L'Association Ma Belle Promo vous invite à répondre au sondage suivant :
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #14532d;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:17px;font-weight:bold;color:#14532d;">${escHtml(titre)}</p>
      ${description ? `<p style="margin:10px 0 0;font-size:13px;color:#374151;line-height:1.6;">${escHtml(description)}</p>` : ""}
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${lien}"
        style="display:inline-block;padding:14px 40px;background:#14532d;color:#fff;font-weight:bold;font-size:15px;text-decoration:none;border-radius:9999px;letter-spacing:0.3px;">
        Répondre au sondage →
      </a>
    </div>
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.7;">
      Ce lien vous est personnel et vous permet de répondre une seule fois.<br>
      Si vous ne souhaitez pas participer, ignorez simplement cet email.
    </p>`;
  return {
    sender: SENDER,
    to: null, // défini par l'appelant
    subject: `Sondage MBP : ${escHtml(titre)}`,
    htmlContent: wrapHtml(content),
  };
}

function buildAdminAlertPayload({ nom, email, alertType, detail }) {
  const labels = {
    deletion_request:    { titre: "Demande de suppression de compte", couleur: "#dc2626", badge: "Action requise" },
    new_member_request:  { titre: "Nouvelle demande d'adhésion",      couleur: "#16a34a", badge: "À valider" },
  };
  const cfg = labels[alertType] || { titre: escHtml(alertType), couleur: "#6b7280", badge: "Alerte" };
  const content = `
    <div style="display:inline-block;padding:4px 12px;background:${cfg.couleur};color:#fff;font-size:11px;font-weight:bold;border-radius:9999px;margin-bottom:16px;">
      ${cfg.badge}
    </div>
    <h2 style="margin:0 0 16px;font-size:17px;color:#111827;">${cfg.titre}</h2>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:100px;">Membre :</td>
          <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${escHtml(nom || "—")}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Email :</td>
          <td style="padding:4px 0;font-size:13px;"><a href="mailto:${escHtml(email)}" style="color:#14532d;">${escHtml(email)}</a></td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Date :</td>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;">${new Date().toLocaleString("fr-FR")}</td></tr>
    </table>
    ${detail ? `<div style="background:#f0fdf4;border-left:4px solid ${cfg.couleur};border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#374151;white-space:pre-line;">${escHtml(detail).replace(/\n/g, "<br>")}</p>
    </div>` : ""}
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Traitez cette demande depuis le Dashboard ou en répondant à l'email du membre sous 30 jours (Art. 17 RGPD).
    </p>`;
  return {
    sender: SENDER,
    to: CONTACT_TO,
    replyTo: { email, name: nom || email },
    subject: `[${cfg.badge}] ${cfg.titre} — ${escHtml(nom || email)}`,
    htmlContent: wrapHtml(content),
  };
}

export default async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting — max 5 requêtes / IP / 5 minutes
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez dans quelques minutes." });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: "BREVO_API_KEY not configured" });
  }

  const { type, ...data } = req.body;

  const VALID_TYPES = ["contact", "reply", "newsletter_confirm", "admin_alert", "relance_cotisation", "sondage_invitation", "circulaire"];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Use one of: ${VALID_TYPES.join(", ")}` });
  }

  // ── Circulaire : email groupé à une liste de membres ──
  if (type === "circulaire") {
    const { destinataires, sujet, corps, expediteur } = data;
    if (!Array.isArray(destinataires) || destinataires.length === 0)
      return res.status(400).json({ error: "Aucun destinataire." });
    if (destinataires.length > 200)
      return res.status(400).json({ error: "Maximum 200 destinataires par envoi." });
    if (!sujet || !corps)
      return res.status(400).json({ error: "Sujet et corps obligatoires." });
    if (!checkRelanceRateLimit(ip))
      return res.status(429).json({ error: "Un envoi groupé a déjà été effectué dans la dernière heure." });

    const valides = destinataires.filter(d => isValidEmail(d.email));
    const corps_html = escHtml(corps).replace(/\n/g, "<br>");
    const sender_label = escHtml(expediteur || "Le Bureau Exécutif");

    const results = await Promise.allSettled(
      valides.map(async d => {
        const greeting = d.nom ? `Bonjour <strong>${escHtml(d.nom)}</strong>,` : "Bonjour,";
        const content = `
          <p style="margin:0 0 20px;font-size:15px;color:#111827;">${greeting}</p>
          <div style="font-size:14px;color:#374151;line-height:1.8;margin-bottom:28px;">${corps_html}</div>
          <div style="border-top:1px solid #e5e7eb;padding-top:16px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">${sender_label}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#16a34a;font-weight:600;">Ma Belle Promo — FDD Lomé · 1994–2000</p>
            <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">contact@mabellepromo.org</p>
          </div>`;
        const payload = {
          sender: SENDER,
          to: [{ email: d.email, name: d.nom || d.email }],
          replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
          subject: escHtml(sujet),
          htmlContent: wrapHtml(content),
        };
        const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) { const err = await resp.json(); throw new Error(err.message || "Brevo error"); }
        return d.nom;
      })
    );
    const sent   = results.filter(r => r.status === "fulfilled").length;
    const errors = results.map((r, i) => r.status === "rejected" ? { nom: valides[i].nom, reason: r.reason?.message } : null).filter(Boolean);
    return res.status(200).json({ success: true, sent, total: valides.length, errors });
  }

  // ── Relance cotisations : envoi en masse, rate limit propre ──
  if (type === "relance_cotisation") {
    const { membres, annee, message } = data;
    if (!Array.isArray(membres) || membres.length === 0) {
      return res.status(400).json({ error: "Aucun membre à relancer." });
    }
    if (membres.length > 100) {
      return res.status(400).json({ error: "Maximum 100 membres par envoi." });
    }
    if (!annee || typeof annee !== "number") {
      return res.status(400).json({ error: "Année invalide." });
    }
    if (!checkRelanceRateLimit(ip)) {
      return res.status(429).json({ error: "Une relance a déjà été envoyée dans la dernière heure. Réessayez plus tard." });
    }

    const membresValides = membres.filter(m => isValidEmail(m.email));
    const membresInvalides = membres.filter(m => !isValidEmail(m.email));

    const results = await Promise.allSettled(
      membresValides.map(async m => {
        const payload = buildRelanceCotisationPayload({ to_email: m.email, to_name: m.nom, annee, message: message || null });
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Erreur Brevo");
        }
        return m.nom;
      })
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    const errors = [
      ...results
        .map((r, i) => r.status === "rejected" ? { nom: membresValides[i].nom, reason: r.reason?.message } : null)
        .filter(Boolean),
      ...membresInvalides.map(m => ({ nom: m.nom, reason: "Email invalide ou manquant" })),
    ];

    console.log(`Relance cotisation ${annee}: ${sent} envoyés, ${errors.length} erreurs`);
    return res.status(200).json({ success: true, sent, total: membres.length, errors });
  }

  // ── Invitations sondage (envoi en masse, lien personnalisé) ──
  if (type === "sondage_invitation") {
    const { invitations, sondageTitre, sondageDescription } = data;
    if (!Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ error: "Aucune invitation à envoyer." });
    }
    if (invitations.length > 200) {
      return res.status(400).json({ error: "Maximum 200 invitations par envoi." });
    }

    const valides = invitations.filter(i => isValidEmail(i.email));

    const results = await Promise.allSettled(
      valides.map(async (inv) => {
        const base = buildInvitationPayload({
          to_name: inv.nom || null,
          titre: sondageTitre || "Sondage",
          description: sondageDescription || null,
          lien: inv.lien,
        });
        const payload = { ...base, to: [{ email: inv.email, name: inv.nom || inv.email }] };
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Erreur Brevo");
        }
        return inv.id;
      })
    );

    const sentIds = results
      .map((r, i) => r.status === "fulfilled" ? valides[i].id : null)
      .filter(Boolean);
    const errors = results
      .map((r, i) => r.status === "rejected" ? { email: valides[i].email, reason: r.reason?.message } : null)
      .filter(Boolean);

    console.log(`Invitations sondage "${sondageTitre}": ${sentIds.length} envoyées, ${errors.length} erreurs`);
    return res.status(200).json({ success: true, sent: sentIds.length, sentIds, errors });
  }

  // Validation des champs selon le type
  if (type === "contact") {
    if (!isValidEmail(data.email)) return res.status(400).json({ error: "Adresse email invalide." });
  } else if (type === "reply") {
    if (!isValidEmail(data.to_email)) return res.status(400).json({ error: "Adresse email du destinataire invalide." });
  } else if (type === "newsletter_confirm") {
    if (!isValidEmail(data.email)) return res.status(400).json({ error: "Adresse email invalide." });
    if (!isValidConfirmUrl(data.confirm_url)) return res.status(400).json({ error: "URL de confirmation non autorisée." });
  } else if (type === "admin_alert") {
    if (!isValidEmail(data.email)) return res.status(400).json({ error: "Adresse email invalide." });
  }

  try {
    let payload;
    if (type === "contact")              payload = buildContactPayload(data);
    else if (type === "reply")           payload = buildReplyPayload(data);
    else if (type === "newsletter_confirm") payload = buildNewsletterConfirmPayload(data);
    else                                 payload = buildAdminAlertPayload(data);

    if (type === "reply" && Array.isArray(data.attachments) && data.attachments.length) {
      payload.attachment = data.attachments.slice(0, 5).map(a => ({ name: a.name, content: a.content }));
    }

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
