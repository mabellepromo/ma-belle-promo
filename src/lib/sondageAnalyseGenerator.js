// ── Rapport d'analyse d'un sondage — document HTML imprimable (A4) ─────────
// Généré à la demande depuis le dashboard (rubrique Sondages) et ouvert via
// l'overlay unifié openDoc(). Agrège les réponses par question : répartition
// des choix, moyennes des notes, verbatims texte, participation des invités.

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const BAR_COLORS = ["#0f5c3a", "#b8861a", "#3b82f6", "#8b5cf6", "#f43f5e", "#06b6d4"];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

// Barre horizontale de répartition (pourcentage + effectif)
function barRow(label, count, total, color, isTop) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `
    <div class="bar-row">
      <div class="bar-label">${isTop ? "★ " : ""}${esc(label)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.max(pct, 1)}%;background:${color};"></div>
      </div>
      <div class="bar-value">${pct}&nbsp;% <span class="bar-count">(${count})</span></div>
    </div>`;
}

// Index sentinelle de l'option « Autre (précisez) » dans valeur_options
const OTHER_INDEX = -1;

// Analyse d'une question à choix (single / multiple / dropdown / ouinon)
function choiceAnalysis(q, qr) {
  const options = q.type === "ouinon" ? ["Oui", "Non"] : [...(q.options || [])];
  const counts = options.map((_, i) => qr.filter((r) => r.valeur_options?.includes(i)).length);
  const otherRows = q.type !== "ouinon" && q.config?.allow_other
    ? qr.filter((r) => r.valeur_options?.includes(OTHER_INDEX))
    : [];
  if (q.config?.allow_other && q.type !== "ouinon") {
    options.push("Autre");
    counts.push(otherRows.length);
  }
  const answered = qr.length;
  const max = Math.max(...counts, 0);
  const topIdx = counts.indexOf(max);
  const bars = options
    .map((opt, i) => barRow(opt, counts[i], answered, BAR_COLORS[i % BAR_COLORS.length], max > 0 && i === topIdx))
    .join("");
  const synthese =
    answered === 0
      ? "Aucune réponse pour cette question."
      : `Réponse la plus fréquente : <strong>${esc(options[topIdx])}</strong> (${Math.round((max / answered) * 100)}&nbsp;% des ${answered} répondant${answered !== 1 ? "s" : ""}).`;
  const otherVerbatims = otherRows.filter((r) => r.valeur_texte).length
    ? `<p class="q-synthese">Réponses « Autre » :</p><ul class="verbatims">${otherRows.filter((r) => r.valeur_texte).map((r) => `<li>${esc(r.valeur_texte)}</li>`).join("")}</ul>`
    : "";
  return `${bars}<p class="q-synthese">${synthese}</p>${otherVerbatims}`;
}

// Analyse d'une question échelle 1–10
function echelleAnalysis(qr) {
  const notes = qr.map((r) => r.valeur_note).filter((v) => v != null);
  if (!notes.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;
  const avg = notes.reduce((a, b) => a + b, 0) / notes.length;
  const bars = Array.from({ length: 10 }, (_, i) => 10 - i)
    .map((n) => {
      const c = notes.filter((v) => v === n).length;
      if (!c) return "";
      return barRow(String(n), c, notes.length, n >= 8 ? "#0f5c3a" : n >= 5 ? "#b8861a" : "#b91c1c", false);
    })
    .join("");
  const appreciation = avg >= 8 ? "très positive" : avg >= 6.5 ? "positive" : avg >= 5 ? "mitigée" : "faible";
  return `
    <div class="note-avg">Moyenne : <strong>${avg.toFixed(1).replace(".", ",")}/10</strong> — appréciation ${appreciation} (${notes.length} réponse${notes.length !== 1 ? "s" : ""})</div>
    ${bars}`;
}

// Analyse d'une question note /5
function noteAnalysis(qr) {
  const notes = qr.map((r) => r.valeur_note).filter((v) => v != null);
  if (!notes.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;
  const avg = notes.reduce((a, b) => a + b, 0) / notes.length;
  const counts = [1, 2, 3, 4, 5].map((n) => notes.filter((v) => v === n).length);
  const bars = [5, 4, 3, 2, 1]
    .map((n) => barRow(`${n} ★`, counts[n - 1], notes.length, n >= 4 ? "#0f5c3a" : n === 3 ? "#b8861a" : "#b91c1c", false))
    .join("");
  const appreciation =
    avg >= 4.2 ? "très positive" : avg >= 3.5 ? "positive" : avg >= 2.5 ? "mitigée" : "faible";
  return `
    <div class="note-avg">Note moyenne : <strong>${avg.toFixed(1).replace(".", ",")}/5</strong> — appréciation ${appreciation} (${notes.length} note${notes.length !== 1 ? "s" : ""})</div>
    ${bars}`;
}

// Analyse d'une question texte libre — verbatims
function texteAnalysis(qr) {
  const textes = qr.map((r) => r.valeur_texte).filter(Boolean);
  if (!textes.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;
  return `
    <p class="q-synthese">${textes.length} réponse${textes.length !== 1 ? "s" : ""} libre${textes.length !== 1 ? "s" : ""} :</p>
    <ul class="verbatims">${textes.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

// Analyse d'une question texte numérique — total, moyenne, extrêmes
function nombreAnalysis(qr) {
  const nums = qr
    .map((r) => r.valeur_texte?.trim())
    .filter((t) => t && !isNaN(Number(t)))
    .map(Number);
  if (!nums.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = sum / nums.length;
  return `
    <div class="note-avg">Total : <strong>${sum}</strong> — moyenne : ${avg.toFixed(1).replace(".", ",")} par répondant (${nums.length} réponse${nums.length !== 1 ? "s" : ""}, min ${Math.min(...nums)}, max ${Math.max(...nums)})</div>`;
}
// Analyse d'une question « effectifs » — totaux agrégés par option choisie.
// Les réponses sont stockées en texte « Padel : 3 | Karting : 2 » ; on parse
// chaque segment et on rattache le libellé aux options de la question source
// (insensible à la casse) pour fusionner les saisies libres historiques.
function effectifsAnalysis(q, qr, questions) {
  const source = (questions || []).find((p) => p.id === q.config?.source_question_id);
  const canon = (label) => {
    const found = (source?.options || []).find((o) => o.trim().toLowerCase() === label.trim().toLowerCase());
    return found || label.trim();
  };
  const totals = {};   // label → { personnes, familles }
  const unparsed = [];
  let answered = 0;
  qr.forEach((r) => {
    const txt = (r.valeur_texte || "").trim();
    if (!txt) return;
    answered++;
    let matchedAny = false;
    txt.split(/[|\n;,]+/).forEach((seg) => {
      const m = seg.match(/^\s*(.+?)\s*[:\-–]?\s*(\d+)\s*$/);
      if (!m) return;
      const label = canon(m[1]);
      const n = Number(m[2]);
      (totals[label] = totals[label] || { personnes: 0, familles: 0 });
      totals[label].personnes += n;
      totals[label].familles += 1;
      matchedAny = true;
    });
    if (!matchedAny) unparsed.push(txt);
  });

  const entries = Object.entries(totals).sort((a, b) => b[1].personnes - a[1].personnes);
  if (!entries.length && !unparsed.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;

  const grandTotal = entries.reduce((a, [, v]) => a + v.personnes, 0);
  const bars = entries
    .map(([label, v], i) =>
      barRow(`${label} — ${v.personnes} pers.`, v.personnes, grandTotal, BAR_COLORS[i % BAR_COLORS.length], i === 0))
    .join("");
  const synthese = entries.length
    ? `Total : <strong>${grandTotal} personne${grandTotal !== 1 ? "s" : ""}</strong> sur ${entries.length} activité${entries.length !== 1 ? "s" : ""} (${answered} réponse${answered !== 1 ? "s" : ""}). ` +
      entries.map(([label, v]) => `<strong>${esc(label)}</strong> : ${v.personnes} pers. (${v.familles} famille${v.familles !== 1 ? "s" : ""})`).join(" · ") + "."
    : "";
  const verbatims = unparsed.length
    ? `<p class="q-synthese">Réponses non chiffrables :</p><ul class="verbatims">${unparsed.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
    : "";
  return `${bars}<p class="q-synthese">${synthese}</p>${verbatims}`;
}

// Analyse d'une question date — regroupement par valeur
function dateAnalysis(qr) {
  const dates = qr.map((r) => r.valeur_texte).filter(Boolean);
  if (!dates.length) return `<p class="q-synthese">Aucune réponse pour cette question.</p>`;
  const grouped = {};
  dates.forEach((d) => { grouped[d] = (grouped[d] || 0) + 1; });
  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const bars = sorted
    .map(([d, c], i) => barRow(fmtDate(d), c, dates.length, BAR_COLORS[i % BAR_COLORS.length], i === 0))
    .join("");
  return `${bars}<p class="q-synthese">Date la plus choisie : <strong>${fmtDate(sorted[0][0])}</strong> (${sorted[0][1]} réponse${sorted[0][1] !== 1 ? "s" : ""}).</p>`;
}

const Q_TYPE_LABELS = {
  ouinon: "Oui / Non", single: "Choix unique", multiple: "Choix multiple",
  dropdown: "Liste déroulante", texte: "Texte libre", date: "Date", note: "Note /5",
  echelle: "Échelle 1–10", effectifs: "Effectifs par option",
};

/**
 * Fiche analytique individuelle d'une inscription — générée à la demande
 * depuis le volet « Réponses individuelles » du dashboard.
 * Pour chaque question : la réponse du répondant, mise en regard du groupe
 * (pourcentages des options, moyennes des notes).
 * @param {object} sondage    — sondage avec questions triées
 * @param {object} soumission — { id, created_at, reponses: [...] }
 * @param {object} ctx        — { numero, displayName, allReponses, totalSoumissions }
 */
export function generateFicheInscription(sondage, soumission, { numero, displayName, allReponses = [], totalSoumissions = 0 }) {
  const questions = sondage.questions || [];
  const mine = (qid) => (soumission.reponses || []).find((r) => r.question_id === qid);
  const group = (qid) => allReponses.filter((r) => r.question_id === qid);

  const blocks = questions.map((q, i) => {
    const rep = mine(q.id);
    const gq = group(q.id);
    let body;

    if (q.type === "texte" || q.type === "date" || q.type === "effectifs") {
      const txt = rep?.valeur_texte
        ? (q.type === "date" ? fmtDate(rep.valeur_texte) : rep.valeur_texte)
        : null;
      body = txt
        ? `<div class="answer-box">${esc(txt)}</div>`
        : `<p class="q-synthese">Sans réponse.</p>`;
    } else if (q.type === "note" || q.type === "echelle") {
      const max = q.type === "note" ? 5 : 10;
      const val = rep?.valeur_note;
      const gNotes = gq.map((r) => r.valeur_note).filter((v) => v != null);
      const gAvg = gNotes.length ? gNotes.reduce((a, b) => a + b, 0) / gNotes.length : null;
      body = val == null
        ? `<p class="q-synthese">Sans réponse.</p>`
        : `
        <div class="gauge-row">
          <div class="gauge-track">
            <div class="gauge-fill" style="width:${Math.round((val / max) * 100)}%"></div>
            ${gAvg != null ? `<div class="gauge-marker" style="left:${Math.round((gAvg / max) * 100)}%" title="moyenne du groupe"></div>` : ""}
          </div>
          <div class="gauge-value">${val}/${max}</div>
        </div>
        ${gAvg != null ? `<p class="q-synthese">Moyenne du groupe : ${gAvg.toFixed(1).replace(".", ",")}/${max} (trait doré).</p>` : ""}`;
    } else {
      // Questions à choix : réponse du répondant vs répartition du groupe
      const options = q.type === "ouinon" ? ["Oui", "Non"] : [...(q.options || [])];
      const idxs = options.map((_, oi) => oi);
      if (q.type !== "ouinon" && q.config?.allow_other) { options.push("Autre"); idxs.push(OTHER_INDEX); }
      const answeredGroup = gq.length;
      body = options.map((opt, k) => {
        const oi = idxs[k];
        const chosen = rep?.valeur_options?.includes(oi);
        const gCount = gq.filter((r) => r.valeur_options?.includes(oi)).length;
        const gPct = answeredGroup ? Math.round((gCount / answeredGroup) * 100) : 0;
        return `
        <div class="opt-row${chosen ? " chosen" : ""}">
          <span class="opt-check">${chosen ? "✔" : ""}</span>
          <span class="opt-label">${esc(opt)}${chosen && oi === OTHER_INDEX && rep?.valeur_texte ? ` — ${esc(rep.valeur_texte)}` : ""}</span>
          <span class="opt-group">groupe : ${gPct}&nbsp;%</span>
        </div>`;
      }).join("");
      if (!rep?.valeur_options?.length) body += `<p class="q-synthese">Sans réponse.</p>`;
    }

    return `
    <div class="q-block">
      <div class="q-head">
        <span class="q-num">${i + 1}</span>
        <div class="q-head-txt"><div class="q-libelle">${esc(q.libelle)}</div></div>
      </div>
      ${body}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscription n°${numero} — ${esc(sondage.titre)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@300;400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4 portrait; margin: 14mm 0; }
    body { font-family: 'Lato', sans-serif; background: #f0f0f0; display: flex; justify-content: center; padding: 20px 0 40px; color: #1f2937; }
    @media print { body { background: #fff; padding: 0; display: block; } .a4 { box-shadow: none; margin: 0; width: 100%; min-height: 0; } .no-print { display: none !important; } }
    .a4 { width: 210mm; min-height: 297mm; background: #fff; box-shadow: 0 4px 30px rgba(0,0,0,0.25); }
    .doc-header { background: linear-gradient(135deg, #0a3d28 0%, #0f5c3a 60%, #1a7a4e 100%); padding: 24px 36px 18px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .doc-header img { height: 48px; width: auto; }
    .doc-header-asso { text-align: right; font-family: 'Cormorant Garamond', serif; color: rgba(255,255,255,0.9); line-height: 1.35; }
    .asso-name { font-size: 14pt; font-weight: 700; color: #fff; }
    .asso-sub { font-size: 9pt; font-style: italic; color: rgba(255,255,255,0.72); }
    .gold-bar { height: 4px; background: linear-gradient(to right, #b8861a, #e6b84a, #b8861a); }
    .doc-body { padding: 26px 40px 32px; }
    .doc-title { font-family: 'Cormorant Garamond', serif; font-size: 18pt; font-weight: 700; color: #0a3d28; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
    .doc-sub { text-align: center; font-size: 10.5pt; color: #4b5563; margin-top: 4px; }
    .identity { display: flex; gap: 12px; justify-content: center; margin: 16px 0 6px; }
    .id-card { border: 1px solid #e5e7eb; border-top: 3px solid #b8861a; border-radius: 6px; padding: 8px 18px; text-align: center; }
    .id-value { font-size: 12pt; font-weight: 700; color: #0a3d28; }
    .id-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-top: 2px; }
    .q-block { margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; break-inside: avoid; page-break-inside: avoid; }
    .q-head { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px; }
    .q-num { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: #0a3d28; color: #fff; font-size: 8.5pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .q-libelle { font-size: 10.5pt; font-weight: 700; color: #111827; }
    .answer-box { background: #f8f7f2; border-left: 3px solid #b8861a; border-radius: 4px; padding: 8px 12px; font-size: 10pt; }
    .opt-row { display: flex; align-items: center; gap: 8px; padding: 3px 6px; border-radius: 4px; font-size: 9.5pt; color: #6b7280; }
    .opt-row.chosen { background: #eef6f0; color: #0a3d28; font-weight: 700; }
    .opt-check { width: 14px; color: #0f5c3a; font-weight: 700; }
    .opt-label { flex: 1; }
    .opt-group { font-size: 8pt; font-weight: 400; color: #9ca3af; }
    .gauge-row { display: flex; align-items: center; gap: 10px; }
    .gauge-track { flex: 1; height: 14px; background: #f3f4f6; border-radius: 7px; overflow: visible; position: relative; }
    .gauge-fill { height: 100%; border-radius: 7px; background: linear-gradient(to right, #0f5c3a, #1a7a4e); }
    .gauge-marker { position: absolute; top: -3px; width: 3px; height: 20px; background: #b8861a; border-radius: 2px; }
    .gauge-value { font-size: 11pt; font-weight: 700; color: #0a3d28; }
    .q-synthese { font-size: 8.5pt; color: #6b7280; margin-top: 6px; font-style: italic; }
    .doc-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 8pt; color: #9ca3af; text-align: center; }
    .print-btn { position: fixed; top: 14px; right: 14px; background: #b8861a; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; z-index: 100; }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">
    <div class="doc-header">
      <img src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>
    <div class="doc-body">
      <div class="doc-title">Fiche d'inscription n°${numero}</div>
      <div class="doc-sub">${esc(sondage.titre)}</div>
      <div class="identity">
        <div class="id-card"><div class="id-value">${esc(displayName || "Anonyme")}</div><div class="id-label">Répondant</div></div>
        <div class="id-card"><div class="id-value">${fmtDate(soumission.created_at)}</div><div class="id-label">Date d'inscription</div></div>
        <div class="id-card"><div class="id-value">n°${numero} / ${totalSoumissions}</div><div class="id-label">Inscription</div></div>
      </div>
      ${blocks}
      <div class="doc-footer">Association Ma Belle Promo — fiche individuelle générée à la demande depuis le tableau de bord. Les pourcentages « groupe » comparent au total des ${totalSoumissions} inscription${totalSoumissions !== 1 ? "s" : ""}.</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Génère le rapport d'analyse complet d'un sondage.
 * @param {object} sondage  — sondage avec ses questions triées
 * @param {object} data     — { soumissions, reponses, invitations }
 * @returns {string} HTML autonome imprimable
 */
export function generateSondageAnalyse(sondage, { soumissions = [], reponses = [], invitations = [] }) {
  const total = soumissions.length;
  const questions = sondage.questions || [];

  // Taux de complétion global : réponses données / réponses possibles
  const possible = total * questions.length;
  const completion = possible > 0 ? Math.round((reponses.length / possible) * 100) : 0;

  // Participation des invités
  const invited = invitations.length;
  const responded = invitations.filter((i) => i.a_repondu).length;

  // Période des réponses
  const dates = soumissions.map((s) => new Date(s.created_at)).sort((a, b) => a - b);
  const periode = total
    ? dates[0].toDateString() === dates[dates.length - 1].toDateString()
      ? fmtDate(dates[0])
      : `du ${fmtDate(dates[0])} au ${fmtDate(dates[dates.length - 1])}`
    : "—";

  const kpis = [
    { label: "Réponses reçues", value: String(total) },
    { label: "Taux de complétion", value: `${completion} %` },
    ...(invited > 0
      ? [{ label: "Participation invités", value: `${responded}/${invited} (${Math.round((responded / invited) * 100)} %)` }]
      : []),
    { label: "Période", value: periode, small: true },
  ];

  const questionBlocks = questions
    .map((q, i) => {
      const qr = reponses.filter((r) => r.question_id === q.id);
      let body;
      if (q.type === "effectifs") body = effectifsAnalysis(q, qr, questions);
      else if (q.type === "texte") body = q.config?.validation === "nombre" ? nombreAnalysis(qr) : texteAnalysis(qr);
      else if (q.type === "date") body = dateAnalysis(qr);
      else if (q.type === "note") body = noteAnalysis(qr);
      else if (q.type === "echelle") body = echelleAnalysis(qr);
      else body = choiceAnalysis(q, qr);
      const answeredPct = total > 0 ? Math.round((qr.length / total) * 100) : 0;
      // Sous-question conditionnelle : rappeler sa condition d'affichage
      const cond = q.config?.condition;
      const parent = cond ? questions.find(p => p.id === cond.question_id) : null;
      const parentOpts = parent ? (parent.type === "ouinon" ? ["Oui", "Non"] : parent.options || []) : [];
      const condLabel = parent
        ? ` · sous-question (si « ${esc(parent.libelle)} » = ${esc(parentOpts[cond.option_index] ?? "?")})`
        : "";
      return `
      <div class="q-block">
        <div class="q-head">
          <span class="q-num">${i + 1}</span>
          <div class="q-head-txt">
            <div class="q-libelle">${esc(q.libelle)}</div>
            <div class="q-meta">${Q_TYPE_LABELS[q.type] || q.type} · ${qr.length}/${total} répondant${total !== 1 ? "s" : ""} (${answeredPct} %)${condLabel}</div>
          </div>
        </div>
        ${body}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Analyse — ${esc(sondage.titre)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@300;400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4 portrait; margin: 14mm 0; }
    body { font-family: 'Lato', sans-serif; background: #f0f0f0; display: flex; justify-content: center; padding: 20px 0 40px; color: #1f2937; }
    @media print { body { background: #fff; padding: 0; display: block; } .a4 { box-shadow: none; margin: 0; width: 100%; min-height: 0; } }
    .a4 { width: 210mm; min-height: 297mm; background: #fff; box-shadow: 0 4px 30px rgba(0,0,0,0.25); }
    .doc-header { background: linear-gradient(135deg, #0a3d28 0%, #0f5c3a 60%, #1a7a4e 100%); padding: 24px 36px 18px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .doc-header img { height: 48px; width: auto; }
    .doc-header-asso { text-align: right; font-family: 'Cormorant Garamond', serif; color: rgba(255,255,255,0.9); line-height: 1.35; }
    .asso-name { font-size: 14pt; font-weight: 700; color: #fff; }
    .asso-sub { font-size: 9pt; font-style: italic; color: rgba(255,255,255,0.72); }
    .gold-bar { height: 4px; background: linear-gradient(to right, #b8861a, #e6b84a, #b8861a); }
    .doc-body { padding: 26px 40px 32px; }
    .doc-title { font-family: 'Cormorant Garamond', serif; font-size: 19pt; font-weight: 700; color: #0a3d28; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
    .doc-sub { text-align: center; font-size: 10.5pt; color: #4b5563; margin-top: 4px; }
    .doc-ref { text-align: center; font-size: 8pt; color: #999; letter-spacing: 0.08em; margin-top: 6px; padding-bottom: 18px; border-bottom: 1px solid #e0e0e0; }
    .kpis { display: flex; gap: 12px; margin: 20px 0 6px; }
    .kpi { flex: 1; border: 1px solid #e5e7eb; border-top: 3px solid #b8861a; border-radius: 6px; padding: 10px 12px; text-align: center; }
    .kpi-value { font-size: 15pt; font-weight: 700; color: #0a3d28; }
    .kpi-value.small { font-size: 10.5pt; line-height: 1.3; padding-top: 4px; }
    .kpi-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-top: 3px; }
    .q-block { margin-top: 18px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; break-inside: avoid; page-break-inside: avoid; }
    .q-head { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
    .q-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #0a3d28; color: #fff; font-size: 9pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .q-libelle { font-size: 11pt; font-weight: 700; color: #111827; }
    .q-meta { font-size: 8pt; color: #6b7280; margin-top: 2px; }
    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
    .bar-label { width: 32%; font-size: 9pt; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-track { flex: 1; height: 11px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 6px; }
    .bar-value { width: 72px; text-align: right; font-size: 9pt; font-weight: 700; color: #111827; }
    .bar-count { font-weight: 400; color: #6b7280; }
    .q-synthese { font-size: 9pt; color: #374151; margin-top: 8px; font-style: italic; }
    .note-avg { font-size: 10pt; margin-bottom: 8px; }
    .verbatims { margin: 6px 0 0 18px; }
    .verbatims li { font-size: 9pt; color: #374151; margin-bottom: 4px; }
    .doc-footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 8pt; color: #9ca3af; text-align: center; }
    .print-btn { position: fixed; top: 14px; right: 14px; background: #b8861a; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; z-index: 100; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <button class="no-print print-btn" type="button">🖨 Imprimer / Enregistrer PDF</button>
  <div class="a4">
    <div class="doc-header">
      <img src="/Logo%20Redesign1.png" alt="Logo MBP" onerror="this.style.display='none'" />
      <div class="doc-header-asso">
        <p class="asso-name">L'association Ma Belle Promo (MBP)</p>
        <p class="asso-sub">Faculté de Droit — Université de Lomé</p>
        <p class="asso-sub">Promotion 1994 – 2000 · Lomé, Togo</p>
      </div>
    </div>
    <div class="gold-bar"></div>
    <div class="doc-body">
      <div class="doc-title">Rapport d'analyse de sondage</div>
      <div class="doc-sub">${esc(sondage.titre)}${sondage.description ? ` — ${esc(sondage.description)}` : ""}</div>
      <div class="doc-ref">Généré le ${fmtDate(new Date())} · ${questions.length} question${questions.length !== 1 ? "s" : ""} · ${sondage.anonyme ? "Sondage anonyme" : "Sondage nominatif"}</div>
      <div class="kpis">
        ${kpis.map((k) => `
        <div class="kpi">
          <div class="kpi-value${k.small ? " small" : ""}">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
        </div>`).join("")}
      </div>
      ${total === 0
        ? `<p style="text-align:center;color:#6b7280;font-style:italic;margin-top:30px;">Aucune réponse enregistrée pour l'instant.</p>`
        : questionBlocks}
      <div class="doc-footer">Association Ma Belle Promo — rapport interne généré automatiquement depuis le tableau de bord.</div>
    </div>
  </div>
</body>
</html>`;
}
