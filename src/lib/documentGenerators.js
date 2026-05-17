import { supabase } from "./supabase";

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
function openDoc(html, filename = "document-mbp.html") {
  const origin = window.location.origin;
  const resolved = html
    .replace(/src="\/Logo%20Redesign1\.png"/g, `src="${origin}/Logo%20Redesign1.png"`)
    .replace(/src="\/images\/FDD\.png"/g, `src="${origin}/images/FDD.png"`);

  const { frame, remove, mkBarBtn } = _createOverlayShell(filename);

  const doPrint = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) {} };

  mkBarBtn("✕ Fermer",                "#1a5c38", remove);
  mkBarBtn("🖨 Imprimer / PDF",       "#b8861a", doPrint);
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
        <div class="stat-card" style="background:${solde >= 0 ? "#d1fae5" : "#fee2e2"};border-color:${solde >= 0 ? "#7db89a" : "#fca5a5"};">
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
