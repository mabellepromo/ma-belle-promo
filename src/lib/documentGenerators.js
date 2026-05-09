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

  .mini-card-header {
    background: linear-gradient(135deg, #0a3d28 0%, #1a7a4e 100%);
    padding: 6px 10px 5px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .mini-card-logo {
    height: 20px;
    width: auto;
    opacity: 0.92;
  }

  .mini-card-org {
    font-size: 6.5pt;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.04em;
    line-height: 1.2;
    flex: 1;
  }

  .mini-card-chip {
    width: 22px;
    height: 16px;
    background: linear-gradient(135deg, #e6b84a, #b8861a);
    border-radius: 3px;
    flex-shrink: 0;
  }

  .mini-card-body {
    background: #fff;
    flex: 1;
    padding: 5px 10px 4px;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .mini-card-photo {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    border: 2px solid #b8861a;
    flex-shrink: 0;
  }

  .mini-card-initiale {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0a3d28, #1a7a4e);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14pt;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid #b8861a;
  }

  .mini-card-info { flex: 1; min-width: 0; }

  .mini-card-name {
    font-size: 9pt;
    font-weight: 700;
    color: #0a3d28;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mini-card-detail {
    font-size: 6.5pt;
    color: #555;
    line-height: 1.4;
    margin-top: 2px;
  }

  .mini-card-id {
    font-size: 6pt;
    font-family: monospace;
    color: #888;
    margin-top: 3px;
    letter-spacing: 0.05em;
  }

  .mini-card-footer {
    background: linear-gradient(135deg, #0a3d28 0%, #1a7a4e 100%);
    padding: 4px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .mini-card-footer-text {
    font-size: 5.5pt;
    color: rgba(255,255,255,0.65);
    letter-spacing: 0.05em;
  }

  .mini-card-dots {
    display: flex;
    gap: 3px;
  }

  .mini-card-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.30);
  }

  .mini-card-dots span:last-child {
    background: #b8861a;
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

export function genererAttestation(member) {
  const ref = refNumber("ATT", String(member.id ?? "").slice(0, 6).toUpperCase() || "MBP");
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
        <p class="asso-name">FDD Ma Belle Promo</p>
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
          L'Association <strong>FDD Ma Belle Promo (MBP)</strong>, association des diplômés
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
            <span class="sig-title">FDD Ma Belle Promo</span>
          </div>
          <div class="signature-col">
            <span class="sig-label">Signature et cachet</span>
            <div style="height:80px;display:flex;align-items:center;overflow:visible;">
              <img src="/images/FDD.png" alt="Cachet"
                   style="max-height:100px;max-width:100%;object-fit:contain;display:block;transform:translateX(-1cm) translateY(0.5cm);"
                   onerror="this.style.display='none'" />
            </div>
            <span class="sig-name" style="margin-top:18px;">Fabienne SENAYA-ATAYI</span>
            <span class="sig-title">Présidente — FDD Ma Belle Promo</span>
          </div>
        </div>

        <!-- Mini carte membre -->
        <div class="mini-card">
          <div class="mini-card-header">
            <img class="mini-card-logo" src="/Logo%20Redesign1.png" alt="MBP"
                 onerror="this.style.display='none'" />
            <span class="mini-card-org">FDD Ma Belle Promo<br/>Lomé · 1994–2000</span>
            <div class="mini-card-chip"></div>
          </div>
          <div class="mini-card-body">
            ${member.photo
              ? `<img class="mini-card-photo" src="${member.photo}" alt="${member.nom}"
                      onerror="this.style.display='none'" />`
              : `<div class="mini-card-initiale">${initiale}</div>`
            }
            <div class="mini-card-info">
              <div class="mini-card-name">${member.nom}</div>
              <div class="mini-card-detail">
                ${member.profession ? `${member.profession}<br/>` : ""}
                ${member.bureau ? "Membre du Bureau Exécutif" : "Membre actif"}
              </div>
              <div class="mini-card-id">ID · ${ref}</div>
            </div>
          </div>
          <div class="mini-card-footer">
            <span class="mini-card-footer-text">mabellepromo.org</span>
            <div class="mini-card-dots"><span></span><span></span><span></span></div>
          </div>
        </div>

      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        FDD Ma Belle Promo · www.mabellepromo.org<br/>
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
        <p class="asso-name">FDD Ma Belle Promo</p>
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
        L'Association <strong>FDD Ma Belle Promo</strong> accuse réception du paiement de la cotisation annuelle
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
          <span class="sig-title">FDD Ma Belle Promo</span>
        </div>
        <div class="signature-col">
          <span class="sig-label">Signature et cachet</span>
          <div style="height:100px;display:flex;align-items:center;overflow:visible;">
            <img src="/images/FDD.png" alt="Signature et cachet"
                 style="max-height:120px;max-width:100%;object-fit:contain;display:block;transform:translateX(-1cm) translateY(0.5cm);"
                 onerror="this.style.display='none'" />
          </div>
          <span class="sig-name" style="margin-top:20px;">Fabienne SENAYA-ATAYI</span>
          <span class="sig-title">Présidente — FDD Ma Belle Promo</span>
        </div>
      </div>

    </div>

    <div class="doc-footer">
      <div class="footer-text">
        FDD Ma Belle Promo · www.mabellepromo.org<br/>
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
