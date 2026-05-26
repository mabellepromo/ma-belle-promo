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

// Styles injectés dans tous les documents générés
const INJECT_CSS = `
  /* Mode clair forcé */
  :root, html, body { color-scheme: light !important; }

  /* Couleur du corps de texte */
  .corps-lettre, .e-corps {
    color: hsl(150, 30%, 10%) !important;
    visibility: visible !important;
  }

  /* Politesse au-dessus de la signature — layout vertical */
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

  /* Footer en flux normal : apparaît une fois après tout le contenu.
     flex:1 sur .body (défini dans les templates) le pousse en bas
     de la première page quand la lettre est courte. */
  @media print {
    footer.footer, .footer-zone {
      position: static !important;
      background: white !important;
    }
    .page {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100vh !important;
      box-shadow: none !important;
    }
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

// Injection via iframe live — plus fiable que DOMParser dont outerHTML
// ne reflète pas toujours les mutations DOM dans Chrome/Edge
async function injectValues(html, form, compact = false) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:794px;height:1px;" +
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
    stamp.style.cssText = "display:block;width:100px;height:auto;margin:4px 0;opacity:0.9";
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

  if (compact) {
    const compactStyle = d.createElement("style");
    compactStyle.textContent = COMPACT_CSS;
    d.head.appendChild(compactStyle);
  }

  // Ancrer le footer en bas de la dernière page :
  // on calcule l'espace restant sur la dernière page et on le comble
  // avec du padding sur .body, même si le contenu ne remplit pas la page.
  await new Promise(r => setTimeout(r, 120));
  const A4_H = 1123;
  const pageEl = d.querySelector(".page");
  const bodyEl = d.querySelector("main.body, .body");
  if (pageEl && bodyEl) {
    const h = pageEl.scrollHeight;
    if (h > 0) {
      const pages = Math.ceil(h / A4_H);
      const extra = pages * A4_H - h;
      if (extra > 0 && extra < A4_H) {
        const pb = parseFloat(d.defaultView?.getComputedStyle(bodyEl)?.paddingBottom || "0");
        bodyEl.style.paddingBottom = Math.round(pb + extra) + "px";
      }
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
          const resp = await fetch(`/docs/${template.file}`);
          if (!resp.ok) throw new Error();
          htmlCacheRef.current[template.file] = await resp.text();
        }
        const injected = await injectValues(htmlCacheRef.current[template.file], form, compact);

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
        const resp = await fetch(`/docs/${template.file}`);
        if (!resp.ok) throw new Error("Modèle introuvable");
        htmlCacheRef.current[template.file] = await resp.text();
      }
      const injected = await injectValues(htmlCacheRef.current[template.file], form, compact);
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
                    className={inp + " h-44 resize-none py-2"}
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
                    className={inp + " h-24 resize-none py-2"}
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
                    className={inp + " h-16 resize-none py-2"}
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
