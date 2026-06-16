import { supabase } from "./supabase";
import {
  PROFILE_TYPES, COUNTRIES, EXPERTISE_DOMAINS, LANGUAGES, PROJECT_INTERESTS,
  MISSION_TYPES, ENGAGEMENT_LEVELS, ENGAGEMENT_DURATIONS, PREFERRED_SCHEDULES,
  MODALITIES, EMPLOYMENT_SECTORS, UNIVERSITIES, STUDY_YEARS, TIMEZONES,
  REFERRAL_SOURCES, NEWSLETTER_FREQUENCIES, labelOf, labelsOf,
} from "./benevolatConstants";
import { CHARTE, CHARTE_VERSION, CHARTE_DATE } from "./charteBenevolat";

const MBP_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }

  @page { size: A4 portrait; margin: 0; }

  body {
    font-family: 'Lato', sans-serif;
    background: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 20px 0 40px;
  }

  @media print {
    body { background: #fff; padding: 0; display: block; }
    .no-print { display: none !important; }
    .a4 { box-shadow: none; border-radius: 0; margin: 0; width: 100%; }
  }

  .a4 {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    box-shadow: 0 4px 30px rgba(0,0,0,0.25);
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .doc-header {
    background: linear-gradient(135deg, #0a3d28 0%, #0f5c3a 60%, #1a7a4e 100%);
    padding: 28px 36px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .doc-header-logo {
    height: 56px;
    width: auto;
  }

  .doc-header-asso {
    text-align: right;
    flex: 1;
  }

  .doc-header-asso p {
    font-family: 'Cormorant Garamond', serif;
    color: rgba(255,255,255,0.90);
    line-height: 1.35;
  }

  .doc-header-asso .asso-name {
    font-size: 15pt;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
  }

  .doc-header-asso .asso-sub {
    font-size: 9.5pt;
    color: rgba(255,255,255,0.72);
    font-style: italic;
  }

  .gold-bar {
    height: 4px;
    background: linear-gradient(to right, #b8861a, #e6b84a, #b8861a);
  }

  .doc-body {
    padding: 36px 44px 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .doc-title-block {
    text-align: center;
    padding-bottom: 22px;
    border-bottom: 1px solid #e0e0e0;
  }

  .doc-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22pt;
    font-weight: 700;
    color: #0a3d28;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .doc-ref {
    font-family: 'Lato', sans-serif;
    font-size: 8pt;
    color: #999;
    letter-spacing: 0.08em;
    margin-top: 6px;
  }

  .intro-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 12.5pt;
    color: #333;
    line-height: 1.8;
    text-align: justify;
  }

  .intro-text strong {
    color: #0a3d28;
    font-weight: 700;
  }

  .info-box {
    background: #f7faf8;
    border: 1px solid #c8ddd2;
    border-radius: 8px;
    padding: 20px 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 24px;
  }

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-label {
    font-family: 'Lato', sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0a3d28;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .info-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 12pt;
    color: #1a1a1a;
    font-weight: 600;
  }

  .info-row.full-width { grid-column: 1 / -1; }

  .notice-box {
    background: linear-gradient(135deg, #fffbea, #fff8dc);
    border: 1px solid #d4a017;
    border-left: 4px solid #d4a017;
    border-radius: 6px;
    padding: 14px 18px;
  }

  .notice-box p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11pt;
    color: #6b4c00;
    line-height: 1.6;
    font-style: italic;
  }

  .signature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 12px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
  }

  .signature-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sig-label {
    font-family: 'Lato', sans-serif;
    font-size: 8pt;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .sig-area {
    height: 80px;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: flex-end;
    padding-bottom: 6px;
  }

  .sig-area span {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11pt;
    color: #555;
    font-style: italic;
  }

  .sig-name {
    font-family: 'Lato', sans-serif;
    font-size: 9.5pt;
    font-weight: 700;
    color: #0a3d28;
    margin-top: 4px;
  }

  .sig-title {
    font-family: 'Lato', sans-serif;
    font-size: 8.5pt;
    color: #666;
  }

  .doc-footer {
    background: #f7faf8;
    border-top: 1px solid #c8ddd2;
    padding: 12px 44px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-top: auto;
  }

  .footer-text {
    font-family: 'Lato', sans-serif;
    font-size: 7.5pt;
    color: #999;
    line-height: 1.5;
  }

  .gold-seal {
    position: absolute;
    bottom: 80px;
    right: 44px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid #b8861a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: rgba(184,134,26,0.06);
    padding: 8px;
    gap: 2px;
  }

  .gold-seal-top {
    font-family: 'Cormorant Garamond', serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: #b8861a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.2;
  }

  .gold-seal-year {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14pt;
    font-weight: 700;
    color: #b8861a;
  }

  .gold-seal-bottom {
    font-family: 'Lato', sans-serif;
    font-size: 6pt;
    color: #b8861a;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .photo-ring {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid #b8861a;
    padding: 3px;
    background: linear-gradient(135deg, #f9f3e3, #fff);
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(184,134,26,0.25);
  }

  .photo-ring img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    display: block;
  }

  /* ── Mini Carte — Option B Professionnelle ── */
  .mini-card {
    width: 86mm;
    height: 54mm;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 3px 14px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
    font-family: 'Lato', sans-serif;
    flex-shrink: 0;
  }

  .mini-card-inner {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .mini-card-left {
    width: 28mm;
    background: #0a3d28;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.028) 2px,
      rgba(255,255,255,0.028) 3px
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 4px 4px;
    gap: 3px;
    flex-shrink: 0;
  }

  .mini-card-divider {
    width: 2px;
    background: linear-gradient(180deg, transparent, #b8861a 12%, #e6c46a 50%, #b8861a 88%, transparent);
    flex-shrink: 0;
  }

  .mini-card-right {
    flex: 1;
    background: #fff;
    padding: 6px 8px 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .mini-card-logo {
    height: 15px;
    width: auto;
    opacity: 0.80;
    flex-shrink: 0;
  }

  .mini-card-photo {
    width: 100%;
    flex: 1;
    object-fit: cover;
    object-position: top;
    border-radius: 3px;
    border: 1.5px solid rgba(184,134,26,0.55);
    display: block;
    min-height: 0;
  }

  .mini-card-initiale {
    width: 100%;
    flex: 1;
    border-radius: 3px;
    background: linear-gradient(160deg, #0f5c3a, #1a7a4e);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18pt;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700;
    border: 1.5px solid rgba(184,134,26,0.55);
    min-height: 0;
  }

  .mini-card-qr {
    flex-shrink: 0;
    width: 18mm;
    height: 18mm;
    background: #fff;
    border-radius: 2px;
    padding: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-card-qr img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .mini-card-type {
    font-size: 5.5pt;
    font-weight: 700;
    color: #b8861a;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    line-height: 1;
  }

  .mini-card-asso {
    font-size: 6pt;
    font-weight: 700;
    color: #0a3d28;
    line-height: 1.25;
    margin-top: 1px;
  }

  .mini-card-name {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0a3d28;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mini-card-detail {
    font-size: 6pt;
    color: #555;
    line-height: 1.35;
    margin-top: 1px;
  }

  .mini-card-validity {
    font-size: 5.5pt;
    color: #888;
    letter-spacing: 0.04em;
  }

  .mini-card-validity strong {
    color: #c0392b;
    font-weight: 700;
  }

  .mini-card-stripe {
    height: 7mm;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    padding: 0 8px 0 9px;
    flex-shrink: 0;
  }

  .mini-card-stripe-number {
    font-size: 6.5pt;
    font-family: monospace;
    color: #e6b84a;
    letter-spacing: 0.14em;
    font-weight: 700;
    flex: 1;
  }

  .mini-card-stripe-site {
    font-size: 5pt;
    color: rgba(255,255,255,0.40);
    letter-spacing: 0.08em;
  }

  .print-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0a3d28;
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(10,61,40,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 999;
    transition: background 0.2s;
  }
  .print-btn:hover { background: #0f5c3a; }
`;

const RECU_COMPACT = `
  .doc-header { padding: 13px 26px 10px !important; }
  .doc-header-logo { height: 38px !important; }
  .asso-name { font-size: 12.5pt !important; }
  .asso-sub { font-size: 8pt !important; }
  .gold-bar { height: 3px !important; }
  .doc-body { padding: 13px 30px 10px !important; gap: 9px !important; }
  .doc-title { font-size: 16pt !important; }
  .doc-title-block { padding-bottom: 9px !important; }
  .doc-ref { margin-top: 3px !important; font-size: 7pt !important; }
  .intro-text { font-size: 10pt !important; line-height: 1.4 !important; }
  .info-box { padding: 8px 13px !important; gap: 5px 13px !important; }
  .info-value { font-size: 10pt !important; }
  .info-label { font-size: 7pt !important; }
  .signature-block { gap: 14px !important; padding-top: 10px !important; margin-top: 6px !important; }
  .sig-area { height: 54px !important; }
  .doc-footer { padding: 8px 30px !important; }
  .footer-text { font-size: 7pt !important; }
  .notice-box { padding: 8px 12px !important; }
  .notice-box p { font-size: 9.5pt !important; line-height: 1.4 !important; }
  @media print { .a4 { height: 297mm; } }
`;

function today() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function refNumber(prefix, suffix) {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${suffix}-${ts}`;
}

// ── Overlay partagé ─────────────────────────────────────────────────────────
function _createOverlayShell(filename) {
  document.getElementById("__mbp_overlay")?.remove();
  document.getElementById("__mbp_bar")?.remove();
  document.getElementById("__mbp_frame")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "__mbp_overlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.70);";

  const bar = document.createElement("div");
  bar.id = "__mbp_bar";
  bar.style.cssText = [
    "position:fixed;top:0;left:0;right:0;height:50px",
    "z-index:10000;background:#0a3d28",
    "display:flex;align-items:center;gap:10px;padding:0 16px",
    "box-shadow:0 2px 16px rgba(0,0,0,0.5)",
    "font-family:sans-serif",
  ].join(";");

  const titleEl = document.createElement("span");
  titleEl.style.cssText = "flex:1;font-size:12px;font-weight:600;color:rgba(255,255,255,0.60);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
  titleEl.textContent = filename;
  bar.appendChild(titleEl);

  const frame = document.createElement("iframe");
  frame.id = "__mbp_frame";
  frame.style.cssText = [
    "position:fixed;top:50px;left:50%;transform:translateX(-50%)",
    "width:min(794px,96vw);height:calc(100vh - 50px)",
    "z-index:9999;border:none;background:#fff",
    "box-shadow:0 8px 40px rgba(0,0,0,0.5)",
  ].join(";");

  const remove = () => { overlay.remove(); bar.remove(); frame.remove(); };
  overlay.onclick = (e) => { if (e.target === overlay) remove(); };

  const mkBarBtn = (label, bg, cb) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = label;
    b.style.cssText = [
      `background:${bg};color:#fff`,
      "border:none;border-radius:8px",
      "padding:7px 15px",
      "font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0",
    ].join(";");
    b.onmouseover = () => { b.style.opacity = "0.85"; };
    b.onmouseout  = () => { b.style.opacity = "1"; };
    b.onclick = cb;
    bar.appendChild(b);
    return b;
  };

  document.body.appendChild(overlay);
  document.body.appendChild(bar);
  document.body.appendChild(frame);

  return { frame, remove, mkBarBtn };
}

// ── Ouvre un document HTML généré (attestation, reçu…) ──────────────────────
export function openDoc(html, filename = "document-mbp.html", opts = {}) {
  const origin = window.location.origin;
  const resolved = html
    .replace(/src="\/Logo%20Redesign1\.png"/g, `src="${origin}/Logo%20Redesign1.png"`)
    .replace(/src="\/images\/FDD\.png"/g, `src="${origin}/images/FDD.png"`);

  const { frame, remove, mkBarBtn } = _createOverlayShell(filename);

  const doPrint = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) {} };

  mkBarBtn("✕ Fermer",                "#1a5c38", remove);
  mkBarBtn("🖨 Imprimer / PDF",       "#b8861a", doPrint);
  // « Joindre à un message » n'a de sens que dans le dashboard (qui écoute
  // l'événement et ouvre la composition). Masqué pour les documents publics.
  if (opts.allowAttach !== false) {
    mkBarBtn("📎 Joindre à un message", "#1d4ed8", () => {
      try {
        const b64 = btoa(unescape(encodeURIComponent(resolved)));
        window.dispatchEvent(new CustomEvent("mbp:compose-with-attachment", {
          detail: { name: filename, content: b64 }
        }));
        remove();
      } catch (e) {
        alert("Erreur lors de la préparation de la pièce jointe.");
      }
    });
  }

  frame.onload = () => {
    try {
      const btn = frame.contentDocument.querySelector(".print-btn");
      if (btn) btn.onclick = doPrint;
    } catch (e) {}
  };

  frame.srcdoc = resolved;
}

// ── Ouvre un document HTML statique via son URL (convention, dossier…) ──────
export function openDocUrl(url, filename) {
  const { frame, remove, mkBarBtn } = _createOverlayShell(filename);

  frame.src = url;

  const doPrint = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) {} };

  frame.onload = () => {
    try {
      // Masquer la barre d'aide interne — notre barre parent la remplace
      const hint = frame.contentDocument.getElementById("editHint");
      if (hint) hint.style.display = "none";
    } catch (e) {}
  };

  mkBarBtn("✕ Fermer",                "#1a5c38", remove);
  mkBarBtn("🖨 Imprimer / PDF",       "#b8861a", doPrint);
  mkBarBtn("📎 Joindre à un message", "#1d4ed8", () => {
    try {
      const currentHtml = "<!DOCTYPE html>" + frame.contentDocument.documentElement.outerHTML;
      const b64 = btoa(unescape(encodeURIComponent(currentHtml)));
      window.dispatchEvent(new CustomEvent("mbp:compose-with-attachment", {
        detail: { name: filename, content: b64 }
      }));
      remove();
    } catch (e) {
      alert("Erreur lors de la préparation de la pièce jointe.");
    }
  });
}

export function genererAttestation(member, validUntil) {
  // Ref stable par membre — même QR code pour toujours
  const ref = `ATT-${String(member.id ?? "MBP").toUpperCase()}`;
  const validite = validUntil || `${new Date().getFullYear()}-12-31`;

  // Upsert : crée ou met à jour la validité si l'attestation existe déjà
  supabase.from("attestations").upsert({
    ref,
    member_id: String(member.id ?? ""),
    nom: member.nom,
    statut: member.bureau ? "Membre du Bureau Exécutif" : "Membre actif",
    profession: member.profession ?? null,
    valid_until: validite,
  }, { onConflict: "ref" }).then(({ error }) => {
    if (error) console.error("[attestation save]", error.message);
  });

  const titre = member.bureau ? "membre du Bureau" : "membre actif";
  const localisation = [member.ville, member.pays].filter(Boolean).join(", ");
  const initiale = (member.nom || "M").charAt(0).toUpperCase();

  const photoContent = member.photo
    ? `<img src="${member.photo}" alt="Photo de ${member.nom}"
           style="width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:top;display:block;"
           onerror="this.style.display='none'" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#0a3d28,#1a7a4e);display:flex;align-items:center;justify-content:center;color:#fff;font-size:30pt;font-family:'Cormorant Garamond',serif;font-weight:700;">${initiale}</div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Attestation de membre — ${member.nom}</title>
  <style>${MBP_STYLE}</style>
</head>
<body>
  <button class="no-print print-btn" type="button">
    🖨 Imprimer / Enregistrer PDF
  </button>

  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP"
           onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>

    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Attestation de Membre</div>
        <div class="doc-ref">Réf. ${ref}</div>
      </div>

      <!-- Photo + texte côte à côte -->
      <div style="display:flex;align-items:flex-start;gap:28px;">
        <div class="photo-ring" style="width:100px;height:100px;flex-shrink:0;">
          ${photoContent}
        </div>
        <p class="intro-text" style="flex:1;">
          <strong>L'association Ma Belle Promo (MBP)</strong>, association des diplômés
          de la Faculté de Droit de l'Université de Lomé, promotion 1994–2000,
          atteste par le présent document que
          <strong>${member.nom}</strong> est <strong>${titre}</strong> en règle de ladite association.
        </p>
      </div>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nom complet</span>
          <span class="info-value">${member.nom}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Statut</span>
          <span class="info-value">${member.bureau ? "Membre du Bureau Exécutif" : "Membre actif"}</span>
        </div>
        ${member.profession ? `
        <div class="info-row">
          <span class="info-label">Profession</span>
          <span class="info-value">${member.profession}</span>
        </div>` : ""}
        ${localisation ? `
        <div class="info-row">
          <span class="info-label">Localisation</span>
          <span class="info-value">${localisation}</span>
        </div>` : ""}
        ${member.anneeObtention ? `
        <div class="info-row">
          <span class="info-label">Promotion</span>
          <span class="info-value">${member.anneeObtention} — FDD / Université de Lomé</span>
        </div>` : ""}
        <div class="info-row full-width">
          <span class="info-label">Date de délivrance</span>
          <span class="info-value">${today()}</span>
        </div>
      </div>

      <div class="notice-box">
        <p>
          Cette attestation est délivrée à la demande de l'intéressé(e) pour servir et valoir ce que de droit.
          Elle ne constitue pas un document d'état civil et ne remplace en aucun cas les pièces officielles.
        </p>
      </div>

      <!-- Signatures + carte membre -->
      <div style="display:flex;align-items:flex-end;gap:24px;margin-top:auto;">

        <div class="signature-block" style="flex:1;margin-top:0;padding-top:16px;border-top:1px solid #e0e0e0;">
          <div class="signature-col">
            <span class="sig-label">Émis à Lomé, le</span>
            <div class="sig-area"><span>${today()}</span></div>
            <span class="sig-name">Le Trésorier</span>
            <span class="sig-title">L'association Ma Belle Promo (MBP)</span>
          </div>
          <div class="signature-col">
            <span class="sig-label">Signature et cachet</span>
            <div style="height:80px;display:flex;align-items:center;overflow:visible;">
              <img src="/images/FDD.png" alt="Cachet"
                   style="max-height:100px;max-width:100%;object-fit:contain;display:block;transform:translateX(-1cm) translateY(0.2cm);"
                   onerror="this.style.display='none'" />
            </div>
            <span class="sig-name" style="margin-top:18px;">Fabienne SENAYA-ATAYI</span>
            <span class="sig-title">Présidente — L'association Ma Belle Promo (MBP)</span>
          </div>
        </div>

        <!-- Mini carte membre — Option B Professionnelle -->
        <div class="mini-card">
          <div class="mini-card-inner">
            <div class="mini-card-left">
              <img class="mini-card-logo" src="/Logo%20Redesign1.png" alt="MBP"
                   onerror="this.style.display='none'" />
              ${member.photo
                ? `<img class="mini-card-photo" src="${member.photo}" alt="${member.nom}"
                        onerror="this.style.display='none'" />`
                : `<div class="mini-card-initiale">${initiale}</div>`
              }
              <div class="mini-card-qr">
                <img src="${'https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=' + encodeURIComponent('https://mabellepromo.org/verifier?id=' + ref) + '&bgcolor=ffffff&color=0a3d28&margin=1'}" alt="QR" onerror="this.style.display='none'" />
              </div>
            </div>
            <div class="mini-card-divider"></div>
            <div class="mini-card-right">
              <div>
                <div class="mini-card-type">Carte de Membre</div>
                <div class="mini-card-asso">L'association Ma Belle Promo (MBP)<br/>Lomé · 1994–2000</div>
              </div>
              <div>
                <div class="mini-card-name">${member.nom}</div>
                <div class="mini-card-detail">
                  ${member.profession ? `${member.profession}<br/>` : ""}
                  ${member.bureau ? "Membre du Bureau Exécutif" : "Membre actif"}
                </div>
              </div>
            </div>
          </div>
          <div class="mini-card-stripe">
            <span class="mini-card-stripe-number">${ref}</span>
            <span class="mini-card-stripe-site">mabellepromo.org</span>
          </div>
        </div>

      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right">
        Ce document est officiel et authentique.<br/>
        Pour vérification : contact@mabellepromo.org
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Attestation-MBP-${member.nom.replace(/\s+/g, "-")}.html`);
}

// ── Fiche d'affectation bénévole ↔ mission (impression / PDF) ────────────────
// Identique pour une candidature ou une fiche admin : on reçoit déjà les libellés
// résolus (nom du bénévole, titre de mission, statut affiché…) depuis le dashboard.
export function genererFicheAffectation(a) {
  const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const row = (label, value) => value
    ? `<tr>
         <td style="padding:7px 0;font-size:11pt;color:#2a6040;font-weight:600;width:38%;vertical-align:top;">${label}</td>
         <td style="padding:7px 0;font-size:11pt;color:#0a1f12;">${value}</td>
       </tr>`
    : "";
  const sourceLabel = a.source === "CANDIDATE" ? "Candidature en ligne" : "Fiche bénévole (bureau)";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fiche d'affectation — ${a.volunteer_nom || "Bénévole"}</title>
  <style>${MBP_STYLE}</style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>

  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>

    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Fiche d'affectation bénévole</div>
        <div class="doc-ref">Statut : ${a.assignment_status_label || a.assignment_status || "—"}</div>
      </div>

      <h3 style="font-family:'Cormorant Garamond',serif;font-size:15pt;color:#0a1f12;margin:18px 0 6px;border-bottom:2px solid #f0a030;padding-bottom:4px;">Mission</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Intitulé de la mission", a.mission_titre)}
        ${row("Responsable", a.mission_responsable)}
        ${row("Rôle confié", `<strong>${a.assigned_role || "—"}</strong>`)}
        ${row("Date d'affectation", fmtDate(a.assigned_date))}
        ${row("Période", (a.start_date || a.end_date) ? `${fmtDate(a.start_date)} → ${fmtDate(a.end_date)}` : "")}
      </table>

      <h3 style="font-family:'Cormorant Garamond',serif;font-size:15pt;color:#0a1f12;margin:22px 0 6px;border-bottom:2px solid #f0a030;padding-bottom:4px;">Bénévole</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Nom", `<strong>${a.volunteer_nom || "—"}</strong>`)}
        ${row("Origine", sourceLabel)}
        ${row("Email", a.volunteer_email)}
        ${row("Téléphone", a.volunteer_tel)}
      </table>

      ${a.admin_notes ? `
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:15pt;color:#0a1f12;margin:22px 0 6px;border-bottom:2px solid #f0a030;padding-bottom:4px;">Notes</h3>
      <p style="font-size:11pt;color:#0a1f12;line-height:1.6;white-space:pre-wrap;">${a.admin_notes}</p>` : ""}

      <div style="margin-top:46px;display:flex;justify-content:space-between;gap:40px;">
        <div style="flex:1;border-top:1px solid #2a6040;padding-top:6px;font-size:10pt;color:#2a6040;">Le bénévole</div>
        <div style="flex:1;border-top:1px solid #2a6040;padding-top:6px;font-size:10pt;color:#2a6040;text-align:right;">Le Bureau Exécutif</div>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right">
        Document interne d'affectation.<br/>
        Contact : contact@mabellepromo.org
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Fiche-affectation-${(a.volunteer_nom || "benevole").replace(/\s+/g, "-")}.html`);
}

// ── Helpers partagés pour les fiches bénévolat ──────────────────────────────
const _escDoc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const _fmtDocDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";
const _docRow = (label, value) =>
  (value && value !== "—")
    ? `<tr>
         <td style="padding:6px 0;font-size:11pt;color:#2a6040;font-weight:600;width:38%;vertical-align:top;">${label}</td>
         <td style="padding:6px 0;font-size:11pt;color:#0a1f12;">${value}</td>
       </tr>`
    : "";
const _docH3 = (txt) =>
  `<h3 style="font-family:'Cormorant Garamond',serif;font-size:15pt;color:#0a1f12;margin:20px 0 6px;border-bottom:2px solid #f0a030;padding-bottom:4px;">${txt}</h3>`;

function _ficheShell(title, ref, bodyInner, filename) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${MBP_STYLE}</style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">
    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>
    <div class="doc-body">
      <div class="doc-title-block">
        <div class="doc-title">${title}</div>
        ${ref ? `<div class="doc-ref">${ref}</div>` : ""}
      </div>
      ${bodyInner}
    </div>
    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right">
        Document interne.<br/>
        Contact : contact@mabellepromo.org
      </div>
    </div>
  </div>
</body>
</html>`;
  openDoc(html, filename);
}

// ── Fiche de candidature bénévole (impression / PDF) ────────────────────────
export function genererFicheCandidature(c) {
  const e = _escDoc;
  const yn = (b) => b ? "Oui" : "Non";
  const periode = (c.start_date) ? _fmtDocDate(c.start_date) : "";
  const univ = c.university
    ? `${e(labelOf(UNIVERSITIES, c.university))}${c.study_year ? " · " + e(labelOf(STUDY_YEARS, c.study_year)) : ""}`
    : "";

  const body = `
    ${_docH3("Identification")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Nom complet", `<strong>${e(c.full_name)}</strong>`)}
      ${_docRow("Profil", e(labelOf(PROFILE_TYPES, c.profile_type)))}
      ${_docRow("Email", e(c.email))}
      ${_docRow("Téléphone", e(c.phone))}
      ${_docRow("Pays", e(labelOf(COUNTRIES, c.country_code)))}
      ${_docRow("Titre / Poste", e(c.current_title))}
      ${_docRow("Lien professionnel", c.professional_link ? `<a href="${e(c.professional_link)}">${e(c.professional_link)}</a>` : "")}
      ${_docRow("Université", univ)}
      ${_docRow("Spécialité", e(c.study_field))}
    </table>

    ${_docH3("Profil professionnel")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Domaines d'expertise", e(labelsOf(EXPERTISE_DOMAINS, c.expertise_domains)))}
      ${_docRow("Années d'expérience", c.years_experience != null ? `${c.years_experience} an(s)` : "")}
      ${_docRow("Secteur d'emploi", c.employment_sector ? e(labelOf(EMPLOYMENT_SECTORS, c.employment_sector)) : "")}
      ${_docRow("Langues", e(labelsOf(LANGUAGES, c.languages)))}
      ${_docRow("Compétences", e(c.skills_description))}
    </table>

    ${_docH3("Mission & disponibilité")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Projet visé", e(labelOf(PROJECT_INTERESTS, c.project_interest)))}
      ${_docRow("Domaines d'action", e(labelsOf(MISSION_TYPES, c.mission_types)))}
      ${_docRow("Engagement", e(labelOf(ENGAGEMENT_LEVELS, c.engagement_level)))}
      ${_docRow("Durée envisagée", c.engagement_duration ? e(labelOf(ENGAGEMENT_DURATIONS, c.engagement_duration)) : "")}
      ${_docRow("Date de début", periode)}
      ${_docRow("Horaires", c.preferred_schedule ? e(labelOf(PREFERRED_SCHEDULES, c.preferred_schedule)) : "")}
      ${_docRow("Modalité", e(labelOf(MODALITIES, c.modality)))}
      ${_docRow("Fuseau horaire", c.timezone ? e(labelOf(TIMEZONES, c.timezone)) : "")}
      ${_docRow("Dispo événements", c.available_for_events ? "Oui" : "")}
    </table>

    ${_docH3("Origine & motivation")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Connu via", e(labelOf(REFERRAL_SOURCES, c.referral_source)))}
      ${_docRow("Recommandé par", e(c.referred_by))}
    </table>
    ${c.motivation ? `<p style="font-size:11pt;color:#0a1f12;line-height:1.6;margin-top:6px;white-space:pre-wrap;font-style:italic;">« ${e(c.motivation)} »</p>` : ""}

    ${_docH3("Consentements")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Contact", yn(c.consent_contact))}
      ${_docRow("Charte du bénévole", c.charter_version ? `Acceptée (${e(c.charter_version)})${c.charter_accepted_at ? " le " + _fmtDocDate((c.charter_accepted_at || "").slice(0, 10)) : ""}` : yn(c.consent_charter))}
      ${_docRow("Traitement RGPD", yn(c.consent_data))}
      ${_docRow("Visibilité communauté", yn(c.consent_visibility))}
      ${_docRow("Newsletter", c.consent_newsletter ? `Oui${c.newsletter_frequency ? " (" + e(labelOf(NEWSLETTER_FREQUENCIES, c.newsletter_frequency)) + ")" : ""}` : "Non")}
      ${_docRow("Vérification antécédents", yn(c.consent_background_check))}
    </table>`;

  const ref = `Candidature reçue le ${_fmtDocDate((c.created_at || "").slice(0, 10)) || "—"}`;
  _ficheShell(`Fiche de candidature — ${e(c.full_name)}`, ref, body, `Candidature-${String(c.full_name || "benevole").replace(/\s+/g, "-")}.html`);
}

// ── Fiche bénévole (impression / PDF) ───────────────────────────────────────
export function genererFicheBenevole(b) {
  const e = _escDoc;
  const STATUT = { actif: "Actif", inactif: "Inactif", ponctuel: "Ponctuel" };
  const body = `
    ${_docH3("Bénévole")}
    <table style="width:100%;border-collapse:collapse;">
      ${_docRow("Nom complet", `<strong>${e(b.nom)}</strong>`)}
      ${_docRow("Statut", e(STATUT[b.statut] || b.statut))}
      ${_docRow("Email", e(b.email))}
      ${_docRow("Téléphone", e(b.telephone))}
      ${_docRow("Compétences", e(b.competences))}
      ${_docRow("Disponibilité", e(b.disponibilite))}
      ${_docRow("Engagé depuis", _fmtDocDate(b.date_engagement))}
    </table>
    ${b.notes ? `${_docH3("Notes")}<p style="font-size:11pt;color:#0a1f12;line-height:1.6;white-space:pre-wrap;">${e(b.notes)}</p>` : ""}`;

  _ficheShell(`Fiche bénévole — ${e(b.nom)}`, null, body, `Fiche-benevole-${String(b.nom || "benevole").replace(/\s+/g, "-")}.html`);
}

// ── Charte de bénévolat (impression / PDF, document multi-pages en flux) ────
export function genererCharteBenevolat() {
  const e = _escDoc;
  const year = new Date().getFullYear();
  const tags = ["Solidarité", "Intégrité", "Excellence", "Inclusion", "Responsabilité", "Flexibilité"];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Charte de bénévolat — Ma Belle Promo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --vert: #1b6b45; --vert-clair: #e8f5ee; --vert-fonce: #0f3d28;
      --or: #9a7118; --or-vif: #c8960a; --or-clair: #fdf6e3;
      --texte: #1a1a1a; --gris: #555;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    @page { size: A4 portrait; margin: 15mm 0; }
    @page :first { margin: 0; }
    body { font-family: "Lato", Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: var(--texte); background: #9aa4a8; padding: 24px 0; }
    .no-print.print-btn { position: fixed; top: 16px; right: 16px; z-index: 10; background: var(--or-vif); color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-family: "Lato", sans-serif; }
    @media print { body { background: #fff; padding: 0; } .no-print { display: none !important; } .a4 { width: 100%; box-shadow: none; margin: 0; } }
    .a4 { width: 210mm; margin: 0 auto; background: #fff; box-shadow: 0 6px 32px rgba(0,0,0,0.35); }

    /* Couverture */
    .cover { width: 210mm; min-height: 297mm; display: flex; flex-direction: column; background: var(--vert-fonce); color: #fff; overflow: hidden; page-break-after: always; break-after: page; }
    .cover-band { height: 5pt; background: linear-gradient(to right, var(--or), #e6c84a 50%, var(--or)); }
    .cover-inner { flex: 1; display: flex; flex-direction: column; padding: 40pt 46pt; position: relative; }
    .cover-pattern { position: absolute; inset: 0; pointer-events: none; opacity: 0.04; background-image: repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 18px), repeating-linear-gradient(-45deg,#fff 0,#fff 1px,transparent 1px,transparent 18px); }
    .cover-logo { height: 62pt; align-self: flex-start; margin-bottom: 40pt; position: relative; }
    .cover-eyebrow { font-family: "Cormorant Garamond", serif; font-size: 9pt; letter-spacing: 0.30em; text-transform: uppercase; color: var(--or-vif); margin-bottom: 10pt; position: relative; }
    .cover-title { font-family: "Cormorant Garamond", serif; font-size: 48pt; font-weight: 700; line-height: 1.04; margin: 0 0 10pt; position: relative; }
    .cover-title span { color: var(--or-vif); }
    .cover-subtitle { font-family: "Cormorant Garamond", serif; font-size: 16pt; font-style: italic; color: rgba(255,255,255,0.65); margin-bottom: 32pt; position: relative; }
    .cover-divider { width: 60pt; height: 2pt; background: linear-gradient(to right, var(--or-vif), transparent); margin-bottom: 26pt; position: relative; }
    .cover-pitch { font-size: 11pt; color: rgba(255,255,255,0.82); line-height: 1.7; margin-bottom: auto; position: relative; }
    .cover-tags { display: flex; flex-wrap: wrap; gap: 8pt; margin-top: 30pt; position: relative; }
    .cover-tag { font-size: 8pt; letter-spacing: 0.10em; text-transform: uppercase; border: 1pt solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.65); padding: 4pt 10pt; border-radius: 20pt; }
    .cover-footer { border-top: 1pt solid rgba(255,255,255,0.12); padding-top: 16pt; margin-top: 30pt; display: flex; align-items: center; justify-content: space-between; position: relative; }
    .cover-footer p { font-size: 8pt; color: rgba(255,255,255,0.42); margin: 0; }
    .cover-badge { background: var(--or); color: #fff; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; padding: 4pt 12pt; border-radius: 2pt; }

    /* Contenu */
    .doc-content { padding: 0 15mm; }
    .content-head { background: var(--vert-fonce); padding: 10pt 16pt; display: flex; align-items: center; justify-content: space-between; border-radius: 4pt 4pt 0 0; }
    .content-head img { height: 22pt; }
    .content-head span { font-family: "Cormorant Garamond", serif; font-size: 7.5pt; letter-spacing: 0.20em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
    .content-gold { height: 3pt; background: linear-gradient(to right, var(--or), #e6c84a 50%, var(--or)); }
    .content-body { padding: 24pt 0 0; }
    .eyebrow { font-size: 7.5pt; letter-spacing: 0.25em; text-transform: uppercase; color: var(--or-vif); margin-bottom: 5pt; display: block; }
    .s-title { font-family: "Cormorant Garamond", serif; font-size: 21pt; font-weight: 700; color: var(--vert-fonce); margin: 0 0 5pt; line-height: 1.1; break-after: avoid; }
    .s-rule { width: 40pt; height: 2pt; background: linear-gradient(to right, var(--or-vif), transparent); margin-bottom: 14pt; }
    .intro { font-size: 10.5pt; color: #333; line-height: 1.75; text-align: justify; margin-bottom: 10pt; }
    .pull-quote { border-left: 3pt solid var(--or-vif); padding: 10pt 16pt; margin: 14pt 0 22pt; background: var(--or-clair); border-radius: 0 4pt 4pt 0; break-inside: avoid; }
    .pull-quote p { font-family: "Cormorant Garamond", serif; font-size: 13pt; font-style: italic; color: var(--vert-fonce); margin: 0; line-height: 1.5; }
    .c-section { margin-top: 20pt; }
    .sub-title { font-family: "Cormorant Garamond", serif; font-size: 13pt; font-weight: 700; color: var(--vert); margin: 13pt 0 5pt; break-after: avoid; }
    .c-list { list-style: none; margin: 0 0 6pt; padding: 0; }
    .c-list li { position: relative; padding-left: 16pt; margin-bottom: 5pt; font-size: 10pt; color: #2c2c2c; line-height: 1.55; break-inside: avoid; }
    .c-list li::before { content: ""; position: absolute; left: 2pt; top: 6pt; width: 5pt; height: 5pt; border-radius: 50%; background: var(--or-vif); }
    .sign-card { margin-top: 26pt; background: var(--vert-clair); border: 1pt solid rgba(27,107,69,0.2); border-radius: 8pt; padding: 16pt 20pt; break-inside: avoid; }
    .sign-card > p { font-size: 10pt; color: var(--vert-fonce); margin: 0; }
    .sign-lines { margin-top: 28pt; display: flex; justify-content: space-between; gap: 40pt; font-size: 9pt; color: var(--gris); }
    .sign-lines div { flex: 1; border-top: 1pt solid #999; padding-top: 6pt; }
    .end-foot { margin-top: 22pt; text-align: center; font-size: 8pt; color: #999; border-top: 1pt solid #e5e5e5; padding-top: 10pt; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>

  <div class="a4">

    <!-- Couverture -->
    <div class="cover">
      <div class="cover-band"></div>
      <div class="cover-inner">
        <div class="cover-pattern"></div>
        <img src="/Logo%20Redesign1.png" alt="Logo Ma Belle Promo" class="cover-logo" onerror="this.style.display='none'" />
        <span class="cover-eyebrow">Charte du bénévole · ${e(CHARTE_VERSION)}</span>
        <h1 class="cover-title">Charte de<br><span>Bénévolat</span></h1>
        <p class="cover-subtitle">Nos engagements réciproques</p>
        <div class="cover-divider"></div>
        <p class="cover-pitch">${e(CHARTE.preambule[0])}</p>
        <div class="cover-tags">${tags.map((t) => `<span class="cover-tag">${e(t)}</span>`).join("")}</div>
        <div class="cover-footer">
          <p>mabellepromo.org &nbsp;·&nbsp; Lomé, République du Togo</p>
          <span class="cover-badge">Version ${e(CHARTE_VERSION)}</span>
        </div>
      </div>
      <div class="cover-band"></div>
    </div>

    <!-- Contenu -->
    <div class="doc-content">
    <div class="content-head">
      <img src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <span>Charte de bénévolat · en vigueur au ${e(CHARTE_DATE)}</span>
    </div>
    <div class="content-gold"></div>

    <div class="content-body">
      <span class="eyebrow">Préambule</span>
      <h2 class="s-title">Le bénévolat chez MBP</h2>
      <div class="s-rule"></div>
      ${CHARTE.preambule.slice(0, 3).map((p) => `<p class="intro">${e(p)}</p>`).join("")}
      <div class="pull-quote"><p>${e(CHARTE.preambule[3])}</p></div>

      ${CHARTE.sections.map((s) => `
        <section class="c-section">
          <span class="eyebrow">Section ${s.num}</span>
          <h2 class="s-title">${e(s.title)}</h2>
          <div class="s-rule"></div>
          ${s.subs.map((sub) => `
            <h3 class="sub-title">${e(sub.title)}</h3>
            <ul class="c-list">${sub.items.map((it) => `<li>${e(it)}</li>`).join("")}</ul>
          `).join("")}
        </section>`).join("")}

      <div class="sign-card">
        <p><strong>Acceptation —</strong> Je reconnais avoir lu et compris la présente charte (version ${e(CHARTE_VERSION)}) et je m'engage à la respecter.</p>
        <div class="sign-lines">
          <div>Nom &amp; signature du bénévole</div>
          <div style="text-align:right;">Date : __________________</div>
        </div>
      </div>

      <div class="end-foot">© ${year} l'association Ma Belle Promo (MBP) · Lomé, Togo · mabellepromo.org · contact@mabellepromo.org</div>
    </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, "Charte-benevolat-MBP.html", { allowAttach: false });
}

export function genererRecu(member, annee, montant, datePaiement, modePaiement, montantAttendu, versements, statut) {
  const ref = refNumber("REC", String(member.id ?? "").slice(0, 6).toUpperCase() || "MBP");

  const MODES = {
    virement:  "Virement bancaire",
    tmoney:    "TMoney",
    flooz:     "Flooz",
    especes:   "Espèces",
    cheque:    "Chèque",
    autre:     "Autre",
  };
  const modeLabel   = MODES[modePaiement] || modePaiement || "—";
  const montantNum  = Number(montant) || 0;
  const attenduNum  = Number(montantAttendu) || 0;
  const modeFormate = modeLabel;

  const dateFormatee = datePaiement
    ? new Date(datePaiement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : today();

  const versementsHTML = (() => {
    if (!Array.isArray(versements) || versements.length <= 1) return "";
    const rows = versements.map(v => `
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e0e0;font-size:9pt;">
          ${new Date(v.date).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
        </td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e0e0;font-size:9pt;text-align:right;">
          ${Number(v.montant).toLocaleString("fr-FR")} F CFA
        </td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e0e0;font-size:9pt;">
          ${MODES[v.mode] || v.mode || "—"}
        </td>
      </tr>`).join("");
    return `
      <div style="margin-top:2px;">
        <p style="font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#0a3d28;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">
          Détail des versements
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;">
          <thead>
            <tr style="background:#f7faf8;">
              <th style="padding:5px 8px;font-size:7.5pt;text-align:left;color:#666;">Date</th>
              <th style="padding:5px 8px;font-size:7.5pt;text-align:right;color:#666;">Montant</th>
              <th style="padding:5px 8px;font-size:7.5pt;text-align:left;color:#666;">Mode</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  })();

  const montantHTML = (() => {
    const isPartiel = statut === "partiel";
    const resteNum  = attenduNum > 0 ? Math.max(0, attenduNum - montantNum) : 0;
    return `
      <div style="background:linear-gradient(135deg,#0a3d28,#1a7a4e);border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <p style="font-family:'Lato',sans-serif;font-size:7.5pt;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px;">
            Montant reçu
          </p>
          <p style="font-family:'Cormorant Garamond',serif;font-size:22pt;font-weight:700;color:#e6b84a;line-height:1;">
            ${montantNum.toLocaleString("fr-FR")} F CFA
          </p>
        </div>
        ${isPartiel && attenduNum > 0 ? `
        <div style="text-align:right;">
          <p style="font-family:'Lato',sans-serif;font-size:7pt;color:rgba(255,255,255,0.55);margin-bottom:2px;">Attendu / Reste</p>
          <p style="font-family:'Lato',sans-serif;font-size:9pt;color:rgba(255,255,255,0.80);">
            ${attenduNum.toLocaleString("fr-FR")} F CFA · Solde : ${resteNum.toLocaleString("fr-FR")} F CFA
          </p>
        </div>` : ""}
      </div>`;
  })();

  const noticeHTML = statut === "partiel"
    ? `<div class="notice-box"><p>Paiement partiel — un solde reste dû. Ce reçu ne vaut pas quittance définitive.</p></div>`
    : `<div class="notice-box"><p>Paiement intégral reçu. Ce document vaut quittance définitive pour l'exercice ${annee}.</p></div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reçu de cotisation ${annee} — ${member.nom}</title>
  <style>${MBP_STYLE}</style><style>${RECU_COMPACT}</style>
</head>
<body>
  <button class="no-print print-btn" type="button">
    🖨 Imprimer / Enregistrer PDF
  </button>

  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP"
           onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>

    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Reçu de Cotisation</div>
        <div class="doc-ref">Réf. ${ref} · Exercice ${annee}</div>
      </div>

      <p class="intro-text">
        <strong>L'association Ma Belle Promo (MBP)</strong> accuse réception du paiement de la cotisation annuelle
        pour l'exercice <strong>${annee}</strong>, versé par :
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Membre</span>
          <span class="info-value">${member.nom}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date de paiement</span>
          <span class="info-value">${dateFormatee}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mode de paiement</span>
          <span class="info-value">${modeFormate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Numéro de reçu</span>
          <span class="info-value">${ref}</span>
        </div>
      </div>

      ${versementsHTML}
      ${montantHTML}
      ${noticeHTML}

      <div class="signature-block">
        <div class="signature-col">
          <span class="sig-label">Émis à Lomé, le</span>
          <div class="sig-area"><span>${today()}</span></div>
          <span class="sig-name">Le Trésorier</span>
          <span class="sig-title">L'association Ma Belle Promo (MBP)</span>
        </div>
        <div class="signature-col">
          <span class="sig-label">Signature et cachet</span>
          <div style="height:100px;display:flex;align-items:center;overflow:visible;">
            <img src="/images/FDD.png" alt="Signature et cachet"
                 style="max-height:120px;max-width:100%;object-fit:contain;display:block;transform:translateX(-1cm) translateY(0.2cm);"
                 onerror="this.style.display='none'" />
          </div>
          <span class="sig-name" style="margin-top:20px;">Fabienne SENAYA-ATAYI</span>
          <span class="sig-title">Présidente — L'association Ma Belle Promo (MBP)</span>
        </div>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Document généré le ${today()} · Réf. ${ref}
      </div>
      <div class="footer-text" style="text-align:right">
        Ce document est officiel et authentique.<br/>
        Pour vérification : contact@mabellepromo.org
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Recu-MBP-${annee}-${member.nom.replace(/\s+/g, "-")}.html`);
}

export function genererTrombinoscope(members) {
  const ref = refNumber("TRB", "MBP");
  const actifs = (members ?? []).filter(m => m.status !== "pending");

  const cartes = actifs.map(m => {
    const initiale = (m.nom || "M").charAt(0).toUpperCase();
    const photoHtml = m.photo
      ? `<img src="${m.photo}" alt="${m.nom}" style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:50%;display:block;" onerror="this.style.display='none'" />`
      : `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#0a3d28,#1a7a4e);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22pt;font-family:'Cormorant Garamond',serif;font-weight:700;">${initiale}</div>`;
    return `
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 10px;border:1px solid #e2e8f0;border-radius:10px;break-inside:avoid;">
        <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2.5px solid #b8861a;padding:2px;background:linear-gradient(135deg,#f9f3e3,#fff);flex-shrink:0;margin-bottom:8px;">
          ${photoHtml}
        </div>
        <p style="font-family:'Lato',sans-serif;font-size:8.5pt;font-weight:700;color:#0f172a;line-height:1.2;margin:0 0 2px;">${m.nom}</p>
        ${m.profession ? `<p style="font-family:'Lato',sans-serif;font-size:7pt;color:#64748b;line-height:1.2;margin:0 0 3px;">${m.profession}</p>` : ""}
        ${m.bureau ? `<span style="font-size:6.5pt;font-weight:700;color:#b8861a;background:#fffbeb;border:1px solid #fde68a;padding:1px 6px;border-radius:99px;">Bureau</span>` : ""}
        ${(m.ville || m.pays) ? `<p style="font-family:'Lato',sans-serif;font-size:6.5pt;color:#94a3b8;margin-top:3px;">${[m.ville,m.pays].filter(Boolean).join(", ")}</p>` : ""}
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Trombinoscope — L'association Ma Belle Promo (MBP)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Lato:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { size:A4 portrait; margin:15mm 12mm; }
    body { font-family:'Lato',sans-serif; background:#f0f0f0; padding:20px 0 40px; }
    @media print { body { background:#fff; padding:0; } .no-print { display:none!important; } }
    .header { background:linear-gradient(135deg,#0a3d28,#1a7a4e); padding:16px 24px; display:flex; align-items:center; justify-content:space-between; border-radius:8px 8px 0 0; margin-bottom:0; }
    .gold-bar { height:3px; background:linear-gradient(to right,#b8861a,#e6b84a,#b8861a); margin-bottom:16px; }
    .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .footer { margin-top:16px; display:flex; justify-content:space-between; font-size:7pt; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:8px; }
    .print-btn { position:fixed; bottom:24px; right:24px; background:#0a3d28; color:#fff; border:none; border-radius:50px; padding:12px 24px; font-family:'Lato',sans-serif; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 16px rgba(10,61,40,.4); z-index:999; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="header">
    <img src="/Logo%20Redesign1.png" alt="MBP" style="height:40px;width:auto;" onerror="this.style.display='none'" />
    <div style="text-align:right;">
      <p style="font-family:'Cormorant Garamond',serif;font-size:14pt;font-weight:700;color:#fff;line-height:1.2;">L'association Ma Belle Promo (MBP)</p>
      <p style="font-size:8pt;color:rgba(255,255,255,0.65);">Trombinoscope — ${actifs.length} membres · Promotion 1994–2000</p>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="grid">${cartes}</div>
  <div class="footer">
    <span>L'association Ma Belle Promo (MBP) · www.mabellepromo.org</span>
    <span>Réf. ${ref} · Généré le ${today()}</span>
  </div>
</body>
</html>`;

  openDoc(html, `Trombinoscope-MBP-${new Date().getFullYear()}.html`);
}

export function genererRapportFinancier(annee, rows, montantDefaut, stats) {
  const ref = refNumber("RAP", String(annee));
  const totalAttendu = (stats.total_membres - (stats.exemptes ?? 0)) * Number(montantDefaut);
  const taux = totalAttendu > 0 ? Math.round(((stats.total || 0) / totalAttendu) * 100) : 0;

  const STATUT_COLOR = {
    "payé":       { bg: "#d1fae5", color: "#065f46", label: "Payé" },
    "partiel":    { bg: "#dbeafe", color: "#1e40af", label: "Partiel" },
    "en_attente": { bg: "#fef3c7", color: "#92400e", label: "En attente" },
    "exempté":    { bg: "#f1f5f9", color: "#475569", label: "Exempté" },
  };

  const lignes = (rows ?? []).map((m, i) => {
    const cfg = STATUT_COLOR[m.statut] ?? STATUT_COLOR["en_attente"];
    const montant = m.cotisation?.montant ? Number(m.cotisation.montant).toLocaleString("fr-FR") + " F" : "—";
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"};">
      <td style="padding:6px 10px;font-size:8.5pt;border-bottom:1px solid #e2e8f0;">${i + 1}</td>
      <td style="padding:6px 10px;font-size:8.5pt;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">${m.nom || "—"}</td>
      <td style="padding:6px 10px;font-size:8pt;color:#64748b;border-bottom:1px solid #e2e8f0;">${m.profession || "—"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">
        <span style="background:${cfg.bg};color:${cfg.color};font-size:7.5pt;font-weight:700;padding:2px 8px;border-radius:99px;">${cfg.label}</span>
      </td>
      <td style="padding:6px 10px;font-size:8.5pt;font-weight:600;color:#0a3d28;border-bottom:1px solid #e2e8f0;text-align:right;">${montant}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport Financier ${annee} — FDD MBP</title>
  <style>${MBP_STYLE}</style>
  <style>
    .stat-card { background:#f7faf8;border:1px solid #c8ddd2;border-radius:8px;padding:14px 18px;text-align:center; }
    .stat-card .val { font-family:'Cormorant Garamond',serif;font-size:20pt;font-weight:700;color:#0a3d28;line-height:1; }
    .stat-card .lbl { font-size:7.5pt;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px; }
    table { width:100%;border-collapse:collapse; }
    thead th { background:#0a3d28;color:#fff;font-family:'Lato',sans-serif;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:8px 10px;text-align:left; }
    thead th:last-child { text-align:right; }
    @media print { .a4 { height:297mm; } }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Rapport Financier ${annee}</div>
        <div class="doc-ref">Réf. ${ref} · Généré le ${today()}</div>
      </div>

      <!-- Stats synthèse -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">
        <div class="stat-card">
          <div class="val" style="color:#065f46;">${stats.payes ?? 0}</div>
          <div class="lbl">Payés</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#1e40af;">${stats.partiels ?? 0}</div>
          <div class="lbl">Partiels</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#92400e;">${stats.enAttente ?? 0}</div>
          <div class="lbl">En attente</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#475569;">${stats.exemptes ?? 0}</div>
          <div class="lbl">Exemptés</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#b8861a;">${taux}%</div>
          <div class="lbl">Taux</div>
        </div>
      </div>

      <!-- Montant collecté -->
      <div style="background:linear-gradient(135deg,#0a3d28,#1a7a4e);border-radius:8px;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="font-family:'Lato',sans-serif;font-size:7.5pt;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px;">Total collecté</p>
          <p style="font-family:'Cormorant Garamond',serif;font-size:22pt;font-weight:700;color:#e6b84a;line-height:1;">
            ${(stats.total || 0).toLocaleString("fr-FR")} F CFA
          </p>
        </div>
        <div style="text-align:right;">
          <p style="font-family:'Lato',sans-serif;font-size:7pt;color:rgba(255,255,255,0.55);margin-bottom:2px;">Cotisation par membre</p>
          <p style="font-family:'Lato',sans-serif;font-size:9pt;color:rgba(255,255,255,0.80);">${Number(montantDefaut).toLocaleString("fr-FR")} F CFA</p>
          <p style="font-family:'Lato',sans-serif;font-size:7pt;color:rgba(255,255,255,0.45);margin-top:2px;">Attendu : ${totalAttendu.toLocaleString("fr-FR")} F CFA</p>
        </div>
      </div>

      <!-- Table membres -->
      <div style="overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;flex:1;">
        <table>
          <thead>
            <tr>
              <th style="width:32px;">#</th>
              <th>Nom</th>
              <th>Profession</th>
              <th style="text-align:center;">Statut</th>
              <th style="text-align:right;">Montant</th>
            </tr>
          </thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right;">
        Document interne — confidentiel<br/>
        Généré le ${today()} · Réf. ${ref}
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Rapport-Financier-MBP-${annee}.html`);
}

export function genererRapportTresorerie(annee, transactions, budget = []) {
  const ref = refNumber("TRE", String(annee));
  const fmt = n => new Intl.NumberFormat("fr-FR").format(Math.abs(n)) + " F CFA";

  const recettes = transactions.filter(t => t.type === "recette");
  const depenses = transactions.filter(t => t.type === "depense");
  const totalRec = recettes.reduce((s, t) => s + Number(t.montant), 0);
  const totalDep = depenses.reduce((s, t) => s + Number(t.montant), 0);
  const solde = totalRec - totalDep;

  const byCategorie = (list) => {
    const map = {};
    list.forEach(t => {
      map[t.categorie] = (map[t.categorie] || 0) + Number(t.montant);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const lignesRecettes = byCategorie(recettes).map(([cat, montant]) => {
    const bud = budget.find(b => b.categorie === cat && b.type === "recette");
    const prevu = bud ? Number(bud.montant_prevu) : null;
    const ecart = prevu !== null ? montant - prevu : null;
    return `<tr>
      <td style="padding:5px 10px;font-size:8.5pt;color:#0f172a;">${cat}</td>
      <td style="padding:5px 10px;font-size:8.5pt;text-align:right;font-weight:600;color:#065f46;">${fmt(montant)}</td>
      <td style="padding:5px 10px;font-size:8pt;text-align:right;color:#94a3b8;">${prevu !== null ? fmt(prevu) : "—"}</td>
      <td style="padding:5px 10px;font-size:8pt;text-align:right;color:${ecart === null ? "#94a3b8" : ecart >= 0 ? "#059669" : "#dc2626"};">
        ${ecart === null ? "—" : (ecart >= 0 ? "+" : "−") + fmt(ecart)}
      </td>
    </tr>`;
  }).join("");

  const lignesDepenses = byCategorie(depenses).map(([cat, montant]) => {
    const bud = budget.find(b => b.categorie === cat && b.type === "depense");
    const prevu = bud ? Number(bud.montant_prevu) : null;
    const ecart = prevu !== null ? prevu - montant : null;
    return `<tr>
      <td style="padding:5px 10px;font-size:8.5pt;color:#0f172a;">${cat}</td>
      <td style="padding:5px 10px;font-size:8.5pt;text-align:right;font-weight:600;color:#dc2626;">${fmt(montant)}</td>
      <td style="padding:5px 10px;font-size:8pt;text-align:right;color:#94a3b8;">${prevu !== null ? fmt(prevu) : "—"}</td>
      <td style="padding:5px 10px;font-size:8pt;text-align:right;color:${ecart === null ? "#94a3b8" : ecart >= 0 ? "#059669" : "#dc2626"};">
        ${ecart === null ? "—" : (ecart >= 0 ? "+" : "−") + fmt(ecart)}
      </td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport de Trésorerie ${annee} — FDD MBP</title>
  <style>${MBP_STYLE}</style>
  <style>
    table { width:100%;border-collapse:collapse; }
    thead th { background:#0a3d28;color:#fff;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:8px 10px; }
    thead th:not(:first-child) { text-align:right; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    tbody tr:last-child td { border-top:2px solid #cbd5e1;font-weight:700; }
    .section-title { font-family:'Cormorant Garamond',serif;font-size:11pt;font-weight:700;color:#0a3d28;margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid #e2e8f0; }
    .stat-card { background:#f7faf8;border:1px solid #c8ddd2;border-radius:8px;padding:12px 16px;text-align:center; }
    .stat-card .val { font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:700;line-height:1; }
    .stat-card .lbl { font-size:7pt;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-top:3px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Rapport de Trésorerie ${annee}</div>
        <div class="doc-ref">Réf. ${ref} · Généré le ${today()}</div>
      </div>

      <!-- Synthèse -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">
        <div class="stat-card">
          <div class="val" style="color:#065f46;">${fmt(totalRec)}</div>
          <div class="lbl">Total Recettes</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#dc2626;">${fmt(totalDep)}</div>
          <div class="lbl">Total Dépenses</div>
        </div>
        <div class="stat-card" style="background:${solde >= 0 ? "#d1fae5" : "#fee2e2"};border-color:${solde >= 0 ? "#6ee7b7" : "#fca5a5"};">
          <div class="val" style="color:${solde >= 0 ? "#065f46" : "#b91c1c"};">${solde >= 0 ? "+" : "−"}${fmt(solde)}</div>
          <div class="lbl">Solde ${solde >= 0 ? "(Excédent)" : "(Déficit)"}</div>
        </div>
      </div>

      <!-- Recettes par catégorie -->
      <div class="section-title">Recettes par catégorie</div>
      <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:12px;">
        <table>
          <thead><tr>
            <th style="text-align:left;">Catégorie</th>
            <th>Réalisé</th>
            <th>Prévu</th>
            <th>Écart</th>
          </tr></thead>
          <tbody>
            ${lignesRecettes || '<tr><td colspan="4" style="padding:10px;color:#94a3b8;text-align:center;font-size:8pt;">Aucune recette enregistrée</td></tr>'}
            <tr>
              <td style="padding:6px 10px;font-size:8.5pt;font-weight:700;">Total</td>
              <td style="padding:6px 10px;font-size:8.5pt;text-align:right;font-weight:700;color:#065f46;">${fmt(totalRec)}</td>
              <td></td><td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Dépenses par catégorie -->
      <div class="section-title">Dépenses par catégorie</div>
      <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:12px;">
        <table>
          <thead><tr>
            <th style="text-align:left;">Catégorie</th>
            <th>Réalisé</th>
            <th>Prévu</th>
            <th>Écart</th>
          </tr></thead>
          <tbody>
            ${lignesDepenses || '<tr><td colspan="4" style="padding:10px;color:#94a3b8;text-align:center;font-size:8pt;">Aucune dépense enregistrée</td></tr>'}
            <tr>
              <td style="padding:6px 10px;font-size:8.5pt;font-weight:700;">Total</td>
              <td style="padding:6px 10px;font-size:8.5pt;text-align:right;font-weight:700;color:#dc2626;">${fmt(totalDep)}</td>
              <td></td><td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Résultat final -->
      <div style="background:linear-gradient(135deg,#0a3d28,#1a7a4e);border-radius:8px;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="font-size:7.5pt;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px;">Résultat de l'exercice ${annee}</p>
          <p style="font-family:'Cormorant Garamond',serif;font-size:22pt;font-weight:700;color:#e6b84a;line-height:1;">
            ${solde >= 0 ? "+" : "−"}${fmt(solde)}
          </p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:7pt;color:rgba(255,255,255,0.55);margin-bottom:2px;">${recettes.length + depenses.length} opérations au total</p>
          <p style="font-size:9pt;color:rgba(255,255,255,0.80);">${solde >= 0 ? "Excédent budgétaire" : "Déficit budgétaire"}</p>
        </div>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right;">
        Document interne — confidentiel<br/>
        Généré le ${today()} · Réf. ${ref}
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Rapport-Tresorerie-MBP-${annee}.html`);
}

// ── Bilan financier consolidé (Vue comptable) ───────────────────────────────
//
// Synthèse comptable d'un exercice qui AGRÈGE les modules financiers existants
// sans les recompter à tort : le résultat de l'exercice provient uniquement de
// la trésorerie (la caisse fait foi). Cotisations, factures, subventions et
// ventes sont présentées comme INDICATEURS COMPLÉMENTAIRES (recouvrement,
// créances) et ne sont pas additionnées au résultat, pour éviter tout double
// comptage. data = { transactions, cotisations, factures, subventions, ventes,
// membersCount }.
export function genererBilanComptable(annee, data = {}) {
  const {
    transactions = [], cotisations = [], factures = [],
    subventions = [], ventes = [], membersCount = 0,
  } = data;
  const ref = refNumber("BIL", String(annee));
  const fmt = n => new Intl.NumberFormat("fr-FR").format(Math.round(Math.abs(Number(n) || 0))) + " F CFA";

  // — Résultat de l'exercice (source de vérité : trésorerie) —
  const recettes = transactions.filter(t => t.type === "recette");
  const depenses = transactions.filter(t => t.type === "depense");
  const totalRec = recettes.reduce((s, t) => s + Number(t.montant || 0), 0);
  const totalDep = depenses.reduce((s, t) => s + Number(t.montant || 0), 0);
  const solde = totalRec - totalDep;

  const byCategorie = (list) => {
    const map = {};
    list.forEach(t => { map[t.categorie || "Autres"] = (map[t.categorie || "Autres"] || 0) + Number(t.montant || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };
  const ligneCat = (entries, color) => entries.map(([cat, montant]) => `<tr>
      <td style="padding:5px 10px;font-size:8.5pt;color:#0f172a;">${cat}</td>
      <td style="padding:5px 10px;font-size:8.5pt;text-align:right;font-weight:600;color:${color};">${fmt(montant)}</td>
    </tr>`).join("");

  // — Indicateurs complémentaires —
  const cotisPayees = cotisations.filter(c => c.statut === "payé" || c.statut === "paye");
  const totalCotis = cotisPayees.reduce((s, c) => s + Number(c.montant || 0), 0);
  const facturesPayees = factures.filter(f => f.statut === "payée" || f.statut === "payee");
  const facturesAttente = factures.filter(f => f.statut === "émise" || f.statut === "emise");
  const totalFactPayees = facturesPayees.reduce((s, f) => s + Number(f.montant_ttc || 0), 0);
  const totalCreances = facturesAttente.reduce((s, f) => s + Number(f.montant_ttc || 0), 0);
  const totalSubAccord = subventions.reduce((s, x) => s + Number(x.montant_accorde || 0), 0);
  const totalSubRecu = subventions.reduce((s, x) => s + Number(x.montant_recu || 0), 0);
  const ventesPayees = ventes.filter(v => v.statut === "payée" || v.statut === "payee" || v.statut === "validée");
  const totalVentes = ventesPayees.reduce((s, v) => s + Number(v.total || 0), 0);

  const indicateurs = [
    ["Cotisations encaissées", `${fmt(totalCotis)}`, `${cotisPayees.length}${membersCount ? " / " + membersCount + " membres" : " cotisation(s)"}`],
    ["Factures réglées", `${fmt(totalFactPayees)}`, `${facturesPayees.length} facture(s)`],
    ["Créances (factures émises non payées)", `${fmt(totalCreances)}`, `${facturesAttente.length} en attente`],
    ["Subventions reçues", `${fmt(totalSubRecu)}`, `sur ${fmt(totalSubAccord)} accordé(s)`],
    ["Ventes / boutique", `${fmt(totalVentes)}`, `${ventesPayees.length} commande(s)`],
  ];
  const lignesIndic = indicateurs.map(([lbl, val, sub]) => `<tr>
      <td style="padding:6px 10px;font-size:8.5pt;color:#0f172a;">${lbl}</td>
      <td style="padding:6px 10px;font-size:8.5pt;text-align:right;font-weight:600;color:#0a3d28;">${val}</td>
      <td style="padding:6px 10px;font-size:8pt;text-align:right;color:#94a3b8;">${sub}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Bilan financier ${annee} — FDD MBP</title>
  <style>${MBP_STYLE}</style>
  <style>
    table { width:100%;border-collapse:collapse; }
    thead th { background:#0a3d28;color:#fff;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:8px 10px; }
    thead th:not(:first-child) { text-align:right; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    .section-title { font-family:'Cormorant Garamond',serif;font-size:11pt;font-weight:700;color:#0a3d28;margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid #e2e8f0; }
    .stat-card { background:#f7faf8;border:1px solid #c8ddd2;border-radius:8px;padding:12px 16px;text-align:center; }
    .stat-card .val { font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:700;line-height:1; }
    .stat-card .lbl { font-size:7pt;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-top:3px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Bilan financier ${annee}</div>
        <div class="doc-ref">Réf. ${ref} · Généré le ${today()}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">
        <div class="stat-card">
          <div class="val" style="color:#065f46;">${fmt(totalRec)}</div>
          <div class="lbl">Total Recettes</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#dc2626;">${fmt(totalDep)}</div>
          <div class="lbl">Total Dépenses</div>
        </div>
        <div class="stat-card" style="background:${solde >= 0 ? "#d1fae5" : "#fee2e2"};border-color:${solde >= 0 ? "#6ee7b7" : "#fca5a5"};">
          <div class="val" style="color:${solde >= 0 ? "#065f46" : "#b91c1c"};">${solde >= 0 ? "+" : "−"}${fmt(solde)}</div>
          <div class="lbl">Résultat ${solde >= 0 ? "(Excédent)" : "(Déficit)"}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div class="section-title">Recettes par catégorie</div>
          <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;">
            <table>
              <thead><tr><th style="text-align:left;">Catégorie</th><th>Réalisé</th></tr></thead>
              <tbody>
                ${ligneCat(byCategorie(recettes), "#065f46") || '<tr><td colspan="2" style="padding:10px;color:#94a3b8;text-align:center;font-size:8pt;">Aucune recette</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="section-title">Dépenses par catégorie</div>
          <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;">
            <table>
              <thead><tr><th style="text-align:left;">Catégorie</th><th>Réalisé</th></tr></thead>
              <tbody>
                ${ligneCat(byCategorie(depenses), "#dc2626") || '<tr><td colspan="2" style="padding:10px;color:#94a3b8;text-align:center;font-size:8pt;">Aucune dépense</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="section-title">Indicateurs complémentaires</div>
      <p style="font-size:7.5pt;color:#94a3b8;margin:-2px 0 6px;">Ces montants éclairent la situation financière mais ne sont pas additionnés au résultat ci-dessus (qui provient de la trésorerie) afin d'éviter tout double comptage.</p>
      <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;">
        <table>
          <thead><tr><th style="text-align:left;">Indicateur</th><th>Montant</th><th>Détail</th></tr></thead>
          <tbody>${lignesIndic}</tbody>
        </table>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right;">
        Document interne — confidentiel<br/>
        Généré le ${today()} · Réf. ${ref}
      </div>
    </div>

  </div>
</body>
</html>`;

  openDoc(html, `Bilan-Financier-MBP-${annee}.html`);
}

// ── Liste des participants en présentiel (feuille d'émargement) ──────────────
//
// Pour un événement présentiel ou hybride, génère la liste des inscrits qui
// seront physiquement sur place — utile comme feuille d'émargement à imprimer
// le jour J. La logique de filtrage :
//   • format « presentiel » : tous les inscrits non désinscrits sont sur place ;
//   • format « hybride »     : seuls ceux ayant choisi le mode « presentiel ».
// Mise en page « flux » (marges @page, en-tête de tableau répété à chaque page)
// pour gérer proprement plusieurs pages quand la liste est longue.
export function genererListePresentiel(event, registrations) {
  const ref = refNumber("PRES", String(event?.id ?? "").slice(0, 6).toUpperCase() || "MBP");

  const FORMAT_LABEL = { en_ligne: "En ligne", presentiel: "Présentiel", hybride: "Hybride" };

  const dateEvt = event?.date_time
    ? new Date(event.date_time).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "Date à préciser";

  // Filtre : inscrits non désinscrits qui seront sur place.
  const candidats = (registrations ?? []).filter(r => {
    if (r.status === "unregistered" || r.status === "cancelled") return false;
    if (event?.format === "hybride") return r.mode_participation === "presentiel";
    return true; // présentiel pur : tout le monde est sur place
  });

  // Tri alphabétique sur le nom (locale française)
  candidats.sort((a, b) => (a.nom_complet || "").localeCompare(b.nom_complet || "", "fr"));

  const lignes = candidats.map((r, i) => `
    <tr>
      <td class="c-num">${i + 1}</td>
      <td class="c-nom">${r.nom_complet || "—"}</td>
      <td class="c-sec">${r.profession || "—"}</td>
      <td class="c-sec">${r.telephone || "—"}</td>
      <td class="c-sig"></td>
    </tr>`).join("");

  const corps = candidats.length
    ? lignes
    : `<tr><td colspan="5" style="padding:18px;text-align:center;color:#94a3b8;font-size:9pt;">
         Aucun participant en présentiel pour le moment.
       </td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Liste présentiel — ${event?.title || "Événement"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { size:A4 portrait; margin:14mm 12mm; }
    body { font-family:'Lato',sans-serif; background:#f0f0f0; color:#1a1a1a; padding:20px 0 40px; }
    @media print { body { background:#fff; padding:0; } .no-print { display:none!important; } }
    .sheet { width:210mm; margin:0 auto; background:#fff; padding:0 0 10px; }
    @media print { .sheet { width:100%; } }

    .header { background:linear-gradient(135deg,#0a3d28,#1a7a4e); padding:16px 24px; display:flex; align-items:center; justify-content:space-between; }
    .header .asso-name { font-family:'Cormorant Garamond',serif; font-size:14pt; font-weight:700; color:#fff; line-height:1.2; }
    .header .asso-sub { font-size:8pt; color:rgba(255,255,255,0.65); }
    .gold-bar { height:3px; background:linear-gradient(to right,#b8861a,#e6b84a,#b8861a); }

    .body { padding:18px 24px 0; }
    .title-block { text-align:center; padding-bottom:14px; border-bottom:1px solid #e2e8f0; margin-bottom:14px; }
    .title { font-family:'Cormorant Garamond',serif; font-size:19pt; font-weight:700; color:#0a3d28; text-transform:uppercase; letter-spacing:0.03em; }
    .subtitle { font-size:10pt; color:#334155; margin-top:4px; font-weight:700; }
    .doc-ref { font-size:7.5pt; color:#999; letter-spacing:0.06em; margin-top:4px; }

    .info-bar { display:flex; flex-wrap:wrap; gap:8px 20px; background:#f7faf8; border:1px solid #c8ddd2; border-radius:8px; padding:10px 16px; margin-bottom:14px; }
    .info-item { font-size:8.5pt; color:#334155; }
    .info-item strong { color:#0a3d28; font-weight:700; text-transform:uppercase; font-size:7pt; letter-spacing:0.08em; display:block; margin-bottom:1px; }
    .badge-count { margin-left:auto; background:#0a3d28; color:#e6b84a; font-weight:700; font-size:9pt; padding:5px 12px; border-radius:99px; align-self:center; }

    table { width:100%; border-collapse:collapse; }
    thead { display:table-header-group; }
    thead th { background:#0a3d28; color:#fff; font-size:8pt; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; padding:8px 10px; text-align:left; }
    tbody tr { break-inside:avoid; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    tbody td { padding:9px 10px; font-size:9pt; border-bottom:1px solid #e2e8f0; vertical-align:middle; }
    .c-num { width:30px; color:#94a3b8; text-align:center; }
    .c-nom { font-weight:700; color:#0f172a; }
    .c-sec { color:#475569; }
    .c-sig { width:55mm; border-left:1px dashed #cbd5e1; }
    thead th.c-sig { color:#fff; border-left:none; }

    .footer { display:flex; justify-content:space-between; align-items:flex-end; margin:18px 24px 0; padding-top:10px; border-top:1px solid #e2e8f0; }
    .footer-text { font-size:7.5pt; color:#94a3b8; line-height:1.5; }
    .sig-org { text-align:right; }
    .sig-org .sig-line { width:55mm; border-bottom:1px solid #cbd5e1; height:34px; margin-left:auto; }
    .sig-org .sig-label { font-size:7.5pt; color:#64748b; margin-top:4px; }

    .print-btn { position:fixed; bottom:24px; right:24px; background:#0a3d28; color:#fff; border:none; border-radius:50px; padding:12px 24px; font-family:'Lato',sans-serif; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 16px rgba(10,61,40,.4); z-index:999; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>

  <div class="sheet">

    <div class="header">
      <img src="/Logo%20Redesign1.png" alt="MBP" style="height:40px;width:auto;" onerror="this.style.display='none'" />
      <div style="text-align:right;">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé · Promotion 1994–2000</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="body">

      <div class="title-block">
        <div class="title">Liste des participants — Présentiel</div>
        <div class="subtitle">${event?.title || "Événement"}</div>
        <div class="doc-ref">Réf. ${ref} · Feuille d'émargement générée le ${today()}</div>
      </div>

      <div class="info-bar">
        <div class="info-item"><strong>Date</strong>${dateEvt}</div>
        ${event?.lieu ? `<div class="info-item"><strong>Lieu</strong>${event.lieu}</div>` : ""}
        <div class="info-item"><strong>Format</strong>${FORMAT_LABEL[event?.format] || "Présentiel"}</div>
        <span class="badge-count">${candidats.length} participant${candidats.length !== 1 ? "s" : ""}</span>
      </div>

      <div style="border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;">
        <table>
          <thead>
            <tr>
              <th class="c-num" style="text-align:center;">#</th>
              <th>Nom complet</th>
              <th>Profession</th>
              <th>Téléphone</th>
              <th class="c-sig">Signature</th>
            </tr>
          </thead>
          <tbody>${corps}</tbody>
        </table>
      </div>

    </div>

    <div class="footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Document interne · Réf. ${ref} · Généré le ${today()}
      </div>
      <div class="sig-org">
        <div class="sig-line"></div>
        <div class="sig-label">Émargement clôturé le ____ / ____ / ________ — Signature du responsable</div>
      </div>
    </div>

  </div>
</body>
</html>`;

  const slug = (event?.title || "evenement").replace(/\s+/g, "-").toLowerCase().slice(0, 40);
  openDoc(html, `Liste-Presentiel-MBP-${slug}.html`);
}

// ── Facture ──────────────────────────────────────────────────────────────────
export function genererFacture(facture) {
  const {
    numero         = "F-????",
    client_nom     = "",
    client_adresse = "",
    client_email   = "",
    client_telephone = "",
    date_emission  = "",
    date_echeance  = "",
    objet          = "",
    lignes         = [],
    tva_active     = false,
    tva_taux       = 18,
    mode_reglement = "",
    notes          = "",
  } = facture;

  function fmt(n) {
    return new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " FCFA";
  }
  function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  const totalHT = lignes.reduce((s, l) => s + ((l.quantite || 0) * (l.prix_unitaire || 0)), 0);
  const montantTVA = tva_active ? totalHT * (tva_taux / 100) : 0;
  const totalTTC   = totalHT + montantTVA;

  const lignesHtml = lignes.map((l, i) => `
    <tr${i % 2 === 1 ? ' class="alt"' : ""}>
      <td class="td-desc">${l.description || "—"}</td>
      <td class="td-num">${l.quantite || 0}</td>
      <td class="td-num">${fmt(l.prix_unitaire)}</td>
      <td class="td-num td-total">${fmt((l.quantite || 0) * (l.prix_unitaire || 0))}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${numero}</title>
  <style>
    ${MBP_STYLE}

    /* ── Facture-specific overrides ── */
    .facture-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }
    .facture-num-box {
      background: #0a3d28;
      border-radius: 8px;
      padding: 14px 18px;
      min-width: 240px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 18px;
    }
    .facture-num-box .info-label { color: rgba(255,255,255,0.50); }
    .facture-num-box .info-value { color: #fff; font-size: 11pt; }
    .facture-num-box .info-row.full-width { grid-column: 1/-1; }

    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .partie {
      background: #f7faf8;
      border: 1px solid #c8ddd2;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .partie.dest {
      background: linear-gradient(135deg, #fffbea 0%, #fff6d6 100%);
      border-color: #d4a017;
    }
    .partie-label {
      font-family: 'Lato', sans-serif;
      font-size: 7pt;
      font-weight: 700;
      color: #0a3d28;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(10,61,40,0.12);
    }
    .partie.dest .partie-label { color: #7a5100; border-color: rgba(180,130,0,0.2); }
    .partie-nom {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13pt;
      font-weight: 700;
      color: #0a3d28;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .partie.dest .partie-nom { color: #1a1a1a; }
    .partie-detail {
      font-family: 'Lato', sans-serif;
      font-size: 8.5pt;
      color: #555;
      line-height: 1.65;
    }

    .objet-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f7faf8;
      border: 1px solid #c8ddd2;
      border-radius: 6px;
      padding: 10px 16px;
    }
    .objet-row .info-label { white-space: nowrap; }
    .objet-row .info-value { font-size: 11pt; }

    /* Table */
    .table-wrap { border: 1px solid #c8ddd2; border-radius: 8px; overflow: hidden; }
    table.prestations { width: 100%; border-collapse: collapse; }
    table.prestations thead tr { background: #0a3d28; }
    table.prestations thead th {
      font-family: 'Lato', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 10px 14px;
      text-align: left;
    }
    table.prestations thead th.th-num { text-align: right; }
    table.prestations tbody tr { border-bottom: 1px solid #e4ede8; }
    table.prestations tbody tr.alt { background: #f7faf8; }
    table.prestations tbody tr:last-child { border-bottom: none; }
    table.prestations td {
      font-family: 'Lato', sans-serif;
      font-size: 9pt;
      color: #444;
      padding: 9px 14px;
      vertical-align: middle;
    }
    td.td-desc {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10.5pt;
      color: #1a1a1a;
      width: 52%;
    }
    td.td-num { text-align: right; white-space: nowrap; }
    td.td-total { font-weight: 700; color: #0a3d28; }

    /* Totaux */
    .totaux-wrap { display: flex; justify-content: flex-end; }
    .totaux {
      width: 290px;
      border: 1px solid #c8ddd2;
      border-radius: 8px;
      overflow: hidden;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #e4ede8;
      font-family: 'Lato', sans-serif;
      font-size: 9pt;
    }
    .tot-row:last-child { border-bottom: none; }
    .tot-row.final { background: #0a3d28; padding: 12px 16px; }
    .tot-row .lbl { color: #666; }
    .tot-row .val { font-weight: 700; color: #0a3d28; }
    .tot-row.final .lbl {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #fff;
    }
    .tot-row.final .val {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15pt;
      font-weight: 700;
      color: #e6b84a;
    }

    /* Pied */
    .reglement-box {
      background: linear-gradient(135deg, #fffbea, #fff8dc);
      border: 1px solid #d4a017;
      border-left: 4px solid #d4a017;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .reglement-box .info-label { color: #7a5100; }
    .reglement-box .info-value { color: #3d2600; font-size: 11pt; margin-top: 2px; }

    /* Gold diagonal watermark-like accent */
    .corner-accent {
      position: absolute;
      top: 0; right: 0;
      width: 0; height: 0;
      border-style: solid;
      border-width: 0 56px 56px 0;
      border-color: transparent #b8861a transparent transparent;
      opacity: 0.18;
    }
  </style>
</head>
<body>
<div class="a4">
  <div class="corner-accent"></div>

  <!-- En-tête -->
  <header class="doc-header">
    <img src="/Logo%20Redesign1.png" alt="MBP" class="doc-header-logo" />
    <div class="doc-header-asso">
      <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
      <p class="asso-sub">Association des Diplômés · Faculté de Droit de Lomé · Promotion 1994-2000</p>
      <p class="asso-sub" style="margin-top:2px">contact@mabellepromo.org · mabellepromo.org</p>
    </div>
  </header>
  <div class="gold-bar"></div>

  <div class="doc-body">

    <!-- Titre + N° facture -->
    <div class="facture-top">
      <div>
        <div class="doc-title">Facture</div>
        <div class="doc-ref" style="font-size:8.5pt;color:#666;margin-top:5px">
          Document officiel · L'association Ma Belle Promo (MBP)
        </div>
      </div>
      <div class="facture-num-box">
        <div class="info-row">
          <span class="info-label">Numéro</span>
          <span class="info-value" style="font-family:'Lato',sans-serif;letter-spacing:0.05em">${numero}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date d'émission</span>
          <span class="info-value">${fmtDate(date_emission)}</span>
        </div>
        ${date_echeance ? `<div class="info-row full-width">
          <span class="info-label">Échéance</span>
          <span class="info-value">${fmtDate(date_echeance)}</span>
        </div>` : ""}
      </div>
    </div>

    <!-- Objet -->
    ${objet ? `<div class="objet-row">
      <span class="info-label">Objet</span>
      <span class="info-value">${objet}</span>
    </div>` : ""}

    <!-- Émetteur / Destinataire -->
    <div class="parties-grid">
      <div class="partie">
        <div class="partie-label">Émetteur</div>
        <div class="partie-nom">L'association Ma Belle Promo (MBP)</div>
        <div class="partie-detail">
          Association des Diplômés<br>
          Faculté de Droit, Université de Lomé<br>
          Lomé, Togo<br>
          contact@mabellepromo.org
        </div>
      </div>
      <div class="partie dest">
        <div class="partie-label">Facturé à</div>
        <div class="partie-nom">${client_nom || "—"}</div>
        <div class="partie-detail">
          ${[client_adresse, client_email, client_telephone].filter(Boolean).join("<br>") || "<em style='color:#aaa'>Coordonnées non renseignées</em>"}
        </div>
      </div>
    </div>

    <!-- Table des prestations -->
    <div class="table-wrap">
      <table class="prestations">
        <thead>
          <tr>
            <th>Description</th>
            <th class="th-num" style="width:8%">Qté</th>
            <th class="th-num" style="width:20%">Prix unitaire</th>
            <th class="th-num" style="width:20%">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${lignesHtml || `<tr><td colspan="4" style="text-align:center;color:#aaa;font-style:italic;padding:18px">Aucune prestation</td></tr>`}
        </tbody>
      </table>
    </div>

    <!-- Totaux -->
    <div class="totaux-wrap">
      <div class="totaux">
        <div class="tot-row">
          <span class="lbl">Sous-total HT</span>
          <span class="val">${fmt(totalHT)}</span>
        </div>
        <div class="tot-row">
          <span class="lbl">${tva_active ? `TVA (${tva_taux}%)` : "TVA"}</span>
          <span class="val" ${!tva_active ? 'style="color:#aaa;font-style:italic;font-weight:400;font-size:8pt"' : ""}>${tva_active ? fmt(montantTVA) : "Non applicable"}</span>
        </div>
        <div class="tot-row final">
          <span class="lbl">Total ${tva_active ? "TTC" : "HT"}</span>
          <span class="val">${fmt(totalTTC)}</span>
        </div>
      </div>
    </div>

    <!-- Mode de règlement -->
    ${mode_reglement ? `<div class="reglement-box">
      <div class="info-label">Conditions de règlement</div>
      <div class="info-value">${mode_reglement}</div>
    </div>` : ""}

    <!-- Coordonnées bancaires si virement -->
    ${mode_reglement && mode_reglement.toLowerCase().includes("virement") ? `
    <div style="background:linear-gradient(135deg,#fffbea,#fff8dc);border:1px solid #d4a017;border-left:4px solid #b8861a;border-radius:6px;padding:14px 18px;">
      <div style="font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#7a5100;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">
        Coordonnées bancaires — Virement ECOBANK
      </div>
      <div style="font-family:'Lato',sans-serif;font-size:9pt;color:#3d2600;line-height:2;">
        <strong>Titulaire&nbsp;:</strong> ASSOCIATION MA BELLE PROMO MBP<br>
        <strong>Banque&nbsp;&nbsp;&nbsp;&nbsp;:</strong> ECOBANK Togo<br>
        <strong>IBAN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</strong> TG53 TG05 5017 1014 1766 3880 0153<br>
        <strong>Swift/BIC&nbsp;:</strong> ECOCTGTGXXX<br>
        <strong>Référence&nbsp;:</strong> ${numero} — ${client_nom || "Client"}
      </div>
    </div>` : ""}

    <!-- Notes -->
    ${notes ? `<div class="notice-box">
      <p><strong>Notes :</strong> ${notes}</p>
    </div>` : ""}

  </div>

  <!-- Pied de page -->
  <footer class="doc-footer">
    <div>
      <p class="footer-text">L'association Ma Belle Promo (MBP) · Association des Diplômés · Faculté de Droit · Université de Lomé · Promotion 1994-2000</p>
      <p class="footer-text" style="margin-top:2px">Lomé, Togo · contact@mabellepromo.org</p>
    </div>
    <p class="footer-text" style="text-align:right;white-space:nowrap">
      Facture ${numero}<br>
      Généré le ${today()}
    </p>
  </footer>

</div>
</body>
</html>`;

  openDoc(html, `Facture-${numero}.html`);
}

// ── Facture Boutique (commande en ligne) ─────────────────────────────────────
export function genererFactureBoutique(commande) {
  const {
    reference       = "—",
    acheteur_nom    = "—",
    acheteur_email  = "",
    methode_paiement = "",
    total           = 0,
    lignes          = [],
    created_at,
    statut          = "pending",
  } = commande;

  const METHOD_LABELS = {
    card: "Carte bancaire", paypal: "PayPal", wave: "Wave",
    tmoney: "T-Money", flooz: "Flooz", wire: "Virement ECOBANK",
  };
  const STATUT_CFG = {
    completed: { label: "Payée",      bg: "#d1fae5", color: "#065f46" },
    pending:   { label: "En attente", bg: "#fef3c7", color: "#92400e" },
    cancelled: { label: "Annulée",    bg: "#fee2e2", color: "#991b1b" },
  };

  const fmt = n => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " FCFA";
  const strip = s => String(s || "").replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "").trim();
  const lignesArr = Array.isArray(lignes) ? lignes : [];
  const dateCmd = created_at
    ? new Date(created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : today();
  const modeLabel = METHOD_LABELS[methode_paiement] || methode_paiement || "—";
  const statutCfg = STATUT_CFG[statut] ?? STATUT_CFG.pending;

  const lignesHtml = lignesArr.map((l, i) => `
    <tr${i % 2 === 1 ? ' class="alt"' : ""}>
      <td class="td-desc">${strip(l.name)}</td>
      <td class="td-num">${l.qty}</td>
      <td class="td-num">${fmt(l.price)}</td>
      <td class="td-num td-total">${fmt(l.price * l.qty)}</td>
    </tr>`).join("");

  const wireBlock = methode_paiement === "wire" ? `
    <div style="background:linear-gradient(135deg,#fffbea,#fff8dc);border:1px solid #d4a017;border-left:4px solid #b8861a;border-radius:6px;padding:14px 18px;margin-top:16px;">
      <div style="font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#7a5100;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">
        Coordonnées bancaires — Virement ECOBANK
      </div>
      <div style="font-family:'Lato',sans-serif;font-size:9pt;color:#3d2600;line-height:2;">
        <strong>Titulaire&nbsp;:</strong> ASSOCIATION MA BELLE PROMO MBP<br>
        <strong>Banque&nbsp;&nbsp;&nbsp;&nbsp;:</strong> ECOBANK Togo<br>
        <strong>IBAN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</strong> TG53 TG05 5017 1014 1766 3880 0153<br>
        <strong>Swift/BIC&nbsp;:</strong> ECOCTGTGXXX<br>
        <strong>Référence&nbsp;:</strong> BOUTIQUE MBP — ${acheteur_nom}
      </div>
    </div>` : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture Boutique ${reference}</title>
  <style>
    ${MBP_STYLE}

    .facture-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }
    .facture-num-box {
      background: #0a3d28;
      border-radius: 8px;
      padding: 14px 18px;
      min-width: 220px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 18px;
    }
    .facture-num-box .info-label { color: rgba(255,255,255,0.50); }
    .facture-num-box .info-value { color: #fff; font-size: 10pt; }
    .facture-num-box .info-row.full-width { grid-column: 1/-1; }

    .partie {
      background: #f7faf8;
      border: 1px solid #c8ddd2;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .partie.dest {
      background: linear-gradient(135deg, #fffbea 0%, #fff6d6 100%);
      border-color: #d4a017;
    }
    .partie-label {
      font-family: 'Lato', sans-serif;
      font-size: 7pt;
      font-weight: 700;
      color: #0a3d28;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(10,61,40,0.12);
    }
    .partie.dest .partie-label { color: #7a5100; border-color: rgba(180,130,0,0.2); }
    .partie-nom {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13pt;
      font-weight: 700;
      color: #0a3d28;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .partie.dest .partie-nom { color: #1a1a1a; }
    .partie-detail {
      font-family: 'Lato', sans-serif;
      font-size: 8.5pt;
      color: #555;
      line-height: 1.65;
    }

    .table-wrap { border: 1px solid #c8ddd2; border-radius: 8px; overflow: hidden; }
    table.prestations { width: 100%; border-collapse: collapse; }
    table.prestations thead tr { background: #0a3d28; }
    table.prestations thead th {
      font-family: 'Lato', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 10px 14px;
      text-align: left;
    }
    table.prestations thead th.th-num { text-align: right; }
    table.prestations tbody tr { border-bottom: 1px solid #e4ede8; }
    table.prestations tbody tr.alt { background: #f7faf8; }
    table.prestations tbody tr:last-child { border-bottom: none; }
    table.prestations td {
      font-family: 'Lato', sans-serif;
      font-size: 9pt;
      color: #444;
      padding: 9px 14px;
      vertical-align: middle;
    }
    td.td-desc {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10.5pt;
      color: #1a1a1a;
      width: 52%;
    }
    td.td-num { text-align: right; white-space: nowrap; }
    td.td-total { font-weight: 700; color: #0a3d28; }

    .totaux-wrap { display: flex; justify-content: flex-end; }
    .totaux {
      width: 290px;
      border: 1px solid #c8ddd2;
      border-radius: 8px;
      overflow: hidden;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #e4ede8;
      font-family: 'Lato', sans-serif;
      font-size: 9pt;
    }
    .tot-row:last-child { border-bottom: none; }
    .tot-row.final { background: #0a3d28; padding: 12px 16px; }
    .tot-row .lbl { color: #666; }
    .tot-row .val { font-weight: 700; color: #0a3d28; }
    .tot-row.final .lbl {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #fff;
    }
    .tot-row.final .val {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15pt;
      font-weight: 700;
      color: #e6b84a;
    }
    /* En-tête couleur unie identique à la zone référence */
    .doc-header { background: #0a3d28 !important; }
  </style>
</head>
<body>
<button class="no-print print-btn" type="button" onclick="window.print()">
  🖨 Imprimer / Enregistrer PDF
</button>
<div class="a4">

  <header class="doc-header">
    <img src="/Logo%20Redesign1.png" alt="MBP" class="doc-header-logo" onerror="this.style.display='none'" />
    <div class="doc-header-asso">
      <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
      <p class="asso-sub">Boutique en ligne · Lomé, Togo</p>
      <p class="asso-sub" style="margin-top:2px">contact@mabellepromo.org · mabellepromo.org</p>
    </div>
  </header>
  <div class="gold-bar"></div>

  <div class="doc-body">

    <!-- Titre + infos commande -->
    <div class="facture-top">
      <div>
        <div class="doc-title">Facture</div>
        <div class="doc-ref" style="font-size:8.5pt;color:#666;margin-top:5px">
          Commande Boutique MBP
        </div>
      </div>
      <div class="facture-num-box">
        <div class="info-row full-width">
          <span class="info-label">Référence</span>
          <span class="info-value" style="font-family:'Lato',sans-serif;letter-spacing:0.05em">${reference}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${dateCmd}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Statut</span>
          <span class="info-value">
            <span style="background:${statutCfg.bg};color:${statutCfg.color};font-size:8pt;font-weight:700;padding:2px 8px;border-radius:99px;font-family:'Lato',sans-serif;">
              ${statutCfg.label}
            </span>
          </span>
        </div>
        <div class="info-row full-width">
          <span class="info-label">Mode de paiement</span>
          <span class="info-value">${modeLabel}</span>
        </div>
      </div>
    </div>

    <!-- Émetteur / Acheteur -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="partie">
        <div class="partie-label">Émetteur</div>
        <div class="partie-nom">L'association Ma Belle Promo (MBP)</div>
        <div class="partie-detail">
          Association des Diplômés · Lomé, Togo<br>
          contact@mabellepromo.org
        </div>
      </div>
      <div class="partie dest">
        <div class="partie-label">Facturé à</div>
        <div class="partie-nom">${acheteur_nom}</div>
        <div class="partie-detail">
          ${acheteur_email || "<em style='color:#aaa'>Email non renseigné</em>"}
        </div>
      </div>
    </div>

    <!-- Articles -->
    <div class="table-wrap">
      <table class="prestations">
        <thead>
          <tr>
            <th>Article</th>
            <th class="th-num" style="width:8%">Qté</th>
            <th class="th-num" style="width:20%">Prix unitaire</th>
            <th class="th-num" style="width:20%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lignesHtml || `<tr><td colspan="4" style="text-align:center;color:#aaa;font-style:italic;padding:18px">Aucun article</td></tr>`}
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div class="totaux-wrap">
      <div class="totaux">
        <div class="tot-row final">
          <span class="lbl">Total TTC</span>
          <span class="val">${fmt(total)}</span>
        </div>
      </div>
    </div>

    <!-- Virement ECOBANK si applicable -->
    ${wireBlock}

    <!-- Mention légale -->
    <div class="notice-box" style="margin-top:8px;">
      <p>Ce document tient lieu de reçu et de facture simplifiée. Association à but non lucratif — non assujettie à la TVA.</p>
    </div>

  </div>

  <footer class="doc-footer">
    <div>
      <p class="footer-text">L'association Ma Belle Promo (MBP) · www.mabellepromo.org</p>
      <p class="footer-text" style="margin-top:2px">Lomé, Togo · contact@mabellepromo.org</p>
    </div>
    <p class="footer-text" style="text-align:right;white-space:nowrap">
      Facture ${reference}<br>
      Généré le ${today()}
    </p>
  </footer>

</div>
</body>
</html>`;

  openDoc(html, `Facture-Boutique-${reference}.html`);
}

// ── Rapport Statistique ──────────────────────────────────────────────────────
export function genererRapportStats(annee, members, cotData, geoData, proData) {
  const ref = refNumber("STAT", String(annee));
  const total     = members.length;
  const withEmail = members.filter(m => m.email).length;
  const withPays  = members.filter(m => m.pays).length;
  const pctEmail  = total > 0 ? Math.round((withEmail / total) * 100) : 0;
  const pctPays   = total > 0 ? Math.round((withPays  / total) * 100) : 0;

  const COLORS = ["#1b6b45","#9a7118","#3b82f6","#8b5cf6","#ef4444","#f59e0b","#06b6d4"];

  const lignesCot = cotData.map(d => `
    <tr>
      <td style="padding:6px 10px;font-size:9pt;">${d.annee}</td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;">${d.total}</td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;font-weight:700;color:#0a3d28;">${d.payes}</td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;">
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
          <div style="width:80px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${d.taux}%;background:${d.taux >= 75 ? "#059669" : d.taux >= 50 ? "#d97706" : "#dc2626"};border-radius:3px;"></div>
          </div>
          <span style="font-weight:700;color:${d.taux >= 75 ? "#059669" : d.taux >= 50 ? "#d97706" : "#dc2626"};">${d.taux}%</span>
        </div>
      </td>
    </tr>`).join("");

  const maxGeo = geoData.length > 0 ? geoData[0].value : 1;
  const lignesGeo = geoData.map((d, i) => `
    <tr>
      <td style="padding:6px 10px;font-size:9pt;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:10px;height:10px;border-radius:2px;background:${COLORS[i % COLORS.length]};flex-shrink:0;"></div>
          ${d.name}
        </div>
      </td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;">
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
          <div style="width:100px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${Math.round((d.value / maxGeo) * 100)}%;background:${COLORS[i % COLORS.length]};border-radius:3px;"></div>
          </div>
          <span style="font-weight:700;">${d.value}</span>
        </div>
      </td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;color:#64748b;">${total > 0 ? Math.round((d.value / total) * 100) : 0}%</td>
    </tr>`).join("");

  const maxPro = proData.length > 0 ? proData[0].value : 1;
  const lignesPro = proData.slice(0, 10).map((d, i) => `
    <tr>
      <td style="padding:6px 10px;font-size:9pt;">${d.name}</td>
      <td style="padding:6px 10px;font-size:9pt;text-align:right;">
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
          <div style="width:100px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${Math.round((d.value / maxPro) * 100)}%;background:#3b82f6;border-radius:3px;"></div>
          </div>
          <span style="font-weight:700;">${d.value}</span>
        </div>
      </td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport Statistique ${annee} — FDD MBP</title>
  <style>${MBP_STYLE}</style>
  <style>
    .section-title { font-family:'Cormorant Garamond',serif;font-size:11pt;font-weight:700;color:#0a3d28;margin:20px 0 8px;padding-bottom:4px;border-bottom:2px solid #e2e8f0; }
    table { width:100%;border-collapse:collapse; }
    thead th { background:#0a3d28;color:#fff;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:8px 10px; }
    thead th:not(:first-child) { text-align:right; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    .kpi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px; }
    .kpi { background:#f7faf8;border:1px solid #c8ddd2;border-radius:8px;padding:14px 16px;text-align:center; }
    .kpi .val { font-family:'Cormorant Garamond',serif;font-size:20pt;font-weight:700;color:#0a3d28;line-height:1; }
    .kpi .lbl { font-size:7pt;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px; }
    .kpi .sub { font-size:8pt;color:#64748b;margin-top:2px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Rapport Statistique ${annee}</div>
        <div class="doc-ref">Réf. ${ref} · Généré le ${today()}</div>
      </div>

      <!-- KPIs -->
      <div>
        <div class="section-title">Membres</div>
        <div class="kpi-grid">
          <div class="kpi">
            <div class="val">${total}</div>
            <div class="lbl">Membres</div>
          </div>
          <div class="kpi">
            <div class="val">${withEmail}</div>
            <div class="lbl">Avec e-mail</div>
            <div class="sub">${pctEmail}% du total</div>
          </div>
          <div class="kpi">
            <div class="val">${geoData.length}</div>
            <div class="lbl">Pays représentés</div>
            <div class="sub">${pctPays}% renseignés</div>
          </div>
        </div>
      </div>

      <!-- Cotisations -->
      <div>
        <div class="section-title">Taux de cotisation par année</div>
        <table>
          <thead>
            <tr>
              <th style="text-align:left;">Année</th>
              <th>Total membres</th>
              <th>Payants</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>${lignesCot}</tbody>
        </table>
      </div>

      <!-- Géographie -->
      ${geoData.length > 0 ? `<div>
        <div class="section-title">Répartition géographique</div>
        <table>
          <thead>
            <tr>
              <th style="text-align:left;">Pays</th>
              <th>Membres</th>
              <th>Part</th>
            </tr>
          </thead>
          <tbody>${lignesGeo}</tbody>
        </table>
      </div>` : ""}

      <!-- Professions -->
      ${proData.length > 0 ? `<div>
        <div class="section-title">Professions (top 10)</div>
        <table>
          <thead>
            <tr>
              <th style="text-align:left;">Profession</th>
              <th>Membres</th>
            </tr>
          </thead>
          <tbody>${lignesPro}</tbody>
        </table>
      </div>` : ""}

    </div><!-- /doc-body -->

    <div style="padding:16px 44px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:7pt;color:#94a3b8;">Association FDD Ma Belle Promo — Usage interne</span>
      <span style="font-size:7pt;color:#94a3b8;">${ref}</span>
    </div>

  </div><!-- /a4 -->
</body>
</html>`;

  openDoc(html, `Rapport-Stats-${annee}.html`);
}

// ── PV de passation de bureau ────────────────────────────────────────────────
// passation : { titre, date_passation, date_cloture, bureau_sortant, bureau_entrant,
//               statut, notes, taches: [{ categorie, libelle, responsable, fait, date_fait, notes }] }
// opts.signatures : { sortant: { image, nom, date }, entrant: { image, nom, date } }
//   image = dataURL PNG d'une signature manuscrite capturée dans l'app (optionnel).
export function genererPVPassation(passation, opts = {}) {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fmtDate = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
    catch { return iso; }
  };

  const ref     = refNumber("PV-PASS", new Date(passation.date_passation || Date.now()).getFullYear().toString());
  const taches  = Array.isArray(passation.taches) ? passation.taches : [];
  const total   = taches.length;
  const done    = taches.filter(t => t.fait).length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const cloturee = passation.statut === "cloturee";

  // Regroupement par catégorie, dans l'ordre d'apparition
  const ordre = [];
  const groupes = {};
  taches.forEach((t) => {
    const cat = t.categorie || "Divers";
    if (!groupes[cat]) { groupes[cat] = []; ordre.push(cat); }
    groupes[cat].push(t);
  });

  const blocsCategories = ordre.map((cat) => {
    const items = groupes[cat];
    const catDone = items.filter(t => t.fait).length;
    const catPct  = items.length > 0 ? Math.round((catDone / items.length) * 100) : 0;

    const lignes = items.map((t) => {
      const meta = [];
      if (t.responsable) meta.push(`Responsable : <strong>${esc(t.responsable)}</strong>`);
      if (t.fait && t.date_fait) meta.push(`Fait le ${fmtDate(t.date_fait)}`);
      if (t.notes) meta.push(esc(t.notes));
      return `
        <tr>
          <td style="padding:6px 8px;width:18px;vertical-align:top;font-size:11pt;color:${t.fait ? "#059669" : "#cbd5e1"};">${t.fait ? "☑" : "☐"}</td>
          <td style="padding:6px 8px;font-size:9.5pt;color:#1a1a1a;">
            <span style="${t.fait ? "" : "color:#475569;"}">${esc(t.libelle)}</span>
            ${meta.length ? `<div style="font-size:8pt;color:#64748b;margin-top:2px;line-height:1.5;">${meta.join(" · ")}</div>` : ""}
          </td>
        </tr>`;
    }).join("");

    return `
      <div class="cat-block">
        <div class="cat-head">
          <span class="cat-name">${esc(cat)}</span>
          <span class="cat-count">${catDone}/${items.length} · ${catPct}%</span>
        </div>
        <table class="cat-table"><tbody>${lignes}</tbody></table>
      </div>`;
  }).join("");

  // Colonne de signature : image manuscrite capturée si fournie, sinon ligne vierge
  const sigCol = (label, sig, roleFallback, bureauFallback) => {
    const hasImg = sig && sig.image;
    const inner = hasImg
      ? `<img src="${sig.image}" alt="Signature" style="max-height:74px;max-width:100%;object-fit:contain;display:block;" />`
      : `<span>${esc(bureauFallback || "")}</span>`;
    const nom = (sig && sig.nom) || roleFallback;
    const dateLine = hasImg && sig.date
      ? `<span class="sig-title" style="color:#1b6b45;font-style:italic;">Signé électroniquement le ${esc(sig.date)}</span>`
      : "";
    return `
      <div class="signature-col">
        <span class="sig-label">${esc(label)}</span>
        <div class="sig-area">${inner}</div>
        <span class="sig-name">${esc(nom)}</span>
        <span class="sig-title">L'association Ma Belle Promo (MBP)</span>
        ${dateLine}
      </div>`;
  };

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PV de passation — ${esc(passation.titre || "MBP")}</title>
  <style>${MBP_STYLE}</style>
  <style>
    /* La checklist peut dépasser une page : on autorise la pagination naturelle */
    .a4 { overflow: visible; height: auto; }
    .doc-body { gap: 16px; }
    .cat-block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 4px; }
    .cat-head {
      display: flex; align-items: center; justify-content: space-between;
      background: #0a3d28; color: #fff; padding: 6px 12px; border-radius: 6px 6px 0 0;
    }
    .cat-name { font-family:'Cormorant Garamond',serif; font-size:11.5pt; font-weight:700; letter-spacing:0.02em; }
    .cat-count { font-family:'Lato',sans-serif; font-size:8pt; font-weight:700; color:#e6b84a; }
    .cat-table { width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-top:none; }
    .cat-table tr:not(:last-child) td { border-bottom:1px solid #eef2f6; }
    .global-bar-wrap { background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden; }
    .global-bar { height:100%; background:linear-gradient(to right,#1b6b45,#1a7a4e); border-radius:4px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Procès-verbal de passation</div>
        <div class="doc-ref">Réf. ${ref} · Édité le ${today()}</div>
      </div>

      <p class="intro-text">
        Le présent procès-verbal constate la <strong>transmission des responsabilités, des accès et des
        documents</strong> de l'association entre le bureau sortant et le bureau entrant. Il fait foi de la
        remise effective des éléments cochés ci-dessous.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Objet de la passation</span>
          <span class="info-value">${esc(passation.titre || "—")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Statut</span>
          <span class="info-value">${cloturee ? "Clôturée" : "En cours"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Bureau sortant</span>
          <span class="info-value">${esc(passation.bureau_sortant || "—")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Bureau entrant</span>
          <span class="info-value">${esc(passation.bureau_entrant || "—")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date de début</span>
          <span class="info-value">${fmtDate(passation.date_passation)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date de clôture</span>
          <span class="info-value">${fmtDate(passation.date_cloture)}</span>
        </div>
        <div class="info-row full-width">
          <span class="info-label">Progression globale — ${done}/${total} éléments transmis (${pct}%)</span>
          <span class="info-value"></span>
          <div class="global-bar-wrap" style="margin-top:4px;"><div class="global-bar" style="width:${pct}%;"></div></div>
        </div>
      </div>

      ${blocsCategories || `<p class="intro-text">Aucun élément dans cette passation.</p>`}

      ${passation.notes ? `<div class="notice-box"><p>${esc(passation.notes)}</p></div>` : ""}

      <div class="notice-box">
        <p>
          <strong>Confidentialité —</strong> aucun mot de passe ni identifiant n'est consigné dans ce document.
          Les cases « accès » attestent uniquement que la remise des identifiants a eu lieu de la main à la main.
        </p>
      </div>

      <div class="signature-block">
        ${sigCol("Pour le bureau sortant", opts.signatures?.sortant, "Le/La Président(e) sortant(e)", passation.bureau_sortant)}
        ${sigCol("Pour le bureau entrant", opts.signatures?.entrant, "Le/La Président(e) entrant(e)", passation.bureau_entrant)}
      </div>

    </div><!-- /doc-body -->

    <div class="doc-footer">
      <div class="footer-text">
        L'association Ma Belle Promo (MBP) · www.mabellepromo.org<br/>
        Faculté de Droit — Université de Lomé, Togo
      </div>
      <div class="footer-text" style="text-align:right">
        Document interne de passation<br/>
        Réf. ${ref}
      </div>
    </div>

  </div><!-- /a4 -->
</body>
</html>`;

  openDoc(html, `PV-Passation-MBP-${(passation.titre || "passation").replace(/\s+/g, "-")}.html`);
}
