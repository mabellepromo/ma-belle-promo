import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Link2, BarChart2, Eye, EyeOff, Loader2, X, ChevronUp, ChevronDown } from "lucide-react";
import { useSondages, getVotes } from "../../hooks/useSondages";
import { inp, Field } from "./shared";

const COLORS = ["bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];

const PRESETS = [
  { label: "Oui / Non", options: ["Oui", "Non"] },
  { label: "Oui / Non / Abstention", options: ["Oui", "Non", "Abstention"] },
  { label: "Pour / Contre / Neutre", options: ["Pour", "Contre", "Neutre"] },
  { label: "Satisfaction 1→5", options: ["1 - Très insatisfait", "2 - Insatisfait", "3 - Neutre", "4 - Satisfait", "5 - Très satisfait"] },
  { label: "Accord / Désaccord", options: ["Tout à fait d'accord", "Plutôt d'accord", "Plutôt en désaccord", "Pas du tout d'accord"] },
];

function VoteResults({ sondage }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVotes(sondage.id).then(v => { setVotes(v); setLoading(false); });
  }, [sondage.id]);

  const total = votes.length;
  const counts = sondage.options.map((_, i) =>
    votes.filter(v => v.options_choisies.includes(i)).length
  );

  if (loading) return <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Chargement…</div>;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">{total} vote{total !== 1 ? "s" : ""}</p>
      {sondage.options.map((opt, i) => {
        const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-foreground truncate flex-1 mr-2">{opt}</span>
              <span className="font-bold text-foreground flex-shrink-0">{pct}% ({counts[i]})</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${COLORS[i % COLORS.length]}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const emptyForm = {
  titre: "", description: "",
  options: ["", ""],
  multiple_choix: false, expires_at: "", actif: true,
};

export default function SondagesSection() {
  const { sondages, loading, createSondage, updateSondage, deleteSondage } = useSondages({ adminMode: true });
  const [form, setForm] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);

  const origin = window.location.origin;

  function setOption(i, val) {
    setForm(p => {
      const opts = [...p.options];
      opts[i] = val;
      return { ...p, options: opts };
    });
  }

  function addOption() {
    setForm(p => ({ ...p, options: [...p.options, ""] }));
  }

  function removeOption(i) {
    if (form.options.length <= 2) return;
    setForm(p => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));
  }

  function moveOption(i, dir) {
    setForm(p => {
      const opts = [...p.options];
      const j = i + dir;
      if (j < 0 || j >= opts.length) return p;
      [opts[i], opts[j]] = [opts[j], opts[i]];
      return { ...p, options: opts };
    });
  }

  function applyPreset(preset) {
    setForm(p => ({ ...p, options: [...preset.options] }));
  }

  async function handleSubmit() {
    if (!form.titre?.trim()) { toast.error("Le titre est obligatoire."); return; }
    const options = form.options.map(s => s.trim()).filter(Boolean);
    if (options.length < 2) { toast.error("Au moins 2 options non vides requises."); return; }

    setSaving(true);
    const error = await createSondage({
      titre: form.titre.trim(),
      description: form.description?.trim() || null,
      options,
      multiple_choix: form.multiple_choix,
      expires_at: form.expires_at || null,
      actif: form.actif,
    });
    setSaving(false);

    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Sondage créé !");
    setForm(null);
  }

  function copyLink(id) {
    const url = `${origin}/sondage/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Lien copié !")).catch(() => toast.error("Copie impossible."));
  }

  async function toggleActif(s) {
    await updateSondage(s.id, { actif: !s.actif });
    toast.success(s.actif ? "Sondage désactivé." : "Sondage activé.");
  }

  async function handleDelete(s) {
    if (!window.confirm(`Supprimer « ${s.titre} » et tous ses votes ?`)) return;
    await deleteSondage(s.id);
    toast.success("Sondage supprimé.");
  }

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Sondages & votes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Posez des questions à vos membres, visualisez les résultats en temps réel.</p>
        </div>
        <button onClick={() => setForm({ ...emptyForm, options: ["", ""] })}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nouveau sondage
        </button>
      </div>

      {/* Formulaire nouveau sondage */}
      {form && (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Nouveau sondage</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <Field label="Question / Titre *">
              <input className={inp} value={form.titre}
                onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                placeholder="Ex : Quel lieu préférez-vous pour l'AG ?" />
            </Field>

            <Field label="Description (optionnelle)">
              <textarea className={inp} rows={2} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Contexte ou précisions…" />
            </Field>

            {/* Options dynamiques */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-0.5">
                  Options de réponse
                </label>
                <div className="flex gap-1 flex-wrap justify-end">
                  {PRESETS.map(preset => (
                    <button key={preset.label} type="button" onClick={() => applyPreset(preset)}
                      className="text-xs px-2 py-0.5 rounded-full border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors whitespace-nowrap">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {/* Boutons haut/bas */}
                    <div className="flex flex-col gap-0">
                      <button type="button" onClick={() => moveOption(i, -1)} disabled={i === 0}
                        className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => moveOption(i, 1)} disabled={i === form.options.length - 1}
                        className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Pastille couleur */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${COLORS[i % COLORS.length]}`} />
                    {/* Champ texte */}
                    <input
                      className={`${inp} flex-1`}
                      value={opt}
                      onChange={e => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); addOption(); }
                      }}
                    />
                    {/* Supprimer option */}
                    <button type="button" onClick={() => removeOption(i)}
                      disabled={form.options.length <= 2}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-20">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addOption}
                className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                <Plus className="w-4 h-4" /> Ajouter une option
              </button>
            </div>

            {/* Paramètres */}
            <div className="grid md:grid-cols-2 gap-4 pt-1 border-t border-border/50">
              <Field label="Date de clôture (optionnelle)">
                <input type="date" className={inp} value={form.expires_at}
                  onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} />
              </Field>
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.multiple_choix}
                    onChange={e => setForm(p => ({ ...p, multiple_choix: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground">Choix multiple autorisé</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.actif}
                    onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground">Actif immédiatement</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Créer le sondage
            </button>
          </div>
        </div>
      )}

      {/* Liste des sondages */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      ) : sondages.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl text-muted-foreground">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucun sondage pour l'instant.</p>
          <p className="text-sm mt-1">Créez un sondage pour consulter vos membres.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sondages.map(s => {
            const isExpired = s.expires_at && new Date(s.expires_at) < new Date();
            return (
              <div key={s.id} className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className={`h-1 w-full ${s.actif && !isExpired ? "bg-emerald-500" : "bg-slate-300"}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.actif && !isExpired ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {isExpired ? "Clôturé" : s.actif ? "En cours" : "Désactivé"}
                        </span>
                        {s.multiple_choix && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Choix multiple</span>}
                        {s.expires_at && <span className="text-xs text-muted-foreground">Expire le {new Date(s.expires_at).toLocaleDateString("fr-FR")}</span>}
                      </div>
                      <h3 className="font-semibold text-foreground leading-tight">{s.titre}</h3>
                      {s.description && <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {s.options.map((opt, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{opt}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => copyLink(s.id)} title="Copier le lien de vote"
                        className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setExpanded(p => ({ ...p, [s.id]: !p[s.id] }))} title="Voir les résultats"
                        className="w-8 h-8 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-muted-foreground hover:text-indigo-600 transition-colors">
                        {expanded[s.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => toggleActif(s)} title={s.actif ? "Désactiver" : "Activer"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${s.actif ? "hover:bg-amber-50 text-amber-500 hover:text-amber-700" : "hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600"}`}>
                        {s.actif ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => handleDelete(s)} title="Supprimer"
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expanded[s.id] && <VoteResults sondage={s} />}

                  <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground font-mono break-all select-all">
                      {origin}/sondage/{s.id}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
