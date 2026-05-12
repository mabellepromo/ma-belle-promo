import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSondageWithQuestions, hasVoted, submitSondage, getSondageResults, getFingerprint } from "../hooks/useSondages";
import { Check, ChevronLeft, Loader2 } from "lucide-react";

const COLORS = ["#0a3d28", "#1a7a4e", "#b8861a", "#1e40af", "#7c3aed", "#0e7490"];

// ── Résultats après vote (vue publique) ────────────────────────────────────
function PublicQuestionResults({ question, reponses }) {
  const qr = reponses.filter(r => r.question_id === question.id);

  if (question.type === "texte") {
    return (
      <p className="text-sm text-muted-foreground italic">{qr.length} réponse{qr.length !== 1 ? "s" : ""} reçue{qr.length !== 1 ? "s" : ""}.</p>
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

  // ouinon, single, multiple
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
                style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Input par type de question ─────────────────────────────────────────────
function QuestionInput({ question, answer, onChange }) {
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
        {(question.options || []).map((opt, i) => (
          <button key={i} type="button" onClick={() => onChange({ valeur_options: [i] })}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              val.valeur_options?.includes(i)
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
            }`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                val.valeur_options?.includes(i) ? "border-primary bg-primary" : "border-border"
              }`}>
                {val.valeur_options?.includes(i) && <Check className="w-3 h-3 text-white" />}
              </div>
              {opt}
            </div>
          </button>
        ))}
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
        {(question.options || []).map((opt, i) => (
          <button key={i} type="button" onClick={() => toggle(i)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              val.valeur_options?.includes(i)
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground bg-background"
            }`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                val.valeur_options?.includes(i) ? "border-primary bg-primary" : "border-border"
              }`}>
                {val.valeur_options?.includes(i) && <Check className="w-3 h-3 text-white" />}
              </div>
              {opt}
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "texte") {
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
        {val.valeur_note && (
          <span className="self-center text-sm text-muted-foreground ml-1">{val.valeur_note} / 5</span>
        )}
      </div>
    );
  }

  return null;
}

// ── Page principale ────────────────────────────────────────────────────────
export default function Sondage() {
  const { id } = useParams();
  const [sondage, setSondage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getSondageWithQuestions(id);
      if (!data) { setStatus("notfound"); return; }
      setSondage(data);

      const fp = getFingerprint();
      const voted = await hasVoted(id, fp);
      if (voted) {
        const res = await getSondageResults(id);
        setResults(res);
        setStatus("voted");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) { setStatus("expired"); return; }
      if (!data.actif) { setStatus("expired"); return; }

      const init = {};
      (data.questions || []).forEach(q => { init[q.id] = {}; });
      setAnswers(init);
      setStatus("active");
    }
    load();
  }, [id]);

  function setAnswer(questionId, val) {
    setAnswers(p => ({ ...p, [questionId]: val }));
  }

  async function handleSubmit() {
    for (const q of (sondage.questions || [])) {
      if (!q.obligatoire) continue;
      const a = answers[q.id] || {};
      const missing =
        ((q.type === "single" || q.type === "multiple" || q.type === "ouinon") && (!a.valeur_options || !a.valeur_options.length)) ||
        (q.type === "texte" && !a.valeur_texte?.trim()) ||
        (q.type === "note" && !a.valeur_note);
      if (missing) {
        alert(`La question "${q.libelle}" est obligatoire.`);
        return;
      }
    }

    setSubmitting(true);
    const fp = getFingerprint();
    const error = await submitSondage(id, answers, fp);
    if (error) {
      if (error.code === "23505") {
        setStatus("voted");
      } else {
        alert("Erreur lors de l'envoi : " + error.message);
      }
    } else {
      const res = await getSondageResults(id);
      setResults(res);
      setStatus("voted");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex flex-col">

      <header className="bg-white border-b border-border shadow-sm px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Accueil
        </Link>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#0a3d28" }}>
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Sondage MBP</span>
        </div>
      </header>

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
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #0a3d28, #b8861a)" }} />
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
                      <PublicQuestionResults question={q} reponses={results.reponses} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status === "active" && sondage && (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #0a3d28, #b8861a)" }} />
              <div className="p-6">
                <div className="mb-6">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sondage.actif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    En cours
                  </span>
                  <h2 className="font-heading text-xl font-bold text-foreground leading-tight mt-2">{sondage.titre}</h2>
                  {sondage.description && <p className="text-sm text-muted-foreground mt-1">{sondage.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {sondage.questions?.length} question{sondage.questions?.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-8">
                  {(sondage.questions || []).map((q, i) => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-foreground mb-3">
                        {i + 1}. {q.libelle}
                        {!q.obligatoire && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optionnel)</span>}
                      </p>
                      <QuestionInput question={q} answer={answers[q.id]} onChange={val => setAnswer(q.id, val)} />
                    </div>
                  ))}
                </div>

                <button onClick={handleSubmit} disabled={submitting}
                  className="mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  style={{ background: "#0a3d28", color: "#fff" }}>
                  {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</span> : "Envoyer mes réponses"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        FDD Ma Belle Promo · <a href="/" className="hover:text-primary">mabellepromo.org</a>
      </footer>
    </div>
  );
}
