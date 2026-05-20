import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Users, Briefcase, Clock, Check, X, Loader2,
  Plus, Trash2, Edit2,
} from "lucide-react";
import { inp, Field } from "./shared";

// ── Config statuts ─────────────────────────────────────────────────────────
const BEN_STATUT_CFG = {
  actif:    { label: "Actif",    color: "bg-emerald-500/15 text-emerald-400" },
  inactif:  { label: "Inactif",  color: "bg-muted text-muted-foreground" },
  ponctuel: { label: "Ponctuel", color: "bg-blue-500/15 text-blue-400" },
};

const MISSION_STATUT_CFG = {
  planifiée: { label: "Planifiée", color: "bg-blue-500/15 text-blue-400" },
  en_cours:  { label: "En cours",  color: "bg-amber-500/15 text-amber-500" },
  terminée:  { label: "Terminée",  color: "bg-emerald-500/15 text-emerald-400" },
  annulée:   { label: "Annulée",   color: "bg-red-500/15 text-red-400" },
};

function emptyBen() {
  return {
    nom: "", email: "", telephone: "", competences: "",
    disponibilite: "", statut: "actif", date_engagement: "", notes: "",
  };
}

function emptyMission() {
  return { titre: "", description: "", date_debut: "", date_fin: "", responsable: "", statut: "planifiée" };
}

// ── Onglet Fiches bénévoles ────────────────────────────────────────────────
function FichesTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("benevoles").select("*").order("nom");
    if (error) toast.error("Erreur chargement : " + error.message);
    else setItems(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.nom.trim()) { toast.error("Le nom est obligatoire."); return; }
    setSaving(true);
    const payload = {
      nom:             form.nom.trim(),
      email:           form.email || null,
      telephone:       form.telephone || null,
      competences:     form.competences || null,
      disponibilite:   form.disponibilite || null,
      statut:          form.statut,
      date_engagement: form.date_engagement || null,
      notes:           form.notes || null,
    };
    const { error } = form.id
      ? await supabase.from("benevoles").update(payload).eq("id", form.id)
      : await supabase.from("benevoles").insert(payload);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(form.id ? "Fiche mise à jour." : "Bénévole ajouté."); setForm(null); load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce bénévole ? Ses heures seront également supprimées.")) return;
    const { error } = await supabase.from("benevoles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Bénévole supprimé."); load(); }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.statut === filter);

  return (
    <div className="space-y-4">
      {/* Actions + filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setForm(emptyBen())}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un bénévole
        </button>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "actif", "inactif", "ponctuel"].map(k => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 h-7 rounded-full text-xs font-semibold transition-colors ${
                filter === k ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}>
              {k === "all" ? "Tous" : BEN_STATUT_CFG[k]?.label || k}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} bénévole{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">
              {form.id ? "Modifier la fiche" : "Nouveau bénévole"}
            </p>
            <button onClick={() => setForm(null)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom complet" required>
              <input className={inp} value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Prénom NOM" />
            </Field>
            <Field label="Statut">
              <select className={inp} value={form.statut}
                onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="ponctuel">Ponctuel</option>
              </select>
            </Field>
            <Field label="Email">
              <input className={inp} type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Téléphone">
              <input className={inp} value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
            </Field>
            <Field label="Compétences">
              <input className={inp} value={form.competences}
                onChange={e => setForm(f => ({ ...f, competences: e.target.value }))}
                placeholder="ex : comptabilité, communication, juridique" />
            </Field>
            <Field label="Disponibilité">
              <input className={inp} value={form.disponibilite}
                onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value }))}
                placeholder="ex : weekends, soirées en semaine" />
            </Field>
            <Field label="Date d'engagement">
              <input className={inp} type="date" value={form.date_engagement}
                onChange={e => setForm(f => ({ ...f, date_engagement: e.target.value }))} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes internes">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observations, contexte particulier…" />
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border justify-end">
            <button onClick={() => setForm(null)}
              className="px-4 h-9 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {form.id ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          {filter === "all"
            ? "Aucun bénévole enregistré. Cliquez sur « Ajouter » pour commencer."
            : "Aucun bénévole dans cette catégorie."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => {
            const cfg = BEN_STATUT_CFG[b.statut] || BEN_STATUT_CFG.actif;
            return (
              <div key={b.id} className="bg-background border border-border rounded-2xl px-5 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{b.nom}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                    {b.email     && <span>{b.email}</span>}
                    {b.telephone && <span>{b.telephone}</span>}
                    {b.date_engagement && (
                      <span>
                        Depuis le {new Date(b.date_engagement + "T00:00:00").toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                  {b.competences  && <p className="text-xs text-muted-foreground mt-1">Compétences : {b.competences}</p>}
                  {b.disponibilite && <p className="text-xs text-muted-foreground">Dispo : {b.disponibilite}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setForm({ ...b, date_engagement: b.date_engagement || "" })}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Onglet Missions ────────────────────────────────────────────────────────
function MissionsTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("missions_benevoles")
      .select("*")
      .order("date_debut", { ascending: false, nullsFirst: false });
    if (error) toast.error("Erreur chargement : " + error.message);
    else setItems(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.titre.trim()) { toast.error("Le titre est obligatoire."); return; }
    setSaving(true);
    const payload = {
      titre:       form.titre.trim(),
      description: form.description || null,
      date_debut:  form.date_debut || null,
      date_fin:    form.date_fin || null,
      responsable: form.responsable || null,
      statut:      form.statut,
    };
    const { error } = form.id
      ? await supabase.from("missions_benevoles").update(payload).eq("id", form.id)
      : await supabase.from("missions_benevoles").insert(payload);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(form.id ? "Mission mise à jour." : "Mission créée."); setForm(null); load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette mission ?")) return;
    const { error } = await supabase.from("missions_benevoles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Mission supprimée."); load(); }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.statut === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setForm(emptyMission())}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Créer une mission
        </button>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "planifiée", "en_cours", "terminée", "annulée"].map(k => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 h-7 rounded-full text-xs font-semibold transition-colors ${
                filter === k ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}>
              {k === "all" ? "Toutes" : MISSION_STATUT_CFG[k]?.label || k}
            </button>
          ))}
        </div>
      </div>

      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">
              {form.id ? "Modifier la mission" : "Nouvelle mission"}
            </p>
            <button onClick={() => setForm(null)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Titre" required>
              <input className={inp} value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="ex : Organisation Gala annuel" />
            </Field>
            <Field label="Statut">
              <select className={inp} value={form.statut}
                onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                <option value="planifiée">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminée">Terminée</option>
                <option value="annulée">Annulée</option>
              </select>
            </Field>
            <Field label="Date de début">
              <input className={inp} type="date" value={form.date_debut}
                onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            </Field>
            <Field label="Date de fin">
              <input className={inp} type="date" value={form.date_fin}
                onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
            </Field>
            <Field label="Responsable">
              <input className={inp} value={form.responsable}
                onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
                placeholder="Nom du responsable" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Objectifs, contexte, tâches prévues…" />
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border justify-end">
            <button onClick={() => setForm(null)}
              className="px-4 h-9 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {form.id ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          {filter === "all" ? "Aucune mission créée." : "Aucune mission dans ce statut."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => {
            const cfg = MISSION_STATUT_CFG[m.statut] || MISSION_STATUT_CFG.planifiée;
            return (
              <div key={m.id} className="bg-background border border-border rounded-2xl px-5 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{m.titre}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                    {m.responsable && <span>Resp. : {m.responsable}</span>}
                    {m.date_debut && (
                      <span>
                        {new Date(m.date_debut + "T00:00:00").toLocaleDateString("fr-FR")}
                        {m.date_fin ? " → " + new Date(m.date_fin + "T00:00:00").toLocaleDateString("fr-FR") : ""}
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setForm({ ...m, date_debut: m.date_debut || "", date_fin: m.date_fin || "" })}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Onglet Journal d'heures ────────────────────────────────────────────────
function HeuresTab() {
  const [heures,    setHeures]    = useState([]);
  const [benevoles, setBenevoles] = useState([]);
  const [missions,  setMissions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filterBen, setFilterBen] = useState("all");
  const [form,      setForm]      = useState(null);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [hRes, bRes, mRes] = await Promise.all([
      supabase
        .from("heures_benevoles")
        .select("*, benevoles(nom), missions_benevoles(titre)")
        .order("date", { ascending: false }),
      supabase.from("benevoles").select("id, nom").order("nom"),
      supabase.from("missions_benevoles").select("id, titre").in("statut", ["planifiée", "en_cours"]).order("titre"),
    ]);
    if (hRes.error) toast.error("Erreur heures : " + hRes.error.message);
    else setHeures(hRes.data || []);
    setBenevoles(bRes.data || []);
    setMissions(mRes.data || []);
    setLoading(false);
  }

  function openForm() {
    setForm({
      benevole_id: benevoles[0]?.id || "",
      mission_id: "",
      date: new Date().toISOString().slice(0, 10),
      heures: "",
      activite: "",
    });
  }

  async function save() {
    if (!form.benevole_id)                { toast.error("Sélectionnez un bénévole."); return; }
    if (!form.heures || Number(form.heures) <= 0) { toast.error("Le nombre d'heures doit être supérieur à 0."); return; }
    setSaving(true);
    const payload = {
      benevole_id: form.benevole_id,
      mission_id:  form.mission_id || null,
      date:        form.date,
      heures:      Number(form.heures),
      activite:    form.activite || null,
    };
    const { error } = form.id
      ? await supabase.from("heures_benevoles").update(payload).eq("id", form.id)
      : await supabase.from("heures_benevoles").insert(payload);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(form.id ? "Entrée mise à jour." : "Heures enregistrées."); setForm(null); loadAll(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette entrée ?")) return;
    const { error } = await supabase.from("heures_benevoles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Entrée supprimée."); loadAll(); }
  }

  async function toggleValide(item) {
    const { error } = await supabase
      .from("heures_benevoles")
      .update({ valide: !item.valide })
      .eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else setHeures(h => h.map(x => x.id === item.id ? { ...x, valide: !x.valide } : x));
  }

  const filtered    = filterBen === "all" ? heures : heures.filter(h => h.benevole_id === filterBen);
  const totalHeures = filtered.reduce((s, h) => s + (Number(h.heures) || 0), 0);
  const totalValide = filtered.filter(h => h.valide).reduce((s, h) => s + (Number(h.heures) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={openForm} disabled={benevoles.length === 0}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Saisir des heures
        </button>
        {benevoles.length > 0 && (
          <select
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50"
            value={filterBen} onChange={e => setFilterBen(e.target.value)}>
            <option value="all">Tous les bénévoles</option>
            {benevoles.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </select>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{totalHeures}h</span> total
            <span className="text-muted-foreground">·</span>
            <span className="font-bold text-emerald-400">{totalValide}h</span> validées
          </div>
        )}
      </div>

      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">
              {form.id ? "Modifier l'entrée" : "Saisie d'heures"}
            </p>
            <button onClick={() => setForm(null)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Bénévole" required>
              <select className={inp} value={form.benevole_id}
                onChange={e => setForm(f => ({ ...f, benevole_id: e.target.value }))}>
                {benevoles.length === 0
                  ? <option value="">— Aucun bénévole —</option>
                  : benevoles.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </select>
            </Field>
            <Field label="Mission (optionnel)">
              <select className={inp} value={form.mission_id}
                onChange={e => setForm(f => ({ ...f, mission_id: e.target.value }))}>
                <option value="">— Aucune mission —</option>
                {missions.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
              </select>
            </Field>
            <Field label="Date" required>
              <input className={inp} type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Nombre d'heures" required>
              <input className={inp} type="number" min="0.5" max="24" step="0.5"
                value={form.heures}
                onChange={e => setForm(f => ({ ...f, heures: e.target.value }))}
                placeholder="ex : 3.5" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Activité / description">
                <input className={inp} value={form.activite}
                  onChange={e => setForm(f => ({ ...f, activite: e.target.value }))}
                  placeholder="ex : Préparation logistique conférence, accueil participants…" />
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border justify-end">
            <button onClick={() => setForm(null)}
              className="px-4 h-9 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {form.id ? "Enregistrer" : "Saisir"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          {benevoles.length === 0
            ? "Ajoutez d'abord des bénévoles dans l'onglet « Fiches »."
            : "Aucune heure saisie."}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(h => (
            <div key={h.id} className="bg-background border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{h.benevoles?.nom || "—"}</p>
                  <span className="text-sm font-bold text-primary">{h.heures}h</span>
                  {h.missions_benevoles && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {h.missions_benevoles.titre}
                    </span>
                  )}
                  {h.valide && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      Validé
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{new Date(h.date + "T00:00:00").toLocaleDateString("fr-FR")}</span>
                  {h.activite && <span>· {h.activite}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleValide(h)}
                  title={h.valide ? "Invalider" : "Valider"}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    h.valide
                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-red-500/10 hover:text-red-400"
                      : "bg-muted/40 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
                  }`}>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setForm({ ...h, mission_id: h.mission_id || "" })}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(h.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export principal ──────────────────────────────────────────────────────
export default function BenevolesSection() {
  const [activeTab, setActiveTab] = useState("fiches");

  const TABS = [
    { key: "fiches",   label: "Fiches bénévoles", icon: Users },
    { key: "missions", label: "Missions",          icon: Briefcase },
    { key: "heures",   label: "Journal d'heures",  icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg">Bénévoles</h2>
          <p className="text-xs text-muted-foreground">Fiches bénévoles, missions et suivi des heures</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "fiches"   && <FichesTab />}
      {activeTab === "missions" && <MissionsTab />}
      {activeTab === "heures"   && <HeuresTab />}
    </div>
  );
}
