import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChevronLeft, Printer, Loader2, AlertTriangle, CheckCircle2, Minimize2 } from "lucide-react";
import { inp, Field } from "./shared";

const TEMPLATES = [
  {
    id: "v1",
    file: "papier-entete-v1-classique.html",
    label: "Classique",
    description: "En-tête vert plein, bande dorée",
    preview: (
      <div className="h-full flex flex-col gap-1.5 p-2.5">
        <div className="h-7 rounded bg-[#2d7a4f] border-b-4 border-[#c8921a]" />
        <div className="flex gap-2 flex-1">
          <div className="flex-1 space-y-1 pt-1">
            <div className="h-1.5 bg-border/50 rounded-full w-3/4" />
            <div className="h-1.5 bg-border/50 rounded-full w-1/2" />
            <div className="h-1.5 bg-border/50 rounded-full w-2/3" />
            <div className="h-1.5 bg-border/50 rounded-full w-2/5 mt-2" />
          </div>
        </div>
        <div className="h-4 bg-[#f0f9f4] rounded border border-[#b5d9c5]" />
      </div>
    ),
  },
  {
    id: "v2",
    file: "papier-entete-v2-moderne.html",
    label: "Moderne",
    description: "Bandeau vertical vert-doré, épuré",
    preview: (
      <div className="h-full flex gap-1.5 p-2.5">
        <div className="w-2 rounded bg-gradient-to-b from-[#2d7a4f] to-[#c8921a]" />
        <div className="w-7 rounded bg-[#f0f9f4] border border-[#b5d9c5] flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#b5d9c5]" />
        </div>
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-1.5 bg-[#2d7a4f]/40 rounded-full w-3/4" />
          <div className="h-1 bg-border/40 rounded-full w-1/2" />
          <div className="h-3 bg-[#2d7a4f] rounded mt-2" />
          <div className="h-1.5 bg-border/40 rounded-full w-2/3 mt-2" />
          <div className="h-1.5 bg-border/40 rounded-full w-1/2" />
        </div>
      </div>
    ),
  },
  {
    id: "v3",
    file: "papier-entete-v3-creativo.html",
    label: "Créatif",
    description: "Dégradé vert foncé, pied sombre",
    preview: (
      <div className="h-full flex flex-col gap-1.5 p-2.5">
        <div className="h-9 rounded bg-gradient-to-br from-[#0a1e14] to-[#2d7a4f] flex items-center px-2 gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/90" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-[#c8921a]/70 rounded-full w-2/3" />
            <div className="h-1 bg-white/30 rounded-full w-1/2" />
          </div>
        </div>
        <div className="flex-1 space-y-1 pt-0.5">
          <div className="h-1.5 bg-border/50 rounded-full w-3/4" />
          <div className="h-1.5 bg-border/50 rounded-full w-1/2" />
          <div className="h-1.5 bg-border/50 rounded-full w-2/3" />
        </div>
        <div className="h-4 rounded bg-[#0a1e14] flex items-center px-2 gap-1">
          <div className="h-1 bg-white/30 rounded-full flex-1" />
        </div>
      </div>
    ),
  },
  {
    id: "v4",
    file: "papier-entete-v4-eco-sobriete.html",
    label: "Éco Sobriété",
    description: "Fond blanc pur, filets fins — ~8% encre",
    preview: (
      <div className="h-full flex flex-col p-2.5 bg-white rounded">
        <div className="h-1 rounded-full bg-gradient-to-r from-[#c8921a] to-[#2d7a4f] mb-2" />
        <div className="flex items-center gap-1.5 pb-2 border-b border-[#b5d9c5]">
          <div className="w-5 h-5 rounded bg-[#f0f9f4] border border-[#b5d9c5]" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 bg-[#2d7a4f]/50 rounded-full w-2/3" />
            <div className="h-1 bg-border/40 rounded-full w-1/2" />
          </div>
        </div>
        <div className="flex-1 space-y-1 pt-1.5">
          <div className="h-1.5 bg-border/40 rounded-full w-3/4" />
          <div className="h-1.5 bg-border/40 rounded-full w-1/2" />
          <div className="h-1.5 bg-border/40 rounded-full w-2/3" />
        </div>
        <div className="h-1 rounded-full bg-[#c8921a]/50 mt-1" />
      </div>
    ),
  },
  {
    id: "v5",
    file: "papier-entete-v5-eco-arrondi.html",
    label: "Éco Arrondi",
    description: "Carte arrondie flottante — ~12% encre",
    preview: (
      <div className="h-full flex flex-col p-2 bg-white rounded">
        <div className="mx-0.5 rounded-2xl border border-[#2d7a4f] bg-[#f0f9f4] p-2 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border border-[#2d7a4f] bg-white" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 bg-[#2d7a4f]/40 rounded-full w-2/3" />
            <div className="h-1 bg-border/40 rounded-full w-1/2" />
          </div>
        </div>
        <div className="flex-1 space-y-1 pt-2 px-0.5">
          <div className="h-1.5 bg-border/40 rounded-full w-3/4" />
          <div className="h-1.5 bg-border/40 rounded-full w-1/2" />
        </div>
        <div className="mx-0.5 h-4 rounded-xl border border-[#b5d9c5] bg-[#f0f9f4]" />
      </div>
    ),
  },
  {
    id: "v6",
    file: "papier-entete-v6.html",
    label: "Typographique",
    description: "Cormorant grand format — ~10% encre",
    preview: (
      <div className="h-full flex flex-col p-2.5 bg-white rounded">
        <div className="h-0.5 rounded-full flex overflow-hidden mb-2">
          <div className="flex-1 bg-[#c8921a]" />
          <div className="flex-[4] bg-[#2d7a4f]" />
          <div className="flex-1 bg-[#c8921a]" />
        </div>
        <div className="flex flex-col items-center gap-1 pb-2 border-b border-[#b5d9c5]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[#f0f9f4]" />
            <div>
              <div className="h-2 bg-[#1a3d28]/70 rounded-full w-16 font-bold" />
              <div className="h-1.5 bg-[#c8921a]/60 rounded-full w-10 mt-0.5" />
            </div>
          </div>
          <div className="h-1 bg-border/30 rounded-full w-3/4" />
          <div className="h-1 bg-border/30 rounded-full w-2/3" />
        </div>
        <div className="flex-1 space-y-1 pt-1.5">
          <div className="h-1.5 bg-border/40 rounded-full w-3/4" />
          <div className="h-1.5 bg-border/40 rounded-full w-1/2" />
        </div>
      </div>
    ),
  },
  {
    id: "v7",
    file: "papier-entete-v7-eco-cadre-arrondi.html",
    label: "Cadre Décoratif",
    description: "Double bordure vert+doré, rosettes aux coins",
    preview: (
      <div className="h-full p-1.5 bg-white rounded">
        <div className="h-full border-2 border-[#2d7a4f] rounded-2xl p-1">
          <div className="h-full border border-[#c8921a] rounded-xl p-1.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-[#f0f9f4] border border-[#b5d9c5]" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1.5 bg-border/50 rounded-full w-2/3" />
                <div className="h-1 bg-border/30 rounded-full w-1/2" />
              </div>
            </div>
            <div className="flex-1 space-y-1 pt-0.5">
              <div className="h-1.5 bg-border/40 rounded-full w-3/4" />
              <div className="h-1.5 bg-border/40 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const TODAY = new Date().toLocaleDateString("fr-FR", {
  day: "numeric", month: "long", year: "numeric",
});
const YEAR = new Date().getFullYear();

const INITIAL = {
  date:      TODAY,
  ref:       `MBP/${YEAR}/001`,
  objet:     "",
  dest:      "",
  appel:     "Madame, Monsieur,",
  corps:     "",
  politesse: "Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.",
  sigNom:    "",
  sigTitre:  "Présidente de l'association",
};

// Hauteur A4 à 96 dpi (297mm)
const A4_PX = 1123;

// Anti-cache pour le fetch du template /docs/ : les fichiers statiques
// peuvent rester en cache HTTP/CDN et servir une vieille version du modèle.
// Évalué une fois par chargement de page → un rechargement récupère le
// dernier template (et htmlCacheRef évite les re-fetch dans la session).
const TEMPLATE_CB = Date.now();

// Styles injectés dans tous les documents générés
const INJECT_CSS = `
  /* Mode clair forcé */
  :root, html, body { color-scheme: light !important; }

  .corps-lettre, .e-corps {
    color: hsl(150, 30%, 10%) !important;
    visibility: visible !important;
    flex: 0 0 auto !important;
  }

  .closing-row, .closing {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    margin-top: 24px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .politesse, .e-politesse {
    flex: none !important;
    width: 100% !important;
  }
  .sig-bloc, .sig-card, .signature-bloc {
    align-self: flex-end !important;
  }

  main.body, .body {
    flex: none !important;
    padding-bottom: 16px !important;
  }

  footer.footer, .footer-zone {
    margin-top: auto !important;
    background: white !important;
  }
`;

// Styles injectés en mode compacté : réduit police et interligne du corps
const COMPACT_CSS = `
  .corps-lettre, .e-corps, .formule-appel, .e-appel, .politesse, .e-politesse {
    font-size: 9pt !important;
    line-height: 1.35 !important;
  }
  p { margin-bottom: 0.35em !important; margin-top: 0 !important; }
`;

// Style de normalisation pour une pagination fiable (équivalent de ce que
// le <script> inline du template injectait — mais ce script est bloqué par
// la CSP `script-src 'self'` dans le blob d'impression, donc on le fait ici).
const PAGINATE_CSS = `
  .corps-lettre, .e-corps { min-height: 0 !important; }
  img[alt^="Cachet"] { height: 90px !important; width: auto !important; }
`;

// CSS d'impression STRUCTUREL commun aux modèles V2→V7 (V1 a déjà le sien
// dans son HTML, verrouillé : on ne l'injecte donc PAS pour V1).
// Tous ces modèles partagent le même squelette que V1 (.page table avec
// rangées .page-header/.page-content/.page-footer). On bascule la .page en
// FLEX colonne en impression → le contenu pousse le pied tout en bas de
// CHAQUE feuille. Mêmes recettes que V1 (cf. docs/papier-entete-marges-2cm.md).
const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; }
    /* body en bloc (sinon un flex+gap insère des feuilles parasites) */
    body { background: none !important; display: block !important; }
    /* chaque .page = une feuille A4, en flex colonne */
    .page {
      box-shadow: none !important;
      width: 210mm !important;
      height: 296mm !important;        /* < 297mm : anti-débord sous-pixel */
      min-height: 0 !important;        /* neutralise le minHeight injecté */
      display: flex !important;
      flex-direction: column !important;
      page-break-after: auto !important;
    }
    .page-header  { display: block !important; flex: 0 0 auto !important; position: static !important; margin: 0 !important; }
    /* margin:0 neutralise les restes de l'ancienne approche position:fixed
       (ex. V7 : .page-content margin-bottom:93px) qui débordaient en flex */
    .page-content { display: block !important; flex: 1 1 auto !important; position: static !important; margin: 0 !important; }
    /* height:auto neutralise un éventuel .page-footer height:93px figé */
    .page-footer  { display: block !important; flex: 0 0 auto !important; position: static !important; height: auto !important; margin: 0 !important; }
    .page-cell    { display: block !important; width: auto !important; }
    /* chaque feuille suivante démarre sur une nouvelle page */
    .page-dynamic { page-break-before: always !important; }
    /* pas de placeholder fantôme à l'impression */
    [contenteditable]:empty::before { content: "" !important; }
    .closing-row, .closing { break-inside: avoid !important; page-break-inside: avoid !important; }
  }
`;

/**
 * Pagine le document `d` (iframe) : découpe le corps pour que CHAQUE .page
 * tienne sur une feuille A4, en gardant la signature collée à la fin du
 * corps sur la dernière feuille.
 *
 * Cette logique vivait dans un <script> inline du template HTML, mais le
 * document d'impression (blob:) hérite de la CSP du dashboard
 * (`script-src 'self'`) qui BLOQUE les scripts inline. On l'exécute donc
 * ici, dans le code de l'app (autorisé par la CSP), sur le DOM de l'iframe.
 */
function paginateDoc(d, PAGE_H = 1080) {
  // PAGE_H = budget de hauteur utile par feuille (px). 1080 pour V1
  // (verrouillé). Les modèles V2-V7 passent une valeur plus basse (marge de
  // sécurité plus large) car leurs en-têtes/pieds plus hauts, mesurés en
  // police de repli pendant la pagination, débordent sinon d'un cran.
  let RESERVE = 0;              // place réservée pour la signature
  const CORPS = ".corps-lettre, .e-corps";
  const win = d.defaultView;

  const textToHtml = t =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

  function availH(page) {
    const hdr = page.querySelector(".page-header");
    const ftr = page.querySelector(".page-footer");
    const corps = page.querySelector(CORPS);
    const body = corps && corps.parentElement;
    let used = (hdr ? hdr.offsetHeight : 0) + (ftr ? ftr.offsetHeight : 0);
    if (body) {
      const s = win.getComputedStyle(body);
      const gap = parseFloat(s.rowGap) || parseFloat(s.gap) || 0;
      used += parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
      used += gap * Math.max(0, body.children.length - 1);
      Array.from(body.children).forEach(c => { if (c !== corps) used += c.offsetHeight; });
    }
    return PAGE_H - used - RESERVE;
  }
  function isOver(page) {
    const c = page.querySelector(CORPS);
    return !!c && c.scrollHeight > availH(page) + 1;
  }
  function split(corps, page) {
    const tokens = (corps.innerText || "").split(/(\s+)/);
    let lo = 1, hi = tokens.length, best = 0;
    corps.style.visibility = "hidden";
    while (lo <= hi) {
      const mid = lo + ((hi - lo) >> 1);
      corps.innerHTML = textToHtml(tokens.slice(0, mid).join(""));
      if (isOver(page)) hi = mid - 1; else { best = mid; lo = mid + 1; }
    }
    const over = tokens.slice(best).join("").replace(/^\s+/, "");
    corps.innerHTML = textToHtml(tokens.slice(0, best).join(""));
    corps.style.visibility = "";
    return over;
  }
  function cloneFooter() {
    const f = d.querySelector(".page:not(.page-dynamic) .page-footer");
    return f ? f.cloneNode(true) : null;
  }
  function corpsClass() {
    return d.querySelector(".e-corps") ? "e-corps" : "corps-lettre";
  }
  function makePage(text) {
    const pg = d.createElement("div"); pg.className = "page page-dynamic";
    const fakeHdr = d.createElement("div"); fakeHdr.className = "page-header";
    const fakeHdrCell = d.createElement("div"); fakeHdrCell.className = "page-cell";
    fakeHdrCell.style.padding = "0"; fakeHdrCell.style.height = "0";
    fakeHdr.appendChild(fakeHdrCell);
    const ct = d.createElement("div"); ct.className = "page-content";
    const cl = d.createElement("div"); cl.className = "page-cell";
    // Décalage haut du corps sur les feuilles de continuation (page 2+) :
    // ~100px = 24px + 2cm (≈ 75,6px à 96 dpi) pour démarrer le texte 2 cm plus
    // bas dès la 2e page, sur TOUS les modèles (demande Eric, 13 juin 2026).
    const bd = d.createElement("main"); bd.className = "body";
    bd.style.paddingTop = "100px";
    const cr = d.createElement("div"); cr.className = corpsClass();
    cr.innerHTML = textToHtml(text);
    bd.appendChild(cr); cl.appendChild(bd); ct.appendChild(cl);
    const ftr = cloneFooter();
    pg.appendChild(fakeHdr); pg.appendChild(ct); if (ftr) pg.appendChild(ftr);
    // Cadre décoratif (V7) : le cloner sur les pages dynamiques pour qu'elles
    // aient aussi la bordure (sinon page 2+ sans cadre). Absolu inset:0 →
    // recouvre la .page. Sans effet sur les modèles sans .deco-frame.
    const deco = d.querySelector(".page:not(.page-dynamic) .deco-frame");
    if (deco) pg.insertBefore(deco.cloneNode(true), pg.firstChild);
    return pg;
  }
  function bodyOf(page) {
    const c = page.querySelector(CORPS);
    return (c && c.parentElement) || page.querySelector(".body");
  }

  const p1 = d.querySelector(".page:not(.page-dynamic)");
  if (!p1) return;
  const c1 = p1.querySelector(CORPS);
  if (!c1) return;

  const all = Array.from(d.querySelectorAll(CORPS))
    .map(e => e.innerText || "").filter(Boolean).join("\n");

  // Signature détachée (cherchée partout) pour finir sur la dernière feuille
  const closing = d.querySelector(".closing-row, .closing");
  if (closing && closing.parentNode) closing.parentNode.removeChild(closing);

  d.querySelectorAll(".page-dynamic").forEach(p => p.remove());
  c1.innerHTML = textToHtml(all);

  // 1) découpe du corps (sans réserve)
  RESERVE = 0;
  let cur = p1, guard = 40;
  while (isOver(cur) && guard-- > 0) {
    const ov = split(cur.querySelector(CORPS), cur);
    if (!ov.trim()) break;
    const np = makePage(ov);
    cur.insertAdjacentElement("afterend", np);
    cur = np;
  }

  // 2) Signature : on la pose à la fin de la DERNIÈRE feuille de corps (déjà
  //    remplie à fond en phase 1). Si elle déborde, elle part seule sur une
  //    feuille finale. On ne RÉSERVE PLUS sa hauteur en amont : réserver la
  //    place de la signature sur l'avant-dernière feuille la tronquait, alors
  //    que la signature finissait sur la feuille suivante → grand vide sur
  //    l'avant-dernière feuille (bug visible sur V5/V6/V7, dont la carte de
  //    signature est haute). Vérifié au rendu PDF réel sur les 6 modèles.
  if (closing) {
    bodyOf(cur).appendChild(closing);
    if (isOver(cur)) {
      if (closing.parentNode) closing.parentNode.removeChild(closing);
      const npc = makePage("");
      bodyOf(npc).appendChild(closing);
      cur.insertAdjacentElement("afterend", npc);
      cur = npc;
    }
  }

  // nettoyage d'une éventuelle dernière feuille vide
  const dyn = d.querySelectorAll(".page-dynamic");
  if (dyn.length > 0) {
    const last = dyn[dyn.length - 1];
    const lc = last.querySelector(CORPS);
    const hasClosing = last.querySelector(".closing-row, .closing");
    if ((!lc || !lc.innerText.trim()) && !hasClosing) last.remove();
  }
}

// Injection via iframe live — plus fiable que DOMParser dont outerHTML
// ne reflète pas toujours les mutations DOM dans Chrome/Edge
async function injectValues(html, form, compact = false, templateId = null) {
  const iframe = document.createElement("iframe");
  // Hauteur 1200px (≈ une feuille) pour que la pagination mesure des
  // hauteurs d'éléments fiables ; l'iframe reste hors écran.
  iframe.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:794px;height:1200px;" +
    "border:none;visibility:hidden;pointer-events:none";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  const d = iframe.contentDocument;

  d.querySelector(".print-hint")?.remove();

  const base = d.createElement("base");
  base.href = window.location.origin + "/";
  d.head.insertBefore(base, d.head.firstChild);

  d.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src") || "";
    if (src.includes("logo-mbp")) {
      img.setAttribute("src", window.location.origin + "/logo-mbp.png");
    }
  });

  d.querySelectorAll("[contenteditable]").forEach(el =>
    el.removeAttribute("contenteditable")
  );

  function fillText(el, text) {
    while (el.firstChild) el.removeChild(el.firstChild);
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (line) el.appendChild(d.createTextNode(line));
      if (i < lines.length - 1) el.appendChild(d.createElement("br"));
    });
  }

  const dateEl = d.querySelector('[data-placeholder*="aaaa"], [data-placeholder="date"]');
  if (dateEl) dateEl.textContent = form.date;

  const villeDateEl = d.querySelector(".editable-ville-date");
  if (villeDateEl) villeDateEl.textContent = `Lomé, le ${form.date}`;

  const refEl = d.querySelector('[data-placeholder*="MBP"]');
  if (refEl) refEl.textContent = form.ref;

  const objetEl = d.querySelector(".editable-objet, .objet-band-text, .e-objet");
  if (objetEl) objetEl.textContent = form.objet;

  const destEl = d.querySelector(".editable-dest, .e-dest");
  if (destEl) fillText(destEl, form.dest);

  const appelEl = d.querySelector(".formule-appel, .e-appel");
  if (appelEl) appelEl.textContent = form.appel;

  const corpsEl = d.querySelector(".corps-lettre, .e-corps");
  if (corpsEl) fillText(corpsEl, form.corps);

  const polEl = d.querySelector(".politesse, .e-politesse");
  if (polEl) polEl.textContent = form.politesse;

  const sigNomEl = d.querySelector(".editable-sig-name, .editable-signature, .e-sig-name");
  if (sigNomEl) sigNomEl.textContent = form.sigNom;

  const sigTitreEl = d.querySelector(".editable-sig-titre, .signature-titre, .e-sig-titre");
  if (sigTitreEl) sigTitreEl.textContent = form.sigTitre;

  const sigLabelEl = d.querySelector(".sig-role, .sig-function, .signature-label");
  if (sigLabelEl) {
    const stamp = d.createElement("img");
    stamp.setAttribute("src", window.location.origin + "/images/FDD.webp");
    // V1 : tampon décalé de 1 cm vers la droite (demande Eric, 13 juin 2026).
    const stampShift = templateId === "v1" ? "margin-left:10mm;" : "";
    stamp.style.cssText = "display:block;width:100px;height:auto;margin:4px 0;opacity:0.9;" + stampShift;
    stamp.setAttribute("alt", "Cachet de la Présidente");
    sigLabelEl.insertAdjacentElement("afterend", stamp);
  }

  // Layout inline : politesse au-dessus de la signature (styles inline > toute règle CSS)
  const closingEl = d.querySelector(".closing-row, .closing");
  if (closingEl) {
    closingEl.style.display = "flex";
    closingEl.style.flexDirection = "column";
    closingEl.style.gap = "16px";
    closingEl.style.marginTop = "24px";
    closingEl.style.breakInside = "avoid";
    closingEl.style.pageBreakInside = "avoid";
  }
  if (polEl) {
    polEl.style.flex = "none";
    polEl.style.width = "100%";
  }
  const sigBlocEl = d.querySelector(".sig-bloc, .sig-card, .signature-bloc");
  if (sigBlocEl) sigBlocEl.style.alignSelf = "flex-end";

  const injectStyle = d.createElement("style");
  injectStyle.textContent = INJECT_CSS;
  d.head.appendChild(injectStyle);

  const paginateStyle = d.createElement("style");
  paginateStyle.textContent = PAGINATE_CSS;
  d.head.appendChild(paginateStyle);

  // CSS d'impression structurel pour V2→V7 (V1 a le sien dans son HTML,
  // verrouillé → on ne l'injecte pas pour V1).
  if (templateId && templateId !== "v1") {
    const printStyle = d.createElement("style");
    printStyle.textContent = PRINT_CSS;
    d.head.appendChild(printStyle);
  }

  if (compact) {
    const compactStyle = d.createElement("style");
    compactStyle.textContent = COMPACT_CSS;
    d.head.appendChild(compactStyle);
  }

  // Attendre le chargement des polices avant de mesurer :
  // Cormorant Garamond > police de repli → mesure fausse sans fonts.ready
  await Promise.race([
    d.fonts.ready,
    new Promise(r => setTimeout(r, 3000))
  ]);

  // Pagination CÔTÉ APP (le <script> inline du template est bloqué par la
  // CSP dans le blob d'impression). Seulement pour les modèles à structure
  // de tableau .page-content/.page-footer (V1) ; try/catch de sécurité pour
  // ne jamais bloquer la génération d'un autre modèle.
  if (d.querySelector(".page-content") && d.querySelector(".page-footer")) {
    // Budget de hauteur utile unifié à 1080 px (≈ 285,75 mm) pour TOUS les
    // modèles. La feuille A4 fait 296 mm : plafonner le contenu à 1080 px
    // laisse ~10 mm de marge en bas → le pied ne déborde jamais (vrai pour
    // tous les modèles, y compris V6/V7 à grand en-tête, mesuré au PDF réel).
    // V2-V7 utilisaient 1010 (trop prudent → sauts de page précoces, feuilles
    // à moitié vides). La mesure est fiabilisée par `d.fonts.ready` ci-dessus,
    // ce qui rend l'ancienne marge superflue. Tous alignés sur le moteur de V1.
    try { paginateDoc(d, 1080); } catch (e) { /* repli */ }
  }

  const pageEl = d.querySelector(".page");
  if (pageEl) {
    const h = pageEl.scrollHeight;
    if (h > 0) {
      pageEl.style.minHeight = (Math.ceil(h / 1123) * 1123) + "px";
    }
  }

  const result = "<!DOCTYPE html>" + d.documentElement.outerHTML;
  document.body.removeChild(iframe);
  return result;
}

export default function CourrierSection() {
  const [step, setStep]             = useState("select");
  const [template, setTemplate]     = useState(null);
  const [form, setForm]             = useState(INITIAL);
  const [generating, setGenerating] = useState(false);
  const [pageStatus, setPageStatus] = useState(null); // null | "checking" | "ok" | "overflow"
  const [compact, setCompact]       = useState(false);
  const htmlCacheRef                = useRef({});

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  function pick(t) {
    setTemplate(t);
    setCompact(false);
    setPageStatus(null);
    setStep("compose");
  }

  // Vérification automatique du dépassement de page (debounce 800ms)
  useEffect(() => {
    if (step !== "compose" || !template) return;
    if (!form.corps.trim()) { setPageStatus(null); return; }

    let cancelled = false;
    setPageStatus("checking");

    const timer = setTimeout(async () => {
      try {
        if (!htmlCacheRef.current[template.file]) {
          const resp = await fetch(`/docs/${template.file}?v=${TEMPLATE_CB}`);
          if (!resp.ok) throw new Error();
          htmlCacheRef.current[template.file] = await resp.text();
        }
        const injected = await injectValues(htmlCacheRef.current[template.file], form, compact, template.id);

        // Iframe hors-écran aux dimensions A4
        const iframe = document.createElement("iframe");
        iframe.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;width:794px;height:1px;border:none;visibility:hidden;pointer-events:none";
        document.body.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(injected);
        iframe.contentDocument.close();

        // Attendre le rendu des polices
        await new Promise(r => setTimeout(r, 500));

        const bodyEl = iframe.contentDocument?.body;
        const isOver = bodyEl ? bodyEl.scrollHeight > A4_PX : false;
        document.body.removeChild(iframe);

        if (!cancelled) setPageStatus(isOver ? "overflow" : "ok");
      } catch {
        if (!cancelled) setPageStatus(null);
      }
    }, 800);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.corps, form.appel, form.politesse, form.dest, form.sigNom, form.sigTitre, template, compact, step]);

  async function generate() {
    if (!form.objet.trim()) { toast.error("L'objet du courrier est obligatoire."); return; }
    if (!form.corps.trim()) { toast.error("Le corps du message est obligatoire."); return; }
    setGenerating(true);
    try {
      if (!htmlCacheRef.current[template.file]) {
        const resp = await fetch(`/docs/${template.file}?v=${TEMPLATE_CB}`);
        if (!resp.ok) throw new Error("Modèle introuvable");
        htmlCacheRef.current[template.file] = await resp.text();
      }
      const injected = await injectValues(htmlCacheRef.current[template.file], form, compact, template.id);
      // Blob URL : plus fiable que document.write, évite les quirks de rendu
      const blob = new Blob([injected], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        toast.error("Popup bloquée — autorisez les popups pour ce site.");
        URL.revokeObjectURL(url);
        return;
      }
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 1200);
    } catch (e) {
      toast.error("Erreur : " + e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Courrier officiel</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === "select"
              ? "Choisissez un modèle de papier à en-tête"
              : `Modèle sélectionné : ${template?.label}`}
          </p>
        </div>
        {step === "compose" && (
          <button
            onClick={() => { setStep("select"); setPageStatus(null); setCompact(false); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Changer de modèle
          </button>
        )}
      </div>

      {/* ── Étape 1 : galerie de modèles ── */}
      {step === "select" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => pick(t)}
              className="group bg-card border border-border rounded-2xl overflow-hidden text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="h-28 bg-white overflow-hidden border-b border-border/60 relative">
                {t.preview}
              </div>
              <div className="px-3 py-2.5">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {t.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Étape 2 : formulaire de composition ── */}
      {step === "compose" && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-5">

          {/* Colonne principale */}
          <div className="space-y-4">

            {/* Référence & date */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Référence &amp; date</p>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                <Field label="Date du courrier">
                  <input className={inp} value={form.date} onChange={f("date")} />
                </Field>
                <Field label="Référence">
                  <input className={inp} value={form.ref} onChange={f("ref")} placeholder="MBP/2026/001" />
                </Field>
              </div>
            </div>

            {/* Objet */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Objet</p>
              </div>
              <div className="p-5">
                <Field label="Objet du courrier *">
                  <input
                    className={inp}
                    value={form.objet}
                    onChange={f("objet")}
                    placeholder="Ex : Convocation à l'Assemblée Générale 2026"
                  />
                </Field>
              </div>
            </div>

            {/* Corps du message */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Corps du message</p>

                {/* Indicateur de longueur */}
                {pageStatus === "checking" && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Vérification…
                  </span>
                )}
                {pageStatus === "ok" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {compact ? "Compacté — tient sur une page" : "Tient sur une page"}
                  </span>
                )}
                {pageStatus === "overflow" && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-3 h-3" /> Dépasse une page
                  </span>
                )}
              </div>
              <div className="p-5 space-y-4">

                {/* Bannière dépassement */}
                {pageStatus === "overflow" && !compact && (
                  <div className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Le courrier dépasse une page. Réduisez le texte ou utilisez le compactage automatique (police et interligne réduits).
                    </p>
                    <button
                      onClick={() => setCompact(true)}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Minimize2 className="w-3 h-3" /> Compacter
                    </button>
                  </div>
                )}

                {/* Bannière mode compact actif */}
                {compact && (
                  <div className="flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Mode compact actif — police 9pt, interligne réduit.
                    </p>
                    <button
                      onClick={() => setCompact(false)}
                      className="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Annuler
                    </button>
                  </div>
                )}

                <Field label="Formule d'appel">
                  <input className={inp} value={form.appel} onChange={f("appel")} />
                </Field>
                <Field label="Corps *">
                  <textarea
                    className={inp + " !h-64 resize-none py-2"}
                    value={form.corps}
                    onChange={f("corps")}
                    placeholder={"Nous avons l'honneur de vous informer que…\n\nVotre texte ici."}
                  />
                </Field>
              </div>
            </div>

          </div>

          {/* Colonne latérale */}
          <div className="space-y-4">

            {/* Modèle sélectionné */}
            <div className="bg-card border border-primary/30 rounded-2xl overflow-hidden">
              <div className="h-20 bg-white border-b border-border/60 relative">
                {template?.preview}
              </div>
              <div className="px-4 py-2.5">
                <p className="text-sm font-semibold text-primary">{template?.label}</p>
                <p className="text-xs text-muted-foreground">{template?.description}</p>
              </div>
            </div>

            {/* Destinataire */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Destinataire</p>
              </div>
              <div className="p-5">
                <Field label="À l'attention de">
                  <textarea
                    className={inp + " !h-24 resize-none py-2"}
                    value={form.dest}
                    onChange={f("dest")}
                    placeholder={"M. Jean Dupont\nDirecteur\nOrganisation\nVille"}
                  />
                </Field>
              </div>
            </div>

            {/* Formule de politesse */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Formule de politesse</p>
              </div>
              <div className="p-5">
                <Field label="">
                  <textarea
                    className={inp + " !h-16 resize-none py-2"}
                    value={form.politesse}
                    onChange={f("politesse")}
                  />
                </Field>
              </div>
            </div>

            {/* Signature */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold text-foreground">Signature</p>
              </div>
              <div className="p-5 space-y-3">
                <Field label="Nom de la signataire">
                  <input
                    className={inp}
                    value={form.sigNom}
                    onChange={f("sigNom")}
                    placeholder="Prénom Nom"
                  />
                </Field>
                <Field label="Titre">
                  <input className={inp} value={form.sigTitre} onChange={f("sigTitre")} />
                </Field>
              </div>
            </div>

            {/* Bouton générer */}
            <button
              onClick={generate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {generating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Printer className="w-4 h-4" />}
              Générer le courrier
            </button>
            <p className="text-xs text-muted-foreground text-center -mt-2">
              S'ouvre dans un nouvel onglet · Ctrl+P pour exporter en PDF
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
