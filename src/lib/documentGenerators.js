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
  }

  .signature-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sig-label {
    font-family: 'Lato', sans-serif;
    font-size: 8pt;
    font-weight: 700;
    color: #0a3d28;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .sig-area {
    border: 1px dashed #b0c8bb;
    border-radius: 6px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fcfa;
  }

  .sig-area span {
    font-family: 'Lato', sans-serif;
    font-size: 8pt;
    color: #bbb;
  }

  .sig-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 10.5pt;
    color: #333;
    font-weight: 600;
  }

  .sig-title {
    font-family: 'Lato', sans-serif;
    font-size: 8pt;
    color: #777;
  }

  .doc-footer {
    padding: 14px 44px;
    border-top: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #fafafa;
  }

  .footer-text {
    font-family: 'Lato', sans-serif;
    font-size: 7.5pt;
    color: #aaa;
    line-height: 1.5;
  }

  .amount-highlight {
    background: linear-gradient(135deg, #0a3d28, #1a5e3a);
    border-radius: 8px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .amount-highlight .amount-label {
    font-family: 'Lato', sans-serif;
    font-size: 9pt;
    font-weight: 700;
    color: rgba(255,255,255,0.75);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .amount-highlight .amount-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22pt;
    font-weight: 700;
    color: #f0c040;
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

function padZero(n) { return String(n).padStart(2, "0"); }

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function today() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function refNumber(prefix, parts) {
  const now = new Date();
  return `${prefix}-${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}-${parts}`;
}

function openDoc(html) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Le navigateur a bloqué l'ouverture d'un nouvel onglet. Veuillez autoriser les popups pour ce site.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

export function genererAttestation(member) {
  const ref = refNumber("ATT", String(member.id ?? "").slice(0, 6).toUpperCase() || "MBP");
  const titre = member.bureau ? "membre du Bureau" : "membre actif";
  const localisation = [member.ville, member.pays].filter(Boolean).join(", ");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Attestation de membre — ${member.nom}</title>
  <style>${MBP_STYLE}</style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">
    🖨 Imprimer / Enregistrer PDF
  </button>

  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP"
           onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">FDD Ma Belle Promo</p>
        <p class="asso-sub">Faculté de Droit du Développement — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>

    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">Attestation de Membre</div>
        <div class="doc-ref">Réf. : ${ref} · Délivrée le ${today()}</div>
      </div>

      <p class="intro-text">
        Je soussigné(e), Président(e) de l'association <strong>FDD Ma Belle Promo</strong>,
        association de diplômés de la Faculté de Droit du Développement de l'Université de Lomé,
        promotion 1994–2000, atteste par la présente que :
      </p>

      <div class="info-box">
        <div class="info-row full-width">
          <span class="info-label">Nom complet</span>
          <span class="info-value">${member.nom}</span>
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
        ${member.email ? `
        <div class="info-row">
          <span class="info-label">Adresse e-mail</span>
          <span class="info-value">${member.email}</span>
        </div>` : ""}
        <div class="info-row">
          <span class="info-label">Qualité</span>
          <span class="info-value" style="color:#0a3d28;text-transform:capitalize">${titre}</span>
        </div>
      </div>

      <p class="intro-text">
        est bien <strong>${titre}</strong> de l'association FDD Ma Belle Promo, à jour de ses obligations statutaires à la date de délivrance de la présente attestation.
      </p>

      <div class="notice-box">
        <p>
          La présente attestation est délivrée à la demande de l'intéressé(e) et pour servir et valoir ce que de droit.
        </p>
      </div>

      <div class="signature-block">
        <div class="signature-col">
          <span class="sig-label">Délivrée à Lomé, le</span>
          <div class="sig-area"><span>${today()}</span></div>
          <span class="sig-name">Pour l'Association</span>
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
        FDD Ma Belle Promo · mabellepromo.vercel.app<br/>
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

  openDoc(html);
}

export function genererRecu(member, annee, montant, datePaiement, modePaiement, montantAttendu, versements, statut) {
  const ref      = refNumber("REC", `${annee}-${String(member.id ?? "").slice(0, 6).toUpperCase() || "MBP"}`);
  const verse    = Number(montant) || 0;
  const attendu  = Number(montantAttendu) || verse;
  const reste    = Math.max(0, attendu - verse);
  const partiel  = statut === "partiel" || (verse > 0 && reste > 0);
  const fmt      = n => n > 0 ? Number(n).toLocaleString("fr-FR") : "—";
  const listeV   = Array.isArray(versements) && versements.length > 0 ? versements : null;
  const modeFormate = modePaiement
    ? modePaiement.charAt(0).toUpperCase() + modePaiement.slice(1)
    : "Non précisé";

  // ── Tableau des versements (si multi-paiements) ──────────────────────────
  const versementsHTML = listeV ? `
    <div style="margin:16px 0 0;">
      <div style="font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#0a3d28;text-transform:uppercase;letter-spacing:0.10em;margin-bottom:8px;">
        Détail des versements (${listeV.length})
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:9.5pt;">
        <thead>
          <tr style="background:#e8f5ee;">
            <th style="padding:6px 10px;text-align:left;font-size:7pt;color:#0a3d28;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">#</th>
            <th style="padding:6px 10px;text-align:left;font-size:7pt;color:#0a3d28;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Date</th>
            <th style="padding:6px 10px;text-align:left;font-size:7pt;color:#0a3d28;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Mode</th>
            <th style="padding:6px 10px;text-align:right;font-size:7pt;color:#0a3d28;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${listeV.map((v, i) => `
          <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"};border-bottom:1px solid #eee;">
            <td style="padding:6px 10px;color:#aaa;font-size:8pt;">${i + 1}</td>
            <td style="padding:6px 10px;">${formatDate(v.date)}</td>
            <td style="padding:6px 10px;text-transform:capitalize;">${v.mode || "—"}</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700;">${Number(v.montant).toLocaleString("fr-FR")} FCFA</td>
          </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background:#e8f5ee;border-top:2px solid #0a3d28;">
            <td colspan="3" style="padding:8px 10px;font-weight:700;color:#0a3d28;font-family:'Lato',sans-serif;font-size:8pt;">Total versé à ce jour</td>
            <td style="padding:8px 10px;text-align:right;font-weight:700;color:#0a3d28;font-family:'Cormorant Garamond',serif;font-size:12pt;">${fmt(verse)} FCFA</td>
          </tr>
        </tfoot>
      </table>
    </div>` : "";

  // ── Bloc montant : bilan 3 colonnes (partiel) ou highlight vert (soldé) ──
  const montantHTML = partiel ? `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0;">
      <div style="background:#e8f5ee;border-radius:8px;padding:14px 10px;text-align:center;">
        <div style="font-family:'Lato',sans-serif;font-size:7pt;font-weight:700;color:#0a3d28;text-transform:uppercase;letter-spacing:0.10em;margin-bottom:6px;">Versé</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:16pt;font-weight:700;color:#0a3d28;">${fmt(verse)}</div>
        <div style="font-size:7pt;color:#666;margin-top:2px;">FCFA</div>
      </div>
      <div style="background:#f7faf8;border:1px solid #c8ddd2;border-radius:8px;padding:14px 10px;text-align:center;">
        <div style="font-family:'Lato',sans-serif;font-size:7pt;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.10em;margin-bottom:6px;">Attendu</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:16pt;font-weight:700;color:#444;">${fmt(attendu)}</div>
        <div style="font-size:7pt;color:#666;margin-top:2px;">FCFA</div>
      </div>
      <div style="background:#fff8e8;border:1px solid #f59e0b;border-radius:8px;padding:14px 10px;text-align:center;">
        <div style="font-family:'Lato',sans-serif;font-size:7pt;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.10em;margin-bottom:6px;">Reste à payer</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:16pt;font-weight:700;color:#b45309;">${fmt(reste)}</div>
        <div style="font-size:7pt;color:#b45309;margin-top:2px;">FCFA</div>
      </div>
    </div>` : `
    <div class="amount-highlight">
      <div>
        <div class="amount-label">Montant reçu — cotisation soldée</div>
        <div style="font-family:'Lato',sans-serif;font-size:8pt;color:rgba(255,255,255,0.55);margin-top:3px;">Exercice ${annee} · Paiement complet</div>
      </div>
      <div class="amount-value">${fmt(verse)} FCFA</div>
    </div>`;

  // ── Notice adaptée ────────────────────────────────────────────────────────
  const noticeHTML = partiel ? `
    <div class="notice-box">
      <p>Ce reçu atteste un <strong style="color:#6b4c00">versement partiel</strong> de <strong style="color:#6b4c00">${fmt(verse)} FCFA</strong>
      au titre de la cotisation ${annee}. Le solde de <strong style="color:#6b4c00">${fmt(reste)} FCFA</strong> reste dû.
      Un nouveau reçu sera émis à réception de chaque versement complémentaire.</p>
    </div>` : `
    <div class="notice-box">
      <p>Ce reçu constitue la preuve officielle du règlement <strong style="color:#6b4c00">complet</strong>
      de la cotisation de l'exercice <strong style="color:#6b4c00">${annee}</strong>.
      Conservez-le précieusement. Pour toute question, contactez le trésorier de l'association.</p>
    </div>`;

  // ── Badge statut ──────────────────────────────────────────────────────────
  const badgeHTML = partiel
    ? `<span style="display:inline-block;margin-top:8px;background:#fff8e8;border:1px solid #f59e0b;border-radius:4px;padding:3px 12px;font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#b45309;letter-spacing:0.08em;text-transform:uppercase;">PAIEMENT PARTIEL</span>`
    : `<span style="display:inline-block;margin-top:8px;background:#e8f5ee;border:1px solid #0a3d28;border-radius:4px;padding:3px 12px;font-family:'Lato',sans-serif;font-size:7.5pt;font-weight:700;color:#0a3d28;letter-spacing:0.08em;text-transform:uppercase;">✓ COTISATION SOLDÉE</span>`;

  const dateLabel = listeV ? "Dernier versement" : "Date de paiement";
  const modeLabel = listeV ? "Mode (dernier versement)" : "Mode de règlement";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${partiel ? "Reçu partiel" : "Reçu"} cotisation ${annee} — ${member.nom}</title>
  <style>${MBP_STYLE}</style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">
    🖨 Imprimer / Enregistrer PDF
  </button>

  <div class="a4">

    <div class="doc-header">
      <img class="doc-header-logo" src="/Logo%20Redesign1.png" alt="Logo MBP"
           onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">FDD Ma Belle Promo</p>
        <p class="asso-sub">Faculté de Droit du Développement — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>

    <div class="gold-bar"></div>

    <div class="doc-body">

      <div class="doc-title-block">
        <div class="doc-title">${partiel ? "Reçu de Versement Partiel" : "Reçu de Cotisation"}</div>
        <div class="doc-ref">Réf. : ${ref} · Émis le ${today()}</div>
        ${badgeHTML}
      </div>

      <p class="intro-text">
        L'association <strong>FDD Ma Belle Promo</strong> accuse réception du versement effectué
        par le/la membre ci-dessous au titre de la cotisation annuelle pour l'exercice
        <strong>${annee}</strong>.
      </p>

      <div class="info-box">
        <div class="info-row full-width">
          <span class="info-label">Membre cotisant</span>
          <span class="info-value">${member.nom}</span>
        </div>
        ${member.email ? `
        <div class="info-row full-width">
          <span class="info-label">Adresse e-mail</span>
          <span class="info-value">${member.email}</span>
        </div>` : ""}
        <div class="info-row">
          <span class="info-label">Exercice</span>
          <span class="info-value">${annee}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${dateLabel}</span>
          <span class="info-value">${formatDate(datePaiement)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${modeLabel}</span>
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
        FDD Ma Belle Promo · mabellepromo.vercel.app<br/>
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

  openDoc(html);
}
