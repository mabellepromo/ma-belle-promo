// Vercel serverless function — proxy Brevo API
// La clé API reste côté serveur (jamais exposée au navigateur)
import PDFDocument from "pdfkit";

const MBP_LOGO_PNG_B64 = "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";

const SENDER = { name: "Association Ma Belle Promo (MBP)", email: "contact@mabellepromo.org" };
const CONTACT_TO = [{ email: "contact@mabellepromo.org", name: "Ma Belle Promo" }];

/* ── Origines autorisées ── */
const ALLOWED_ORIGINS = [
  "https://mabellepromo.org",
  "https://www.mabellepromo.org",
  "https://mabellepromo.vercel.app",
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
      Merci de votre intérêt pour les actualités de <strong>l'association Ma Belle Promo (MBP)</strong>.<br>
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
      L'association Ma Belle Promo vous invite à répondre au sondage suivant :
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

function buildOrderConfirmPayload({ email, nom, reference, methode, total, lignes }) {
  const METHOD_LABELS = {
    card:   "Carte bancaire",
    paypal: "PayPal",
    wave:   "Wave",
    tmoney: "T-Money",
    flooz:  "Flooz",
    wire:   "Virement ECOBANK",
  };
  const isWire = methode === "wire";
  const fmtNum = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";
  const safeNom  = escHtml(nom || "");
  const safeRef  = escHtml(reference || "");
  const safeMeth = escHtml(METHOD_LABELS[methode] || methode);

  const lignesHtml = Array.isArray(lignes) ? lignes.map(l => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">
        ${escHtml(l.emoji || "")} ${escHtml(l.name)}
      </td>
      <td style="padding:8px 12px;font-size:13px;color:#374151;text-align:center;border-bottom:1px solid #f3f4f6;">×${Number(l.qty)}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;">
        ${fmtNum(l.price * l.qty)}
      </td>
    </tr>`).join("") : "";

  const wireBlock = isWire ? `
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#14532d;">Coordonnées pour le virement :</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.8;">
        Titulaire : <strong>ASSOCIATION MA BELLE PROMO MBP</strong><br>
        Banque : ECOBANK Togo<br>
        IBAN : <code style="font-family:monospace;">TG53 TG05 5017 1014 1766 3880 0153</code><br>
        Swift/BIC : <code style="font-family:monospace;">ECOCTGTGXXX</code><br>
        Référence : <strong>BOUTIQUE MBP — ${safeNom}</strong>
      </p>
    </div>
    <p style="font-size:13px;color:#6b7280;">
      Votre commande sera traitée dès réception du virement (1–3 jours ouvrés).
    </p>` : `
    <p style="font-size:14px;color:#374151;">
      Votre paiement a été traité avec succès. Votre commande est confirmée.
    </p>`;

  const content = `
    <h2 style="margin:0 0 6px;font-size:18px;color:#111827;">Merci pour votre commande, ${safeNom} !</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
      ${isWire ? "Votre commande est en attente de réception du virement." : "Votre commande a bien été enregistrée."}
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block;">
      <p style="margin:0;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Référence commande</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:900;color:#14532d;font-family:monospace;">${safeRef}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Article</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;">Qté</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-align:right;text-transform:uppercase;">Prix</th>
        </tr>
      </thead>
      <tbody>${lignesHtml}</tbody>
      <tfoot>
        <tr style="background:#f9fafb;">
          <td colspan="2" style="padding:10px 12px;font-size:14px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb;">Total</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:900;color:#14532d;text-align:right;border-top:2px solid #e5e7eb;">${fmtNum(total)}</td>
        </tr>
      </tfoot>
    </table>

    <p style="font-size:13px;color:#6b7280;margin:0 0 8px;">
      Mode de paiement : <strong style="color:#111827;">${safeMeth}</strong>
    </p>

    ${wireBlock}

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      Pour toute question, écrivez-nous à
      <a href="mailto:contact@mabellepromo.org" style="color:#16a34a;">contact@mabellepromo.org</a>.
    </p>`;

  return {
    sender: SENDER,
    to: [{ email, name: nom || email }],
    replyTo: { email: "contact@mabellepromo.org", name: "Ma Belle Promo" },
    subject: `Commande ${safeRef} — Ma Belle Promo`,
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

const METHOD_LABELS_PDF = {
  card: "Carte bancaire", paypal: "PayPal", wave: "Wave",
  tmoney: "T-Money", flooz: "Flooz", wire: "Virement ECOBANK",
};

function generateInvoicePdf({ reference, nom, email, methode, total, lignes }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 595, pad = 50;
    const fmtN = n => Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " FCFA";
    const strip = s => String(s || "").replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "").trim();
    const date  = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    /* ── En-tête verte — couleur la plus sombre de la charte (#0a3d28) ── */
    doc.rect(0, 0, W, 110).fill("#0a3d28");
    /* Liseré doré sous l'en-tête */
    doc.rect(0, 110, W, 3).fill("#b8861a");

    /* Logo MBP — save/restore pour isoler le clipping au cercle */
    try {
      const logoBuf = Buffer.from(MBP_LOGO_PNG_B64, "base64");
      doc.save();
      doc.circle(pad + 28, 55, 28).clip();
      doc.image(logoBuf, pad, 27, { width: 56, height: 56 });
      doc.restore();
    } catch (_) {
      doc.circle(pad + 28, 55, 28).fill("#0f5c3a");
      doc.fillColor("#e6b84a").fontSize(7).font("Helvetica-Bold")
         .text("MBP", pad + 14, 50, { width: 28, align: "center" });
    }

    /* Nom association */
    doc.fillColor("#fff").fontSize(15).font("Helvetica-Bold")
       .text("Association Ma Belle Promo (MBP)", pad + 68, 32);
    doc.fontSize(8).font("Helvetica")
       .text("FDD · Université de Lomé · Promotion 1994–2000", pad + 68, 52)
       .text("contact@mabellepromo.org  ·  www.mabellepromo.org", pad + 68, 65);

    /* Badge FACTURE — doré charte */
    doc.rect(410, 34, 135, 32).fill("#b8861a");
    doc.fillColor("#fff").fontSize(15).font("Helvetica-Bold")
       .text("FACTURE", 410, 43, { width: 135, align: "center" });

    /* ── Bloc méta ── */
    let y = 133;
    const col1 = pad, col2 = 175;

    doc.fillColor("#0a3d28").fontSize(9).font("Helvetica-Bold").text("Référence", col1, y);
    doc.fillColor("#111827").font("Helvetica").text(reference, col2, y);
    y += 16;
    doc.fillColor("#0a3d28").font("Helvetica-Bold").text("Date", col1, y);
    doc.fillColor("#111827").font("Helvetica").text(date, col2, y);
    y += 16;
    doc.fillColor("#0a3d28").font("Helvetica-Bold").text("Mode de paiement", col1, y);
    doc.fillColor("#111827").font("Helvetica").text(METHOD_LABELS_PDF[methode] || methode, col2, y);

    /* ── Bloc Facturé à — vert clair charte ── */
    doc.rect(350, 128, 200, 70).fill("#f7faf8").stroke("#c8ddd2").lineWidth(1);
    doc.fillColor("#0a3d28").fontSize(8).font("Helvetica-Bold").text("FACTURÉ À", 360, 136);
    doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text(strip(nom), 360, 151);
    doc.fontSize(9).font("Helvetica").fillColor("#374151").text(email, 360, 165, { width: 180 });

    /* ── Séparateur ── */
    y = 213;
    doc.moveTo(pad, y).lineTo(W - pad, y).stroke("#e0e0e0").lineWidth(1);

    /* ── Entête tableau pleine largeur ── */
    y += 8;
    doc.rect(0, y, W, 24).fill("#0a3d28");
    doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
       .text("Article",        pad + 10, y + 7, { width: 290 })
       .text("Qté",            350, y + 7, { width: 40, align: "center" })
       .text("Prix unitaire",  395, y + 7, { width: 80, align: "right" })
       .text("Total",          480, y + 7, { width: W - pad - 480, align: "right" });

    /* ── Lignes tableau — alternance blanc / vert très clair charte ── */
    y += 24;
    (Array.isArray(lignes) ? lignes : []).forEach((l, i) => {
      if (i % 2 === 0) doc.rect(pad, y, W - pad * 2, 22).fill("#f7faf8").stroke("#e0e0e0").lineWidth(0.5);
      doc.fillColor("#111827").fontSize(10).font("Helvetica")
         .text(strip(l.name), pad + 10, y + 5, { width: 290 })
         .text(String(l.qty), 350, y + 5, { width: 40, align: "center" })
         .text(fmtN(l.price), 395, y + 5, { width: 80, align: "right" })
         .text(fmtN(l.price * l.qty), 480, y + 5, { width: 65, align: "right" });
      y += 22;
    });

    /* ── Ligne total pleine largeur ── */
    y += 8;
    doc.moveTo(0, y).lineTo(W, y).stroke("#e0e0e0").lineWidth(1);
    y += 8;
    doc.rect(0, y, W, 30).fill("#0a3d28");
    doc.fillColor("#fff").fontSize(12).font("Helvetica-Bold")
       .text("TOTAL TTC", pad + 10, y + 8)
       .text(fmtN(total), 0, y + 8, { width: W - pad, align: "right" });
    y += 48;

    /* ── Coordonnées bancaires (virement) — doré clair charte ── */
    if (methode === "wire") {
      doc.rect(pad, y, W - pad * 2, 88).fill("#fffbea").stroke("#d4a017").lineWidth(1);
      doc.fillColor("#b8861a").fontSize(9).font("Helvetica-Bold")
         .text("Coordonnées bancaires pour le virement", pad + 12, y + 10);
      doc.fillColor("#374151").font("Helvetica").fontSize(9)
         .text("Titulaire  :  ASSOCIATION MA BELLE PROMO MBP",   pad + 12, y + 26)
         .text("Banque    :  ECOBANK Togo",                       pad + 12, y + 40)
         .text("IBAN       :  TG53 TG05 5017 1014 1766 3880 0153", pad + 12, y + 54)
         .text("Swift/BIC :  ECOCTGTGXXX",                        pad + 12, y + 68)
         .text(`Référence virement : BOUTIQUE MBP — ${strip(nom)}`, pad + 12, y + 82);
      y += 100;
    }

    /* ── Mentions légales ── */
    y += 10;
    doc.moveTo(pad, y).lineTo(W - pad, y).stroke("#e0e0e0").lineWidth(0.5);
    doc.fillColor("#9ca3af").fontSize(7.5).font("Helvetica")
       .text(
         "Ce document tient lieu de reçu et de facture simplifiée. Association à but non lucratif — non assujettie à la TVA.",
         pad, y + 8, { width: W - pad * 2, align: "center" }
       );

    /* ── Pied de page — vert foncé charte ── */
    doc.rect(0, 800, W, 42).fill("#0a3d28");
    doc.moveTo(0, 800).lineTo(W, 800).stroke("#b8861a").lineWidth(1);
    doc.fillColor("#fff").fontSize(8).font("Helvetica")
       .text("Ma Belle Promo  ·  12 BP 335 Baguida, Lomé, Togo  ·  contact@mabellepromo.org  ·  www.mabellepromo.org",
         0, 814, { width: W, align: "center" });

    doc.end();
  });
}

export default async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, ...data } = req.body;

  // Rate limiting — max 5 requêtes / IP / 5 minutes
  // Exemption : order_confirm est un email transactionnel déclenché après achat
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (type !== "order_confirm" && !checkRateLimit(ip)) {
    return res.status(429).json({ error: "Trop de requêtes. Réessayez dans quelques minutes." });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: "BREVO_API_KEY not configured" });
  }

  const VALID_TYPES = ["contact", "reply", "newsletter_confirm", "admin_alert", "relance_cotisation", "sondage_invitation", "circulaire", "order_confirm"];
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

  // ── Confirmation de commande avec facture PDF jointe ──
  if (type === "order_confirm") {
    if (!isValidEmail(data.email)) return res.status(400).json({ error: "Adresse email invalide." });
    try {
      const pdfBuffer = await generateInvoicePdf(data);
      const emailPayload = buildOrderConfirmPayload(data);
      emailPayload.attachment = [{
        content: pdfBuffer.toString("base64"),
        name: `Facture-${(data.reference || "MBP").replace(/[^A-Z0-9-]/gi, "")}.pdf`,
      }];
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(emailPayload),
      });
      const result = await resp.json();
      if (!resp.ok) { console.error("Brevo order_confirm error:", result); return res.status(502).json({ error: result }); }
      return res.status(200).json({ success: true, messageId: result.messageId });
    } catch (err) {
      console.error("order_confirm PDF error:", err.message);
      return res.status(500).json({ error: err.message });
    }
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
