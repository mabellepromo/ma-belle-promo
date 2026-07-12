import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import SEO from "../components/SEO";
import {
  getSondageWithQuestions, hasVoted, submitSondage,
  getSondageResults, getFingerprint, getInvitationByToken, getTheme,
  getSoumissionsCount,
} from "../hooks/useSondages";

// Index sentinelle de l'option « Autre (précisez) » dans valeur_options
const OTHER_INDEX = -1;
import { Check, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";

// ── Résultats après vote ───────────────────────────────────────────────────
function PublicQuestionResults({ question, reponses, theme }) {
  const qr = reponses.filter(r => r.question_id === question.id);

  if (question.type === "texte" || question.type === "date" || question.type === "effectifs") {
    return (
      <p className="text-sm text-muted-foreground italic">
        {qr.length} réponse{qr.length !== 1 ? "s" : ""} reçue{qr.length !== 1 ? "s" : ""}.
      </p>
    );
  }

  if (question.type === "echelle") {
    const notes = qr.map(r => r.valeur_note).filter(v => v != null);
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "—";
    return (
      <p className="text-sm text-muted-foreground">
        Moyenne : <strong className="text-foreground">{avg} / 10</strong> ({notes.length} réponse{notes.length !== 1 ? "s" : ""})
      </p>
    );
  }

  if (question.type === "note") {
    const notes = qr.map(r => r.valeur_note).filter(v => v != null);
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "—";
    const counts = [1, 2, 3, 4, 5].map(n => notes.filter(v => v === n).length);
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-3">Moyenne : <strong className="text-foreground">{avg} / 5</strong></p>
        {[1, 2, 3, 4, 5].map(n => {
          const pct = notes.length ? Math.round((counts[n - 1] / notes.length) * 100) : 0;
          return (
            <div key={n} className="flex items-center gap-3 mb-1.5">
              <span className="text-sm w-5 text-center text-muted-foreground">{n}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm w-8 text-right text-muted-foreground">{counts[n - 1]}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const baseOptions = question.type === "ouinon" ? ["Oui", "Non"] : (question.options || []);
  const counts = baseOptions.map((_, i) => qr.filter(r => r.valeur_options?.includes(i)).length);
  const options = [...baseOptions];
  if (question.type !== "ouinon" && question.config?.allow_other) {
    options.push("Autre");
    counts.push(qr.filter(r => r.valeur_options?.includes(OTHER_INDEX)).length);
  }
  const qTotal = qr.length;

  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const pct = qTotal > 0 ? Math.round((counts[i] / qTotal) * 100) : 0;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground truncate flex-1 mr-3">{opt}</span>
              <span className="font-bold text-foreground flex-shrink-0">
                {pct}% <span className="font-normal text-muted-foreground text-xs">({counts[i]})</span>
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: theme.primary }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Or MBP — signale les options qui ouvrent une précision (sous-question)
const GOLD = "#b8861a";
const TriggerHint = () => (
  <span className="ml-auto flex items-center gap-1 text-xs font-medium flex-shrink-0" style={{ color: GOLD }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
    précision demandée
  </span>
);

// ── Saisie par type ────────────────────────────────────────────────────────
function QuestionInput({ question, answer, onChange, theme, triggerOptions, sourceQuestion, sourceAnswer }) {
  const val = answer || {};
  const isTrigger = i => !!triggerOptions?.has(i);

  // Libellé d'une option de la question source (type « effectifs »)
  const sourceLabelOf = i => i === OTHER_INDEX
    ? (sourceAnswer?.valeur_texte?.trim() || "Autre")
    : (sourceQuestion?.options?.[i] ?? `Option ${i + 1}`);

  // « effectifs » : si une option source est décochée après coup, on purge
  // son compteur pour ne pas soumettre une valeur fantôme.
  useEffect(() => {
    if (question.type !== "effectifs" || !sourceQuestion) return;
    const selected = sourceAnswer?.valeur_options || [];
    const eff = val.effectifs || {};
    const kept = Object.fromEntries(Object.entries(eff).filter(([k]) => selected.includes(Number(k))));
    if (Object.keys(kept).length !== Object.keys(eff).length) {
      const texte = selected.filter(j => kept[j] != null).map(j => `${sourceLabelOf(j)} : ${kept[j]}`).join(" | ");
      onChange({ effectifs: kept, valeur_texte: texte || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceAnswer?.valeur_options]);

  // Effectif par option choisie à la question source : une déroulante par activité
  if (question.type === "effectifs" && sourceQuestion) {
    const selected = (sourceAnswer?.valeur_options || []).slice().sort((a, b) => a - b);
    if (selected.length === 0) {
      return (
        <p className="text-sm italic text-muted-foreground">
          Choisissez d'abord au moins une option à la question « {sourceQuestion.libelle} ».
        </p>
      );
    }
    const max = Number(question.config?.max) || 15;
    const eff = val.effectifs || {};
    function setCount(i, raw) {
      const next = { ...eff };
      if (raw === "") delete next[i]; else next[i] = Number(raw);
      const texte = selected.filter(j => next[j] != null).map(j => `${sourceLabelOf(j)} : ${next[j]}`).join(" | ");
      onChange({ effectifs: next, valeur_texte: texte || undefined });
    }
    return (
      <div className="space-y-2">
        {selected.map(i => (
          <div key={i} className="flex items-center gap-3 border border-border rounded-xl px-4 py-2.5 bg-background">
            <span className="flex-1 text-sm font-medium text-foreground">{sourceLabelOf(i)}</span>
            <select
              value={eff[i] ?? ""}
              onChange={e => setCount(i, e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:border-primary"
              style={{ "--tw-ring-color": theme.primary + "4d" }}
            >
              <option value="">—</option>
              {Array.from({ length: max }, (_, k) => k + 1).map(n => (
                <option key={n} value={n}>{n} personne{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }
  // « effectifs » sans question source configurée : repli en saisie libre
  if (question.type === "effectifs") {
    return (
      <textarea
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
        rows={3}
        value={val.valeur_texte || ""}
        onChange={e => onChange({ valeur_texte: e.target.value })}
        placeholder="Votre réponse…"
      />
    );
  }

  if (question.type === "ouinon") {
    return (
      <div className="flex gap-3">
        {["Oui", "Non"].map((opt, i) => (
          <button key={i} type="button" onClick={() => onChange({ valeur_options: [i] })}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              val.valeur_options?.includes(i)
                ? i === 0 ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
                : "border-border hover:border-muted-foreground text-foreground bg-background"
            }`}
            style={!val.valeur_options?.includes(i) && isTrigger(i) ? { borderColor: GOLD, background: GOLD + "0d" } : undefined}>
            {opt}{isTrigger(i) && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle" style={{ background: GOLD }} />}
          </button>
        ))}
      </div>
    );
  }

  // Champ de saisie « Autre (précisez) » partagé par les types à choix
  const otherSelected = val.valeur_options?.includes(OTHER_INDEX);
  const otherInput = otherSelected ? (
    <input
      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background mt-1"
      value={val.valeur_texte || ""}
      onChange={e => onChange({ ...val, valeur_texte: e.target.value })}
      placeholder="Précisez…"
      autoFocus
    />
  ) : null;

  if (question.type === "single") {
    const allOptions = [
      ...(question.options || []).map((opt, i) => ({ opt, i })),
      ...(question.config?.allow_other ? [{ opt: "Autre (précisez)", i: OTHER_INDEX }] : []),
    ];
    return (
      <div className="space-y-2">
        {allOptions.map(({ opt, i }) => {
          const img = i >= 0 ? question.options_images?.[i] : null;
          const selected = val.valeur_options?.includes(i);
          return (
            <button key={i} type="button" onClick={() => onChange({ valeur_options: [i] })}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
              }`}
              style={!selected && isTrigger(i) ? { borderColor: GOLD, background: GOLD + "0d" } : undefined}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                {img && <img src={img} alt="Illustration de l'option" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.currentTarget.style.display = "none"} />}
                {opt}
                {isTrigger(i) && <TriggerHint />}
              </div>
            </button>
          );
        })}
        {otherInput}
      </div>
    );
  }

  if (question.type === "multiple") {
    function toggle(i) {
      const curr = val.valeur_options || [];
      onChange({ ...val, valeur_options: curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i] });
    }
    const allOptions = [
      ...(question.options || []).map((opt, i) => ({ opt, i })),
      ...(question.config?.allow_other ? [{ opt: "Autre (précisez)", i: OTHER_INDEX }] : []),
    ];
    return (
      <div className="space-y-2">
        {allOptions.map(({ opt, i }) => {
          const img = i >= 0 ? question.options_images?.[i] : null;
          const selected = val.valeur_options?.includes(i);
          return (
            <button key={i} type="button" onClick={() => toggle(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
              }`}
              style={!selected && isTrigger(i) ? { borderColor: GOLD, background: GOLD + "0d" } : undefined}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                {img && <img src={img} alt="Illustration de l'option" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.currentTarget.style.display = "none"} />}
                {opt}
                {isTrigger(i) && <TriggerHint />}
              </div>
            </button>
          );
        })}
        {otherInput}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <div className="space-y-1">
        <select
          value={val.valeur_options?.[0] ?? ""}
          onChange={e => {
            const v = e.target.value;
            onChange(v === "" ? {} : { valeur_options: [Number(v)] });
          }}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:border-primary bg-background"
          style={{ "--tw-ring-color": theme.primary + "4d" }}
        >
          <option value="">— Sélectionner —</option>
          {(question.options || []).map((opt, i) => (
            <option key={i} value={i}>{opt}{isTrigger(i) ? " ● (précision demandée)" : ""}</option>
          ))}
          {question.config?.allow_other && <option value={OTHER_INDEX}>Autre (précisez)</option>}
        </select>
        {otherInput}
      </div>
    );
  }

  if (question.type === "texte") {
    const hasValidation = !!question.config?.validation;
    if (hasValidation) {
      return (
        <input
          type={question.config.validation === "email" ? "email" : question.config.validation === "nombre" ? "number" : "text"}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
          value={val.valeur_texte || ""}
          onChange={e => onChange({ valeur_texte: e.target.value })}
          placeholder={question.config.validation === "email" ? "votre@email.com" : question.config.validation === "nombre" ? "0" : "Votre réponse…"}
        />
      );
    }
    return (
      <textarea
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
        rows={4}
        value={val.valeur_texte || ""}
        onChange={e => onChange({ valeur_texte: e.target.value })}
        placeholder="Votre réponse…"
      />
    );
  }

  if (question.type === "date") {
    return (
      <input
        type="date"
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
        value={val.valeur_texte || ""}
        onChange={e => onChange({ valeur_texte: e.target.value })}
      />
    );
  }

  if (question.type === "note") {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange({ valeur_note: n })}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-base font-bold transition-all ${
              val.valeur_note === n
                ? "border-amber-400 bg-amber-50 text-amber-600"
                : "border-border hover:border-amber-300 text-muted-foreground bg-background"
            }`}>
            {n}
          </button>
        ))}
        {val.valeur_note && <span className="self-center text-sm text-muted-foreground ml-1">{val.valeur_note} / 5</span>}
      </div>
    );
  }

  if (question.type === "echelle") {
    return (
      <div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }, (_, idx) => idx + 1).map(n => (
            <button key={n} type="button" onClick={() => onChange({ valeur_note: n })}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                val.valeur_note === n
                  ? "text-white"
                  : "border-border hover:border-primary/40 text-muted-foreground bg-background"
              }`}
              style={val.valeur_note === n ? { background: theme.primary, borderColor: theme.primary } : undefined}>
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5 px-0.5">
          <span>1 = pas du tout</span>
          <span>10 = tout à fait</span>
        </div>
      </div>
    );
  }

  return null;
}

// ── Validation d'une réponse ───────────────────────────────────────────────
function validateAnswer(q, a, ctx) {
  // Option « Autre » cochée → la précision est requise, même si optionnelle
  if (a?.valeur_options?.includes(OTHER_INDEX) && !a?.valeur_texte?.trim())
    return `Merci de préciser votre réponse « Autre » à la question "${q.libelle}".`;

  // « effectifs » : chaque option choisie à la question source doit avoir son nombre
  if (q.type === "effectifs") {
    const src = ctx?.questions?.find(p => p.id === q.config?.source_question_id);
    if (src) {
      const selected = ctx?.answers?.[src.id]?.valeur_options || [];
      if (q.obligatoire && selected.length > 0 && selected.some(i => (a?.effectifs || {})[i] == null))
        return `Merci d'indiquer le nombre de personnes pour chaque option choisie ("${q.libelle}").`;
      return null;
    }
    if (q.obligatoire && !a?.valeur_texte?.trim()) return `La question "${q.libelle}" est obligatoire.`;
    return null;
  }

  if (!q.obligatoire) return null;
  const missing =
    ((q.type === "single" || q.type === "multiple" || q.type === "ouinon" || q.type === "dropdown") && (!a?.valeur_options?.length)) ||
    ((q.type === "texte" || q.type === "date") && !a?.valeur_texte?.trim()) ||
    ((q.type === "note" || q.type === "echelle") && !a?.valeur_note);
  if (missing) return `La question "${q.libelle}" est obligatoire.`;

  if (q.type === "texte" && a?.valeur_texte?.trim()) {
    const v = a.valeur_texte.trim();
    if (q.config?.validation === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return `La question "${q.libelle}" requiert une adresse email valide.`;
    if (q.config?.validation === "nombre" && isNaN(Number(v)))
      return `La question "${q.libelle}" requiert un nombre valide.`;
    if (q.config?.validation === "telephone" && !/^[\d\s+\-()]{6,}$/.test(v))
      return `La question "${q.libelle}" requiert un numéro de téléphone valide.`;
  }
  return null;
}

// ── Page principale ────────────────────────────────────────────────────────
export default function Sondage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [sondage, setSondage] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [status, setStatus] = useState("loading");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  // Pile des pages visitées : la dernière est la page courante. À l'envoi,
  // seules les réponses des pages réellement parcourues sont soumises.
  const [pageStack, setPageStack] = useState([0]);
  const currentPageIdx = pageStack[pageStack.length - 1];
  const [rgpdConsent, setRgpdConsent] = useState(false);

  // Regrouper les questions par section pour la navigation
  const pages = useMemo(() => {
    if (!sondage) return [];
    const allSections = sondage.sections || [];
    if (allSections.length === 0) return []; // single-page mode

    const result = [];
    const ungrouped = sondage.questions.filter(q => !q.section_id);
    if (ungrouped.length > 0) {
      result.push({ id: "__ungrouped__", titre: null, description: null, questions: ungrouped });
    }
    allSections.forEach(sec => {
      const qs = sondage.questions.filter(q => q.section_id === sec.id);
      if (qs.length > 0) result.push({ id: sec.id, titre: sec.titre, description: sec.description, questions: qs });
    });
    return result;
  }, [sondage]);

  const useSections = pages.length > 0;
  const currentPage = useSections ? pages[currentPageIdx] : null;
  const visibleQuestions = useSections ? (currentPage?.questions || []) : (sondage?.questions || []);

  // Sous-question conditionnelle : visible seulement si l'option attendue
  // a été choisie à la question parente. Parent introuvable → on affiche.
  function isQuestionVisible(q) {
    const cond = q.config?.condition;
    if (!cond?.question_id) return true;
    if (!(sondage?.questions || []).some(p => p.id === cond.question_id)) return true;
    const a = answers[cond.question_id];
    return !!a?.valeur_options?.includes(cond.option_index);
  }
  const shownQuestions = visibleQuestions.filter(isQuestionVisible);

  const theme = useMemo(() => getTheme(sondage), [sondage]);

  // Options qui déclenchent une sous-question : question_id → Set(option_index)
  const triggerMap = useMemo(() => {
    const map = {};
    (sondage?.questions || []).forEach(q => {
      const cond = q.config?.condition;
      if (cond?.question_id != null && cond?.option_index != null) {
        (map[cond.question_id] = map[cond.question_id] || new Set()).add(cond.option_index);
      }
    });
    return map;
  }, [sondage]);

  // Fond de page premium : vignette + voile satiné + halos dorés doux + dégradé profond
  // (CSS pur, aucune image à charger — important pour le mobile)
  const pageBackground = {
    background: [
      // Vignette discrète qui recentre le regard sur la carte
      `radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.28) 100%)`,
      // Voile satiné diagonal très léger (effet tissu)
      `repeating-linear-gradient(115deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 9px)`,
      // Halo doré principal en haut à droite, plus doux qu'avant
      `radial-gradient(1100px 520px at 88% -8%, ${theme.accent}33, transparent 65%)`,
      // Lueur dorée basse gauche, à peine perceptible
      `radial-gradient(800px 520px at -10% 110%, ${theme.accent}24, transparent 62%)`,
      // Respiration claire du thème au centre bas
      `radial-gradient(640px 360px at 50% 120%, ${theme.primary}59, transparent 68%)`,
      // Base : dégradé profond du vert du thème vers un noir-vert velouté
      `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primary} 30%, #0c1712 78%, #08100c 100%)`,
    ].join(", "),
  };

  // Progression
  const progressPct = useSections
    ? Math.round(((currentPageIdx) / pages.length) * 100)
    : sondage?.questions?.length > 0
      ? Math.round((Object.values(answers).filter(a => a?.valeur_options?.length || a?.valeur_texte?.trim() || a?.valeur_note).length / sondage.questions.length) * 100)
      : 0;

  useEffect(() => {
    async function load() {
      const data = await getSondageWithQuestions(id);
      if (!data) { setStatus("notfound"); return; }
      setSondage(data);

      if (token) {
        const inv = await getInvitationByToken(token);
        if (inv && inv.sondage_id === id) {
          setInvitation(inv);
          if (inv.a_repondu) {
            const res = await getSondageResults(id);
            setResults(res); setStatus("voted"); return;
          }
        }
      } else {
        const fp = getFingerprint();
        if (await hasVoted(id, fp)) {
          const res = await getSondageResults(id);
          setResults(res); setStatus("voted"); return;
        }
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) { setStatus("expired"); return; }
      if (!data.actif) { setStatus("expired"); return; }

      // Quota de réponses atteint → sondage clôturé
      const maxSub = data.settings?.max_soumissions;
      if (maxSub && (await getSoumissionsCount(id)) >= maxSub) { setStatus("expired"); return; }

      const init = {};
      (data.questions || []).forEach(q => { init[q.id] = {}; });
      setAnswers(init);
      setStatus("active");
    }
    load();
  }, [id, token]);

  function setAnswer(questionId, val) {
    setAnswers(p => ({ ...p, [questionId]: val }));
  }

  // Évaluer la logique conditionnelle d'une page
  function evaluateLogic(pageQuestions) {
    for (const q of pageQuestions) {
      if (!q.logic?.rules?.length) continue;
      const a = answers[q.id] || {};
      for (const rule of q.logic.rules) {
        if (a.valeur_options?.includes(rule.option_index)) {
          return rule.goto_section_id; // "__end__" ou section UUID
        }
      }
    }
    return null;
  }

  // Règles de cohérence configurées dans settings.sum_rules : la somme de
  // questions numériques (« parts ») doit être égale à un total annoncé.
  // Le total est lu dans la liste « total » : la dernière question visible
  // et renseignée l'emporte (ex : la sous-question « nombre exact » prime
  // sur l'option « 5 personnes et + » du menu déroulant).
  function checkSumRules(pageQuestions) {
    const rules = sondage?.settings?.sum_rules || [];
    const pageIds = new Set(pageQuestions.map(q => q.id));
    for (const rule of rules) {
      if (!(rule.parts || []).some(qid => pageIds.has(qid))) continue;

      let total = null;
      for (const qid of rule.total || []) {
        const q = (sondage?.questions || []).find(x => x.id === qid);
        if (!q || !isQuestionVisible(q)) continue;
        const a = answers[qid];
        if (q.type === "texte") {
          const n = Number(a?.valeur_texte);
          if (a?.valeur_texte?.trim() && !isNaN(n)) total = n;
        } else if (a?.valeur_options?.length) {
          const n = parseInt((q.options || [])[a.valeur_options[0]], 10);
          if (!isNaN(n)) total = n;
        }
      }
      if (total == null) continue;

      let sum = 0, filled = false;
      for (const qid of rule.parts || []) {
        const q = (sondage?.questions || []).find(x => x.id === qid);
        if (!q || !isQuestionVisible(q)) continue;
        const n = Number(answers[qid]?.valeur_texte);
        if (answers[qid]?.valeur_texte?.trim() && !isNaN(n)) { sum += n; filled = true; }
      }
      if (!filled) continue;

      if (sum !== total) {
        return (rule.message || "La somme des détails doit être égale au total annoncé.")
          + ` (annoncé : ${total} — détaillé : ${sum})`;
      }
    }
    return null;
  }

  async function handleNext() {
    // Valider les questions affichées de la page actuelle
    for (const q of shownQuestions) {
      const err = validateAnswer(q, answers[q.id], { questions: sondage?.questions || [], answers });
      if (err) { alert(err); return; }
    }

    // Règles de cohérence (sommes) portant sur cette page
    const sumErr = checkSumRules(shownQuestions);
    if (sumErr) { alert(sumErr); return; }

    if (!useSections) {
      // Single-page : soumettre directement
      await doSubmit();
      return;
    }

    // Évaluer la logique conditionnelle
    const logicTarget = evaluateLogic(currentPage.questions);
    if (logicTarget === "__end__") {
      await doSubmit(); return;
    }

    let nextIdx = currentPageIdx + 1;
    if (logicTarget) {
      const targetIdx = pages.findIndex(p => p.id === logicTarget);
      if (targetIdx !== -1) nextIdx = targetIdx;
    }

    if (nextIdx >= pages.length) {
      await doSubmit();
    } else {
      setPageStack(s => [...s, nextIdx]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function doSubmit() {
    setSubmitting(true);
    // Ne soumettre que les questions des pages réellement parcourues
    // (une sortie anticipée « Terminer le sondage » ne doit jamais envoyer
    // les réponses des pages sautées), et écarter les sous-questions masquées.
    const allowedQuestions = useSections
      ? pageStack.map(idx => pages[idx]).filter(Boolean).flatMap(p => p.questions)
      : (sondage?.questions || []);
    const submittedAnswers = {};
    allowedQuestions.forEach(q => {
      if (isQuestionVisible(q) && answers[q.id]) submittedAnswers[q.id] = answers[q.id];
    });
    const fp = invitation ? null : getFingerprint();
    const nominatif = !sondage?.anonyme;
    const error = await submitSondage(
      id, submittedAnswers, fp,
      invitation?.id || null,
      nominatif ? (invitation?.nom || null) : null,
      nominatif ? (invitation?.email || null) : null,
    );

    if (error) {
      if (error.code === "23505") { setStatus("voted"); }
      else { alert("Erreur : " + error.message); }
    } else {
      const res = await getSondageResults(id);
      setResults(res); setStatus("voted");
    }
    setSubmitting(false);
  }

  const isLastPage = !useSections || currentPageIdx === pages.length - 1;

  return (
    <div className="min-h-screen flex flex-col" style={pageBackground}>
      <SEO
        title={sondage?.titre ? `${sondage.titre} — Sondage MBP` : "Sondage — Ma Belle Promo"}
        description="Participez au sondage de l'association Ma Belle Promo."
        path={`/sondage/${id}`}
      />

      <header className="bg-white border-b border-border shadow-sm px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: theme.primary }}>
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Sondage MBP</span>
        </div>
        {invitation?.nom && (
          <span className="ml-auto text-sm text-muted-foreground">
            Bonjour <strong className="text-foreground">{invitation.nom}</strong>
          </span>
        )}
      </header>

      {/* Barre de progression */}
      {status === "active" && (
        <div className="h-1 bg-muted">
          <div className="h-full transition-all duration-500" style={{ width: `${progressPct}%`, background: theme.primary }} />
        </div>
      )}

      <main className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-2xl space-y-4">

          {status === "loading" && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {status === "notfound" && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❓</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Sondage introuvable</h2>
              <p className="text-muted-foreground text-sm">Ce sondage n'existe pas ou a été supprimé.</p>
            </div>
          )}

          {status === "expired" && sondage && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-1">{sondage.titre}</h2>
              <p className="text-sm text-muted-foreground">Ce sondage est clôturé.</p>
            </div>
          )}

          {status === "voted" && sondage && results && (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }} />
              <div className="p-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {sondage.settings?.thanks_message || "Votre réponse a bien été enregistrée."}
                  </p>
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">{sondage.titre}</h2>
                {sondage.description && <p className="text-sm text-muted-foreground mb-4">{sondage.description}</p>}
                {sondage.settings?.show_results === false ? (
                  <p className="text-sm text-muted-foreground italic">
                    Les résultats de cette consultation ne sont pas publics — ils seront communiqués par l'association.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-6">{results.total} réponse{results.total !== 1 ? "s" : ""} au total</p>
                    <div className="space-y-6">
                      {(sondage.questions || []).map((q, i) => (
                        <div key={q.id}>
                          <p className="text-sm font-semibold text-foreground mb-3">{i + 1}. {q.libelle}</p>
                          <PublicQuestionResults question={q} reponses={results.reponses} theme={theme} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {status === "active" && sondage && (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }} />
              <div className="p-6">
                {/* En-tête sondage */}
                {(!useSections || currentPageIdx === 0) && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">En cours</span>
                      {useSections && (
                        <span className="text-xs text-muted-foreground">
                          Étape {currentPageIdx + 1} / {pages.length}
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-xl font-bold text-foreground leading-tight">{sondage.titre}</h2>
                    {sondage.description && <p className="text-sm text-muted-foreground mt-1">{sondage.description}</p>}
                    {!useSections && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {sondage.questions?.length} question{sondage.questions?.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* En-tête de section */}
                {useSections && currentPage?.titre && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Étape {currentPageIdx + 1} / {pages.length}</p>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{currentPage.titre}</h3>
                    {currentPage.description && <p className="text-sm text-muted-foreground mt-0.5">{currentPage.description}</p>}
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-8">
                  {shownQuestions.map((q, i) => {
                    const isSub = !!q.config?.condition;
                    // Numérotation : les sous-questions ne comptent pas
                    const num = shownQuestions.slice(0, i + 1).filter(x => !x.config?.condition).length;
                    return (
                      <div key={q.id} className={isSub ? "pl-4 border-l-2 rounded-sm" : ""}
                        style={isSub ? { borderColor: theme.primary + "55" } : undefined}>
                        <p className={`text-sm font-semibold text-foreground ${q.config?.aide ? "mb-1" : "mb-3"}`}>
                          {isSub ? "↳ " : `${num}. `}{q.libelle}
                          {!q.obligatoire && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optionnel)</span>}
                        </p>
                        {q.config?.aide && <p className="text-xs text-muted-foreground mb-3">{q.config.aide}</p>}
                        <QuestionInput question={q} answer={answers[q.id]} onChange={val => setAnswer(q.id, val)} theme={theme}
                          triggerOptions={triggerMap[q.id]}
                          sourceQuestion={(sondage?.questions || []).find(p => p.id === q.config?.source_question_id)}
                          sourceAnswer={answers[q.config?.source_question_id]} />
                      </div>
                    );
                  })}
                </div>

                {/* Consentement RGPD — affiché sur la dernière page uniquement */}
                {isLastPage && (
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {sondage.mention_rgpd || (
                          <>
                            {sondage.anonyme
                              ? "Ce sondage est anonyme — aucune donnée permettant de vous identifier n'est collectée ni conservée."
                              : invitation
                                ? `Votre réponse sera associée à votre identité (${invitation.nom || invitation.email}). Elle est collectée par l'association FDD Ma Belle Promo dans le cadre de cette consultation.`
                                : "Vos réponses sont collectées par l'association FDD Ma Belle Promo dans le cadre de cette consultation."}
                            {" "}Conformément à nos engagements RGPD, vous disposez d'un droit d'accès, de rectification et de suppression —{" "}
                            <Link to="/informations/contacts" className="underline hover:text-primary">contactez-nous</Link>
                            {" "}ou consultez notre{" "}
                            <Link to="/confidentialite" className="underline hover:text-primary">politique de confidentialité</Link>.
                          </>
                        )}
                      </p>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rgpdConsent}
                        onChange={e => setRgpdConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded flex-shrink-0 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        J'accepte que mes réponses soient collectées et traitées par l'association FDD Ma Belle Promo.
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-6 flex items-center gap-3">
                  {useSections && pageStack.length > 1 && (
                    <button onClick={() => { setPageStack(s => s.slice(0, -1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border font-medium text-sm text-foreground hover:bg-muted transition-all">
                      <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>
                  )}
                  <button onClick={handleNext} disabled={submitting || (isLastPage && !rgpdConsent)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                    style={{ background: theme.primary }}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Envoi en cours…"
                      : isLastPage ? "Envoyer mes réponses"
                      : <><span>Suivant</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-xs text-white/60">
        l'association Ma Belle Promo (MBP)
      </footer>
    </div>
  );
}
