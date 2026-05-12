import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/lib/memberStore";
import { Plus, Trash2, Users, Vote, ChevronRight, X, Loader2, CheckCircle, Lock } from "lucide-react";
import { inp, Field } from "./shared";

const POSTES_DEFAUT = ["Présidente", "Vice-Président(e)", "Secrétaire Général(e)", "Trésorier(ière)", "Commissaire aux Comptes"];

const STATUT_CFG = {
  brouillon: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
  ouverte:   { label: "Ouverte",   color: "bg-emerald-100 text-emerald-700" },
  cloturee:  { label: "Clôturée",  color: "bg-gray-100 text-gray-500" },
};

export default function ElectionsSection() {
  const { allMembers } = useMemberStore({ realtime: false });
  const [elections, setElections]     = useState([]);
  const [selected, setSelected]       = useState(null);
  const [candidats, setCandidats]     = useState([]);
  const [votes, setVotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(null);
  const [candidatForm, setCandidatForm] = useState(null);
  const [saving, setSaving]           = useState(false);

  useEffect(() => { loadElections(); }, []);
  useEffect(() => { if (selected) loadDetail(selected.id); }, [selected]);

  async function loadElections() {
    setLoading(true);
    const { data } = await supabase.from("elections").select("*").order("created_at", { ascending: false });
    setElections(data || []);
    setLoading(false);
  }

  async function loadDetail(id) {
    const [c, v] = await Promise.all([
      supabase.from("election_candidats").select("*, members(nom)").eq("election_id", id),
      supabase.from("election_votes").select("candidat_id").eq("election_id", id),
    ]);
    setCandidats(c.data || []);
    setVotes(v.data || []);
  }

  async function saveElection() {
    if (!form.titre?.trim()) { toast.error("Titre obligatoire."); return; }
    setSaving(true);
    if (form._id) {
      await supabase.from("elections").update({ titre: form.titre, description: form.description, date_debut: form.date_debut || null, date_fin: form.date_fin || null, statut: form.statut }).eq("id", form._id);
    } else {
      await supabase.from("elections").insert({ titre: form.titre, description: form.description, date_debut: form.date_debut || null, date_fin: form.date_fin || null });
    }
    setSaving(false); setForm(null); loadElections();
    toast.success(form._id ? "Élection mise à jour." : "Élection créée.");
  }

  async function deleteElection(id) {
    if (!confirm("Supprimer cette élection et tous ses votes ?")) return;
    await supabase.from("elections").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    loadElections(); toast.success("Élection supprimée.");
  }

  async function changeStatut(id, statut) {
    await supabase.from("elections").update({ statut }).eq("id", id);
    setSelected(prev => prev?.id === id ? { ...prev, statut } : prev);
    setElections(prev => prev.map(e => e.id === id ? { ...e, statut } : e));
    toast.success("Statut mis à jour.");
  }

  async function addCandidat() {
    if (!candidatForm.member_id || !candidatForm.poste) { toast.error("Membre et poste obligatoires."); return; }
    setSaving(true);
    const { error } = await supabase.from("election_candidats").insert({
      election_id: selected.id, member_id: candidatForm.member_id,
      poste: candidatForm.poste, bio: candidatForm.bio || null,
    });
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Candidat ajouté."); setCandidatForm(null); loadDetail(selected.id);
  }

  async function removeCandidat(id) {
    if (!confirm("Retirer ce candidat ?")) return;
    await supabase.from("election_candidats").delete().eq("id", id);
    toast.success("Candidat retiré."); loadDetail(selected.id);
  }

  const votesByCandidat = useMemo(() => {
    const map = {};
    votes.forEach(v => { map[v.candidat_id] = (map[v.candidat_id] || 0) + 1; });
    return map;
  }, [votes]);

  const emptyElection = { titre: "", description: "", date_debut: "", date_fin: "", statut: "brouillon" };

  if (loading) return (
    <div className="flex items-center gap-2 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Élections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Créez et gérez les élections du bureau</p>
        </div>
        <button onClick={() => setForm({ ...emptyElection })}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nouvelle élection
        </button>
      </div>

      {/* Formulaire création/édition */}
      {form && (
        <div className="bg-white border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{form._id ? "Modifier" : "Nouvelle élection"}</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Titre *"><input className={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Élection du Bureau 2026" /></Field>
            </div>
            <Field label="Date d'ouverture"><input className={inp} type="date" value={form.date_debut} onChange={e => setForm(p => ({ ...p, date_debut: e.target.value }))} /></Field>
            <Field label="Date de clôture"><input className={inp} type="date" value={form.date_fin} onChange={e => setForm(p => ({ ...p, date_fin: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea className={inp} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Instructions pour les électeurs…" />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted">Annuler</button>
            <button onClick={saveElection} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Liste des élections */}
        <div className="space-y-2">
          {elections.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune élection créée.</p>}
          {elections.map(e => {
            const cfg = STATUT_CFG[e.statut] || STATUT_CFG.brouillon;
            return (
              <div key={e.id} onClick={() => setSelected(e)}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${selected?.id === e.id ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-foreground leading-snug">{e.titre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                </div>
                {e.date_fin && <p className="text-xs text-muted-foreground">Clôture : {new Date(e.date_fin).toLocaleDateString("fr-FR")}</p>}
              </div>
            );
          })}
        </div>

        {/* Détail élection */}
        {selected ? (
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* En-tête */}
            <div className="px-5 py-4 border-b border-border bg-muted/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground">{selected.titre}</h3>
                  {selected.description && <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={selected.statut} onChange={e => changeStatut(selected.id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white text-foreground cursor-pointer">
                    <option value="brouillon">Brouillon</option>
                    <option value="ouverte">Ouverte</option>
                    <option value="cloturee">Clôturée</option>
                  </select>
                  <button onClick={() => setForm({ ...selected, _id: selected.id })}
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted">Modifier</button>
                  <button onClick={() => deleteElection(selected.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span><strong>{candidats.length}</strong> candidats</span>
                <span><strong>{votes.length}</strong> votes exprimés</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Ajouter candidat */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm text-foreground">Candidats</p>
                  {selected.statut !== "cloturee" && (
                    <button onClick={() => setCandidatForm({ member_id: "", poste: POSTES_DEFAUT[0], bio: "" })}
                      className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  )}
                </div>

                {candidatForm && (
                  <div className="bg-muted/20 border border-border rounded-xl p-4 mb-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Membre">
                        <select className={inp} value={candidatForm.member_id} onChange={e => setCandidatForm(p => ({ ...p, member_id: e.target.value }))}>
                          <option value="">— Sélectionner —</option>
                          {(allMembers || []).map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                        </select>
                      </Field>
                      <Field label="Poste">
                        <select className={inp} value={candidatForm.poste} onChange={e => setCandidatForm(p => ({ ...p, poste: e.target.value }))}>
                          {POSTES_DEFAUT.map(p => <option key={p}>{p}</option>)}
                          <option value="Autre">Autre</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Bio / Programme (optionnel)">
                      <textarea className={inp} rows={2} value={candidatForm.bio} onChange={e => setCandidatForm(p => ({ ...p, bio: e.target.value }))} />
                    </Field>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setCandidatForm(null)} className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted">Annuler</button>
                      <button onClick={addCandidat} disabled={saving}
                        className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50">
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}

                {candidats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun candidat déclaré.</p>
                ) : (
                  <div className="space-y-2">
                    {candidats.map(c => {
                      const nbVotes = votesByCandidat[c.id] || 0;
                      const pct = votes.length > 0 ? Math.round(nbVotes / votes.length * 100) : 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/10">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{c.members?.nom || c.member_id}</p>
                            <p className="text-xs text-muted-foreground">{c.poste}</p>
                            {c.bio && <p className="text-xs text-muted-foreground mt-0.5 italic">{c.bio}</p>}
                            {selected.statut === "cloturee" && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: pct + "%" }} />
                                </div>
                                <span className="text-xs font-bold text-foreground">{nbVotes} vote{nbVotes > 1 ? "s" : ""} ({pct}%)</span>
                              </div>
                            )}
                          </div>
                          {selected.statut !== "cloturee" && (
                            <button onClick={() => removeCandidat(c.id)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {selected.statut === "cloturee" && nbVotes === Math.max(...Object.values(votesByCandidat), 0) && nbVotes > 0 && (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" title="Élu(e)" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selected.statut === "ouverte" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                  <Vote className="w-4 h-4 flex-shrink-0" />
                  Élection ouverte — les membres peuvent voter depuis leur Espace Membre.
                </div>
              )}
              {selected.statut === "cloturee" && (
                <div className="bg-muted border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  Élection clôturée — {votes.length} vote{votes.length > 1 ? "s" : ""} exprimé{votes.length > 1 ? "s" : ""} sur {(allMembers || []).length} membres.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl flex items-center justify-center py-20 text-center text-muted-foreground">
            <div>
              <Vote className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Sélectionnez une élection</p>
              <p className="text-sm mt-1">ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
