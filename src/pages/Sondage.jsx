import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  getSondageWithQuestions, hasVoted, submitSondage,
  getSondageResults, getFingerprint, getInvitationByToken, getTheme,
} from "../hooks/useSondages";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// ── Résultats après vote ───────────────────────────────────────────────────
function PublicQuestionResults({ question, reponses, theme }) {
  const qr = reponses.filter(r => r.question_id === question.id);

  if (question.type === "texte" || question.type === "date") {
    return (
      <p className="text-sm text-muted-foreground italic">
        {qr.length} réponse{qr.length !== 1 ? "s" : ""} reçue{qr.length !== 1 ? "s" : ""}.
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

  const options = question.type === "ouinon" ? ["Oui", "Non"] : (question.options || []);
  const counts = options.map((_, i) => qr.filter(r => r.valeur_options?.includes(i)).length);
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

// ── Saisie par type ────────────────────────────────────────────────────────
function QuestionInput({ question, answer, onChange, theme }) {
  const val = answer || {};

  if (question.type === "ouinon") {
    return (
      <div className="flex gap-3">
        {["Oui", "Non"].map((opt, i) => (
          <button key={i} type="button" onClick={() => onChange({ valeur_options: [i] })}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              val.valeur_options?.includes(i)
                ? i === 0 ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
                : "border-border hover:border-muted-foreground text-foreground bg-background"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "single") {
    return (
      <div className="space-y-2">
        {(question.options || []).map((opt, i) => {
          const img = question.options_images?.[i];
          const selected = val.valeur_options?.includes(i);
          return (
            <button key={i} type="button" onClick={() => onChange({ valeur_options: [i] })}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display = "none"} />}
                {opt}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multiple") {
    function toggle(i) {
      const curr = val.valeur_options || [];
      onChange({ valeur_options: curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i] });
    }
    return (
      <div className="space-y-2">
        {(question.options || []).map((opt, i) => {
          const img = question.options_images?.[i];
          const selected = val.valeur_options?.includes(i);
          return (
            <button key={i} type="button" onClick={() => toggle(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display = "none"} />}
                {opt}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
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
          <option key={i} value={i}>{opt}</option>
        ))}
      </select>
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

  return null;
}

// ── Validation d'une réponse ───────────────────────────────────────────────
function validateAnswer(q, a) {
  if (!q.obligatoire) return null;
  const missing =
    ((q.type === "single" || q.type === "multiple" || q.type === "ouinon" || q.type === "dropdown") && (!a?.valeur_options?.length)) ||
    ((q.type === "texte" || q.type === "date") && !a?.valeur_texte?.trim()) ||
    (q.type === "note" && !a?.valeur_note);
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
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

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

  const theme = useMemo(() => getTheme(sondage), [sondage]);

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

  async function handleNext() {
    // Valider les questions de la page actuelle
    for (const q of visibleQuestions) {
      const err = validateAnswer(q, answers[q.id]);
      if (err) { alert(err); return; }
    }

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
      setCurrentPageIdx(nextIdx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function doSubmit() {
    setSubmitting(true);
    const fp = invitation ? null : getFingerprint();
    const error = await submitSondage(
      id, answers, fp,
      invitation?.id || null,
      invitation?.nom || null,
      invitation?.email || null,
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
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex flex-col`}>

      <header className="bg-white border-b border-border shadow-sm px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Accueil
        </Link>
        <div className="h-4 w-px bg-border" />
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
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❓</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Sondage introuvable</h2>
              <p className="text-muted-foreground text-sm">Ce sondage n'existe pas ou a été supprimé.</p>
            </div>
          )}

          {status === "expired" && sondage && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
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
                  <p className="text-sm font-semibold text-emerald-800">Votre réponse a bien été enregistrée.</p>
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">{sondage.titre}</h2>
                {sondage.description && <p className="text-sm text-muted-foreground mb-4">{sondage.description}</p>}
                <p className="text-xs text-muted-foreground mb-6">{results.total} réponse{results.total !== 1 ? "s" : ""} au total</p>
                <div className="space-y-6">
                  {(sondage.questions || []).map((q, i) => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-foreground mb-3">{i + 1}. {q.libelle}</p>
                      <PublicQuestionResults question={q} reponses={results.reponses} theme={theme} />
                    </div>
                  ))}
                </div>
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
                  {visibleQuestions.map((q, i) => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-foreground mb-3">
                        {i + 1}. {q.libelle}
                        {!q.obligatoire && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optionnel)</span>}
                      </p>
                      <QuestionInput question={q} answer={answers[q.id]} onChange={val => setAnswer(q.id, val)} theme={theme} />
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center gap-3">
                  {useSections && currentPageIdx > 0 && (
                    <button onClick={() => { setCurrentPageIdx(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border font-medium text-sm text-foreground hover:bg-muted transition-all">
                      <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>
                  )}
                  <button onClick={handleNext} disabled={submitting}
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

      <footer className="py-6 text-center text-xs text-muted-foreground">
        l'Association Ma Belle Promo (MBP) · <a href="/" className="hover:text-primary">mabellepromo.org</a>
      </footer>
    </div>
  );
}
