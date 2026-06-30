// ─────────────────────────────────────────────────────────────────────────────
// Constructeur d'email HTML pour la rubrique Courriers.
//
// Transpose un courrier (mêmes champs que le formulaire papier à en-tête) en
// HTML **email** robuste : largeur 600px, mise en page par tableaux, styles en
// ligne — compatible Gmail / Outlook / Apple Mail. Indépendant du système
// d'impression A4 (aucune pagination : un email n'a pas de pages).
//
// Les 7 modèles d'impression sont déclinés ici en 7 variantes d'EN-TÊTE qui
// reprennent l'ESPRIT de chaque papier (les clients mail ne reproduisent pas
// les décors complexes — on transpose, on ne copie pas au pixel).
//
// ⚠️ Ne modifie aucun fichier original (CourrierSection.jsx, public/docs/*).
// ─────────────────────────────────────────────────────────────────────────────

// Charte MBP
const C = {
  green:     "#2d7a4f",
  greenDark: "#14532d",
  gold:      "#c8921a",
  light:     "#f0f9f4",
  border:    "#b5d9c5",
  ink:       "#111827",
  muted:     "#6b7280",
};

// Origine absolue (aperçu navigateur ET envoi email) — les clients mail
// exigent des URL absolues pour les images.
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://www.mabellepromo.org";
const LOGO = `${ORIGIN}/Logo%20Redesign1.png`;
const STAMP = `${ORIGIN}/images/FDD.webp`; // cachet de la Présidente

function esc(s) {
  if (typeof s !== "string") return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

// Texte multi-lignes → paragraphes <p> (double saut) avec <br> pour les simples
function paragraphs(text, style) {
  const blocks = String(text || "").trim().split(/\n\s*\n/);
  return blocks
    .filter(b => b.trim())
    .map(b => `<p style="${style}">${esc(b).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Texte multi-lignes simple → <br> (destinataire, signature)
function lines(text) {
  return esc(text || "").replace(/\n/g, "<br>");
}

// ── En-têtes par modèle ───────────────────────────────────────────────────────
// Chaque fonction renvoie le <tr> d'en-tête (cellule unique) en HTML email.

function headerBlock(inner) {
  return inner;
}

const TITLE = "Association Ma Belle Promo (MBP)";
const SUBTITLE = "FDD · Université de Lomé · Promotion 1994–2000";

function logoImg(size = 56, border = "rgba(255,255,255,0.4)") {
  return `<img src="${LOGO}" width="${size}" height="${size}" alt="MBP"
    style="border-radius:50%;border:2px solid ${border};display:block;" />`;
}

// v1 — Classique : bandeau vert plein + filet doré
function headerV1() {
  return headerBlock(`
    <tr><td style="background:${C.greenDark};padding:24px 32px;text-align:center;border-bottom:4px solid ${C.gold};">
      <table cellpadding="0" cellspacing="0" align="center"><tr>
        <td style="padding-right:14px;">${logoImg()}</td>
        <td style="text-align:left;">
          <div style="color:#fff;font-size:18px;font-weight:bold;">${TITLE}</div>
          <div style="color:rgba(255,255,255,0.75);font-size:12px;margin-top:3px;">${SUBTITLE}</div>
        </td>
      </tr></table>
    </td></tr>`);
}

// v2 — Moderne : bandeau vertical vert→doré à gauche, fond clair
function headerV2() {
  return headerBlock(`
    <tr><td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="8" style="background:${C.green};"></td>
        <td style="background:${C.light};padding:22px 28px;border-bottom:1px solid ${C.border};">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;">${logoImg(52, C.border)}</td>
            <td>
              <div style="color:${C.greenDark};font-size:18px;font-weight:bold;">${TITLE}</div>
              <div style="color:${C.green};font-size:12px;margin-top:3px;">${SUBTITLE}</div>
            </td>
          </tr></table>
        </td>
      </tr></table>
    </td></tr>`);
}

// v3 — Creativo : bandeau vert avec accent doré dégradé
function headerV3() {
  return headerBlock(`
    <tr><td style="background:${C.green};padding:24px 32px;text-align:center;">
      ${logoImg(56)}
      <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:10px;">${TITLE}</div>
      <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:3px;">${SUBTITLE}</div>
    </td></tr>
    <tr><td style="height:6px;background:${C.gold};background:linear-gradient(to right,${C.gold},${C.green});font-size:0;line-height:0;">&nbsp;</td></tr>`);
}

// v4 — Éco sobriété : minimal, filet vert fin, texte vert sur blanc
function headerV4() {
  return headerBlock(`
    <tr><td style="background:#fff;padding:22px 32px 16px;border-top:3px solid ${C.green};">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:12px;">${logoImg(44, C.border)}</td>
        <td>
          <div style="color:${C.greenDark};font-size:17px;font-weight:bold;">${TITLE}</div>
          <div style="color:${C.muted};font-size:11px;margin-top:2px;">${SUBTITLE}</div>
        </td>
      </tr></table>
    </td></tr>`);
}

// v5 — Éco arrondi : en-tête vert arrondi sur fond clair
function headerV5() {
  return headerBlock(`
    <tr><td style="padding:16px 16px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="background:${C.greenDark};border-radius:16px;padding:20px 28px;text-align:center;">
          ${logoImg(50)}
          <div style="color:#fff;font-size:17px;font-weight:bold;margin-top:8px;">${TITLE}</div>
          <div style="color:rgba(255,255,255,0.8);font-size:11px;margin-top:2px;">${SUBTITLE}</div>
        </td>
      </tr></table>
    </td></tr>`);
}

// v6 — Modèle officiel : bandeau vert + filet doré, sobre et institutionnel
function headerV6() {
  return headerBlock(`
    <tr><td style="background:${C.greenDark};padding:26px 32px;text-align:center;">
      ${logoImg(58)}
      <div style="color:#fff;font-size:19px;font-weight:bold;margin-top:10px;letter-spacing:0.3px;">${TITLE}</div>
      <div style="color:rgba(255,255,255,0.78);font-size:12px;margin-top:4px;">${SUBTITLE}</div>
    </td></tr>
    <tr><td style="height:4px;background:${C.gold};font-size:0;line-height:0;">&nbsp;</td></tr>`);
}

// v7 — Cadre décoratif : double bordure vert + doré autour de l'email
// (le cadre est géré dans buildCourrierEmail via wrapFrame ; en-tête simple)
function headerV7() {
  return headerBlock(`
    <tr><td style="background:${C.light};padding:22px 28px;text-align:center;border-bottom:2px solid ${C.gold};">
      ${logoImg(52, C.green)}
      <div style="color:${C.greenDark};font-size:18px;font-weight:bold;margin-top:8px;">${TITLE}</div>
      <div style="color:${C.green};font-size:12px;margin-top:3px;">${SUBTITLE}</div>
    </td></tr>`);
}

const HEADERS = {
  v1: headerV1, v2: headerV2, v3: headerV3, v4: headerV4,
  v5: headerV5, v6: headerV6, v7: headerV7,
};

/**
 * Construit le HTML email d'un courrier.
 * @param {object} args
 * @param {string} args.modelId  id du modèle (v1..v7)
 * @param {object} args.form     { date, ref, objet, dest, appel, corps, politesse, sigNom, sigTitre }
 * @returns {string} HTML email complet
 */
export function buildCourrierEmail({ modelId = "v6", form = {} }) {
  const header = (HEADERS[modelId] || headerV6)();
  const isFramed = modelId === "v7";

  const pStyle = `margin:0 0 14px;font-size:14px;line-height:1.7;color:${C.ink};`;

  const body = `
    <!-- Date + référence -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:12px;color:${C.muted};">${form.ref ? "Réf. : " + esc(form.ref) : ""}</td>
        <td style="font-size:12px;color:${C.muted};text-align:right;">${esc(form.date || "")}</td>
      </tr>
    </table>

    ${form.dest ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:${C.ink};">${lines(form.dest)}</p>` : ""}

    ${form.objet ? `<p style="margin:20px 0 16px;font-size:14px;color:${C.ink};"><strong>Objet :</strong> ${esc(form.objet)}</p>` : ""}

    ${form.appel ? `<p style="${pStyle}">${esc(form.appel)}</p>` : ""}

    ${paragraphs(form.corps, pStyle)}

    ${form.politesse ? `<p style="${pStyle}margin-top:18px;">${esc(form.politesse)}</p>` : ""}

    <!-- Signature + cachet de la Présidente -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;">
      <tr><td style="text-align:right;">
        ${form.sigTitre ? `<div style="font-size:12px;color:${C.green};font-weight:600;">${esc(form.sigTitre)}</div>` : ""}
        ${form.sigNom ? `<div style="font-size:14px;font-weight:bold;color:${C.ink};margin-top:2px;">${esc(form.sigNom)}</div>` : ""}
        <img src="${STAMP}" alt="Cachet de la Présidente" width="100"
          style="display:inline-block;width:100px;height:auto;margin-top:6px;opacity:0.92;" />
      </td></tr>
    </table>`;

  const footer = `
    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
        Ma Belle Promo —
        <a href="mailto:contact@mabellepromo.org" style="color:${C.green};text-decoration:none;">contact@mabellepromo.org</a>
        &nbsp;·&nbsp;
        <a href="https://www.mabellepromo.org" style="color:${C.green};text-decoration:none;">www.mabellepromo.org</a>
      </p>
    </td></tr>`;

  const card = `
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);${isFramed ? `border:3px solid ${C.green};` : ""}">
      ${isFramed ? `<tr><td style="padding:6px;"><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.gold};border-radius:8px;overflow:hidden;">` : ""}
      ${header}
      <tr><td style="padding:28px 32px;">${body}</td></tr>
      ${isFramed ? `</table></td></tr>` : footer}
    </table>
    ${isFramed ? `<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tbody>${footer}</tbody></table>` : ""}`;

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Courrier — Ma Belle Promo</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 0;">
    <tr><td align="center">
      ${card}
    </td></tr>
  </table>
</body></html>`;
}
