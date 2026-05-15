import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Plus, Trash2, X, Loader2, ChevronDown, ChevronUp, Check,
  Users, FileText, Vote, Calendar, MapPin, Clock,
} from "lucide-react";
import { inp, Field } from "./shared";

const STATUT_STYLES = {
  planifiee: "bg-blue-500/15 text-blue-400",
  tenue:     "bg-emerald-500/15 text-emerald-400",
  annulee:   "bg-red-500/15 text-red-400",
};
const STATUT_LABELS = { planifiee: "Planifiée", tenue: "Tenue", annulee: "Annulée" };

const emptyForm = {
  titre: "", type: "ordinaire", date: "", heure: "", lieu: "",
  statut: "planifiee", quorum_requis: 50, ordre_du_jour: [],
};

// ── Onglet Présences ───────────────────────────────────────────────────────
function PresencesTab({ assemblee }) {
  const [members, setMembers] = useState([]);
  const [presences, setPresences] = useState({});
  const [procurations, setProcurations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: mems }, { data: pres }] = await Promise.all([
        supabase.from("members").select("id, prenom, nom, photo_url").order("nom"),
        supabase.from("assemblee_presences").select("*").eq("assemblee_id", assemblee.id),
      ]);
      setMembers(mems || []);
      const presMap = {}, procMap = {};
      (pres || []).forEach(p => {
        presMap[p.member_id] = p.present;
        procMap[p.member_id] = p.procuration_pour || null;
      });
      setPresences(presMap);
      setProcurations(procMap);
      setLoading(false);
    }
    load();
  }, [assemblee.id]);

  const filtered = members.filter(m =>
    !search || `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  async function togglePresence(memberId) {
    const newVal = !presences[memberId];
    setPresences(p => ({ ...p, [memberId]: newVal }));
    await supabase.from("assemblee_presences").upsert({
      assemblee_id: assemblee.id, member_id: memberId, present: newVal,
      procuration_pour: newVal ? null : procurations[memberId],
    }, { onConflict: "assemblee_id,member_id" });
  }

  async function setProcuration(memberId, targetId) {
    setProcurations(p => ({ ...p, [memberId]: targetId || null }));
    await supabase.from("assemblee_presences").upsert({
      assemblee_id: assemblee.id, member_id: memberId,
      present: presences[memberId] || false,
      procuration_pour: targetId || null,
    }, { onConflict: "assemblee_id,member_id" });
  }

  const totalPresents = members.filter(m => presences[m.id]).length;
  const totalProcurations = members.filter(m => !presences[m.id] && procurations[m.id]).length;
  const votants = totalPresents + totalProcurations;
  const quorum = members.length > 0 ? Math.round((votants / members.length) * 100) : 0;
  const quorumAtteint = quorum >= (assemblee.quorum_requis || 50);

  return (
    <div className="space-y-4">
      {/* Synthèse quorum */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Présents", value: totalPresents, color: "text-emerald-400" },
          { label: "Procurations", value: totalProcurations, color: "text-blue-400" },
          { label: "Votants", value: votants, color: "text-foreground" },
          { label: "Quorum", value: `${quorum}%`, color: quorumAtteint ? "text-emerald-400" : "text-red-500",
            sub: quorumAtteint ? "✓ Atteint" : `Requis : ${assemblee.quorum_requis}%` },
        ].map(s => (
          <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <input className={inp} placeholder="Rechercher un membre…" value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(m => {
            const present = !!presences[m.id];
            return (
              <div key={m.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${present ? "border-emerald-500/25 bg-emerald-500/15/50" : "border-border bg-card"}`}>
                <button type="button" onClick={() => togglePresence(m.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${present ? "border-emerald-500 bg-emerald-500" : "border-border"}`}>
                  {present && <Check className="w-3 h-3 text-white" />}
                </button>
                {m.photo_url
                  ? <img src={m.photo_url} alt={`${m.prenom || ""} ${m.nom || ""}`.trim() || "Photo du membre"} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />}
                <span className="text-sm font-medium text-foreground flex-1">{m.prenom} {m.nom}</span>
                {!present && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Procuration de :</span>
                    <select className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none"
                      value={procurations[m.id] || ""}
                      onChange={e => setProcuration(m.id, e.target.value)}>
                      <option value="">— Aucune —</option>
                      {members.filter(x => x.id !== m.id && presences[x.id]).map(x => (
                        <option key={x.id} value={x.id}>{x.prenom} {x.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Onglet Résolutions ─────────────────────────────────────────────────────
function ResolutionsTab({ assemblee }) {
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLibelle, setNewLibelle] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("assemblee_resolutions").select("*").eq("assemblee_id", assemblee.id).order("numero");
    setResolutions(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [assemblee.id]);

  async function addResolution() {
    if (!newLibelle.trim()) return;
    setAdding(true);
    const numero = resolutions.length + 1;
    const { data, error } = await supabase.from("assemblee_resolutions")
      .insert({ assemblee_id: assemblee.id, numero, libelle: newLibelle.trim() })
      .select().single();
    setAdding(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    setResolutions(p => [...p, data]);
    setNewLibelle("");
  }

  async function updateVotes(id, field, value) {
    const val = Math.max(0, parseInt(value) || 0);
    setResolutions(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    await supabase.from("assemblee_resolutions").update({ [field]: val }).eq("id", id);
  }

  async function setAdoptee(id, adoptee) {
    setResolutions(prev => prev.map(r => r.id === id ? { ...r, adoptee } : r));
    await supabase.from("assemblee_resolutions").update({ adoptee }).eq("id", id);
  }

  async function deleteResolution(id) {
    if (!window.confirm("Supprimer cette résolution ?")) return;
    await supabase.from("assemblee_resolutions").delete().eq("id", id);
    await load();
  }

  return (
    <div className="space-y-4">
      {/* Ajout */}
      <div className="flex gap-2">
        <input className={`${inp} flex-1`} value={newLibelle} onChange={e => setNewLibelle(e.target.value)}
          placeholder="Libellé de la résolution…"
          onKeyDown={e => { if (e.key === "Enter") addResolution(); }} />
        <button onClick={addResolution} disabled={adding || !newLibelle.trim()}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : resolutions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune résolution pour cette assemblée.</p>
      ) : (
        <div className="space-y-3">
          {resolutions.map(r => {
            const total = r.votes_pour + r.votes_contre + r.abstentions;
            const pct = total > 0 ? Math.round((r.votes_pour / total) * 100) : 0;
            return (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">{r.numero}</span>
                  <p className="text-sm font-medium text-foreground flex-1">{r.libelle}</p>
                  <div className="flex items-center gap-1">
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setAdoptee(r.id, r.adoptee === v ? null : v)}
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
                          r.adoptee === v
                            ? v ? "bg-emerald-500/15 text-emerald-400 border-emerald-300" : "bg-red-500/15 text-red-400 border-red-300"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}>
                        {v ? "Adoptée" : "Rejetée"}
                      </button>
                    ))}
                    <button onClick={() => deleteResolution(r.id)}
                      className="w-6 h-6 rounded hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { key: "votes_pour", label: "Pour", color: "text-emerald-400" },
                    { key: "votes_contre", label: "Contre", color: "text-red-500" },
                    { key: "abstentions", label: "Abstentions", color: "text-muted-foreground" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <input type="number" min={0} value={r[key]}
                        onChange={e => updateVotes(r.id, key, e.target.value)}
                        className={`w-full text-center text-sm font-bold ${color} border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30`} />
                    </div>
                  ))}
                </div>
                {total > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span>{pct}% pour · {total} votant{total !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Onglet PV ──────────────────────────────────────────────────────────────
function PVTab({ assemblee, onUpdate }) {
  const [contenu, setContenu] = useState(assemblee.pv_contenu || "");
  const [publie, setPublie] = useState(assemblee.pv_publie || false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("assemblees")
      .update({ pv_contenu: contenu, pv_publie: publie }).eq("id", assemblee.id);
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("PV enregistré.");
    onUpdate({ ...assemblee, pv_contenu: contenu, pv_publie: publie });
  }

  return (
    <div className="space-y-4">
      <textarea
        className={`${inp} min-h-64 font-mono text-sm`}
        value={contenu}
        onChange={e => setContenu(e.target.value)}
        placeholder="Rédigez le procès-verbal ici…&#10;&#10;Ordre du jour :&#10;1. …&#10;&#10;Délibérations :&#10;…&#10;&#10;La séance est levée à …"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={publie} onChange={e => setPublie(e.target.checked)}
            className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm text-foreground">Publier dans l'espace membre</span>
          {publie && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Visible</span>}
        </label>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer le PV
        </button>
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export default function AssembleesSection() {
  const [assemblees, setAssemblees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("presences");
  const [newOdj, setNewOdj] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("assemblees").select("*").order("date", { ascending: false });
    setAssemblees(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const selected = assemblees.find(a => a.id === selectedId);

  async function handleSave() {
    if (!form.titre?.trim()) { toast.error("Le titre est obligatoire."); return; }
    if (!form.date) { toast.error("La date est obligatoire."); return; }
    setSaving(true);
    const payload = {
      titre: form.titre.trim(), type: form.type, date: form.date,
      heure: form.heure || null, lieu: form.lieu?.trim() || null,
      statut: form.statut, quorum_requis: Number(form.quorum_requis) || 50,
      ordre_du_jour: form.ordre_du_jour || [],
    };
    const { error } = form.id
      ? await supabase.from("assemblees").update(payload).eq("id", form.id)
      : await supabase.from("assemblees").insert(payload);
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success(form.id ? "Assemblée mise à jour." : "Assemblée créée.");
    setForm(null); load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette assemblée et toutes ses données ?")) return;
    await supabase.from("assemblees").delete().eq("id", id);
    if (selectedId === id) setSelectedId(null);
    toast.success("Assemblée supprimée."); load();
  }

  async function updateStatut(id, statut) {
    await supabase.from("assemblees").update({ statut }).eq("id", id);
    setAssemblees(prev => prev.map(a => a.id === id ? { ...a, statut } : a));
  }

  function addOdj() {
    if (!newOdj.trim()) return;
    setForm(p => ({ ...p, ordre_du_jour: [...(p.ordre_du_jour || []), newOdj.trim()] }));
    setNewOdj("");
  }
  function removeOdj(i) {
    setForm(p => ({ ...p, ordre_du_jour: (p.ordre_du_jour || []).filter((_, j) => j !== i) }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Assemblées Générales</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Présences, résolutions, procès-verbaux</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setSelectedId(null); }}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle AG
        </button>
      </div>

      {/* Formulaire création/édition */}
      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">{form.id ? "Modifier" : "Nouvelle"} assemblée générale</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Titre *"><input className={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Assemblée Générale Ordinaire 2025" /></Field>
              </div>
              <Field label="Type">
                <select className={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="ordinaire">Ordinaire</option>
                  <option value="extraordinaire">Extraordinaire</option>
                </select>
              </Field>
              <Field label="Statut">
                <select className={inp} value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
                  <option value="planifiee">Planifiée</option>
                  <option value="tenue">Tenue</option>
                  <option value="annulee">Annulée</option>
                </select>
              </Field>
              <Field label="Date *"><input className={inp} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></Field>
              <Field label="Heure"><input className={inp} type="time" value={form.heure} onChange={e => setForm(p => ({ ...p, heure: e.target.value }))} /></Field>
              <div className="md:col-span-2">
                <Field label="Lieu"><input className={inp} value={form.lieu} onChange={e => setForm(p => ({ ...p, lieu: e.target.value }))} placeholder="Ex : Salle de conférence, Université de Lomé" /></Field>
              </div>
              <Field label="Quorum requis (%)">
                <input className={inp} type="number" min={1} max={100} value={form.quorum_requis}
                  onChange={e => setForm(p => ({ ...p, quorum_requis: e.target.value }))} />
              </Field>
            </div>

            {/* Ordre du jour */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Ordre du jour</p>
              <div className="space-y-1.5 mb-2">
                {(form.ordre_du_jour || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-sm text-foreground flex-1">{item}</span>
                    <button onClick={() => removeOdj(i)}
                      className="w-5 h-5 rounded hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={`${inp} flex-1 text-sm`} value={newOdj}
                  onChange={e => setNewOdj(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOdj(); } }}
                  placeholder="Ajouter un point à l'ordre du jour…" />
                <button onClick={addOdj} disabled={!newOdj.trim()}
                  className="px-3 h-10 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 disabled:opacity-40">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {form.id ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des AGs */}
        <div className="lg:col-span-1 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
          ) : assemblees.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
              <Vote className="w-8 h-8 mx-auto mb-2 opacity-25" />
              <p className="text-sm font-medium">Aucune assemblée.</p>
            </div>
          ) : assemblees.map(a => (
            <div key={a.id}
              className={`bg-card border rounded-xl p-3 cursor-pointer transition-all hover:shadow-sm ${selectedId === a.id ? "border-primary shadow-sm" : "border-border"}`}
              onClick={() => { setSelectedId(a.id); setDetailTab("presences"); }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${STATUT_STYLES[a.statut]}`}>
                      {STATUT_LABELS[a.statut]}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.type === "extraordinaire" ? "Extraordinaire" : "Ordinaire"}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{a.titre}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(a.date).toLocaleDateString("fr-FR")}</span>
                    {a.lieu && <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3" />{a.lieu}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); setForm({ ...a }); }}
                    className="w-6 h-6 rounded hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="w-3 h-3" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(a.id); }}
                    className="w-6 h-6 rounded hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {a.pv_publie && <span className="inline-block mt-1.5 text-xs px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full">PV publié</span>}
            </div>
          ))}
        </div>

        {/* Détail AG */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="h-full min-h-48 flex items-center justify-center bg-card border border-border rounded-2xl text-muted-foreground text-sm">
              Sélectionnez une assemblée pour gérer les présences, résolutions et PV
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* En-tête AG sélectionnée */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{selected.titre}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selected.date).toLocaleDateString("fr-FR")}{selected.heure && ` · ${selected.heure}`}</span>
                      {selected.lieu && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.lieu}</span>}
                    </div>
                    {(selected.ordre_du_jour || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selected.ordre_du_jour.map((item, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{i + 1}. {item}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Changement rapide statut */}
                  <select className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none"
                    value={selected.statut}
                    onChange={e => updateStatut(selected.id, e.target.value)}>
                    <option value="planifiee">Planifiée</option>
                    <option value="tenue">Tenue</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>

              {/* Onglets */}
              <div className="flex border-b border-border">
                {[
                  { key: "presences", label: "Présences", icon: Users },
                  { key: "resolutions", label: "Résolutions", icon: Vote },
                  { key: "pv", label: "Procès-verbal", icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setDetailTab(key)}
                    className={`flex items-center gap-1.5 flex-1 py-3 text-sm font-medium transition-colors ${detailTab === key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {detailTab === "presences"  && <PresencesTab assemblee={selected} />}
                {detailTab === "resolutions" && <ResolutionsTab assemblee={selected} />}
                {detailTab === "pv"          && <PVTab assemblee={selected} onUpdate={updated => setAssemblees(prev => prev.map(a => a.id === updated.id ? updated : a))} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
