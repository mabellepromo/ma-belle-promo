import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getVotes, submitVote, getFingerprint } from "../hooks/useSondages";
import { Check, ChevronLeft, Loader2 } from "lucide-react";

export default function Sondage() {
  const { id } = useParams();
  const [sondage, setSondage]   = useState(null);
  const [votes, setVotes]       = useState([]);
  const [status, setStatus]     = useState("loading"); // loading | active | voted | expired | notfound
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("sondages").select("*").eq("id", id).single();
      if (!data) { setStatus("notfound"); return; }

      const fp = getFingerprint();
      const { data: myVote } = await supabase
        .from("votes").select("id").eq("sondage_id", id).eq("fingerprint", fp).maybeSingle();

      const voteData = await getVotes(id);
      setVotes(voteData);
      setSondage(data);

      if (myVote) { setStatus("voted"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setStatus("expired"); return; }
      if (!data.actif) { setStatus("expired"); return; }
      setStatus("active");
    }
    load();
  }, [id]);

  async function handleSubmit() {
    if (selected.length === 0) return;
    setSubmitting(true);
    const fp = getFingerprint();
    const error = await submitVote(id, selected, fp);
    if (error) {
      if (error.code === "23505") {
        setStatus("voted");
      } else {
        alert("Erreur lors du vote : " + error.message);
      }
    } else {
      const voteData = await getVotes(id);
      setVotes(voteData);
      setStatus("voted");
    }
    setSubmitting(false);
  }

  function toggle(idx) {
    if (sondage.multiple_choix) {
      setSelected(s => s.includes(idx) ? s.filter(i => i !== idx) : [...s, idx]);
    } else {
      setSelected([idx]);
    }
  }

  // Calcul des résultats
  const totalVotes = votes.length;
  const counts = sondage ? sondage.options.map((_, i) =>
    votes.filter(v => v.options_choisies.includes(i)).length
  ) : [];
  const max = Math.max(...counts, 1);

  const COLORS = ["#0a3d28", "#1a7a4e", "#b8861a", "#1e40af", "#7c3aed", "#0e7490"];

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
        <div className="w-full max-w-lg">

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
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">{sondage.titre}</h2>
                <p className="text-sm text-muted-foreground">Ce sondage est clôturé.</p>
              </div>
              <ResultsBars options={sondage.options} counts={counts} totalVotes={totalVotes} max={max} colors={COLORS} />
            </div>
          )}

          {(status === "active" || status === "voted") && sondage && (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #0a3d28, #b8861a)" }} />
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sondage.actif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {sondage.actif ? "En cours" : "Clôturé"}
                    </span>
                    {sondage.multiple_choix && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Choix multiple</span>
                    )}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground leading-tight">{sondage.titre}</h2>
                  {sondage.description && <p className="text-sm text-muted-foreground mt-2">{sondage.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
                </div>

                {status === "active" && (
                  <>
                    <div className="space-y-2 mb-6">
                      {sondage.options.map((opt, i) => (
                        <button key={i} onClick={() => toggle(i)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            selected.includes(i)
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border bg-background hover:border-primary/40 hover:bg-muted/50 text-foreground"
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selected.includes(i) ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {selected.includes(i) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {opt}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={handleSubmit} disabled={selected.length === 0 || submitting}
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                      style={{ background: "#0a3d28", color: "#fff" }}>
                      {submitting ? "Envoi en cours…" : "Voter"}
                    </button>
                  </>
                )}

                {status === "voted" && (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-800">Votre vote a bien été enregistré.</p>
                    </div>
                    <ResultsBars options={sondage.options} counts={counts} totalVotes={totalVotes} max={max} colors={COLORS} />
                  </>
                )}
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

function ResultsBars({ options, counts, totalVotes, max, colors }) {
  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const pct = totalVotes > 0 ? Math.round((counts[i] / totalVotes) * 100) : 0;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground truncate flex-1 mr-3">{opt}</span>
              <span className="font-bold text-foreground flex-shrink-0">{pct}% <span className="font-normal text-muted-foreground text-xs">({counts[i]})</span></span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
