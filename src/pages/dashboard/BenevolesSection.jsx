import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Users, Briefcase, Clock, Check, X, Loader2,
  Plus, Trash2, Edit2, UserPlus, Link2, Printer, Target,
} from "lucide-react";
import { inp, Field } from "./shared";
import { useConfirm } from "@/hooks/useConfirm";
import CandidaturesSection from "./CandidaturesSection.jsx";
import { genererFicheAffectation, genererFicheBenevole } from "@/lib/documentGenerators";
import { ASSIGNMENT_STATUSES, ROLE_SUGGESTIONS, statusLabel, statusColor, notifyAssignment } from "@/lib/affectations";

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
    assign_mission_id: "", assign_role: "", assign_status: "ASSIGNED",
  };
}

function emptyMission() {
  return { titre: "", description: "", date_debut: "", date_fin: "", responsable: "", statut: "planifiée" };
}

// ── Onglet Fiches bénévoles ────────────────────────────────────────────────
function FichesTab() {
  const [items,    setItems]    = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const { confirm, ConfirmEl } = useConfirm();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [bRes, mRes] = await Promise.all([
      supabase.from("benevoles").select("*").order("nom"),
      supabase.from("missions_benevoles").select("id, titre").in("statut", ["planifiée", "en_cours"]).order("titre"),
    ]);
    if (bRes.error) toast.error("Erreur chargement : " + bRes.error.message);
    else setItems(bRes.data || []);
    setMissions(mRes.data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.nom.trim()) { toast.error("Le nom est obligatoire."); return; }
    const wantsAssign = !form.id && !!form.assign_mission_id;
    if (wantsAssign && !form.assign_role.trim()) { toast.error("Indiquez le rôle pour la mission."); return; }
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

    let benevoleId = form.id;
    let error;
    if (form.id) {
      ({ error } = await supabase.from("benevoles").update(payload).eq("id", form.id));
    } else {
      const ins = await supabase.from("benevoles").insert(payload).select("id").single();
      error = ins.error;
      benevoleId = ins.data?.id;
    }
    if (error) { toast.error("Erreur : " + error.message); setSaving(false); return; }

    // Cas A : affectation à une mission lors de la création de la fiche
    if (wantsAssign && benevoleId) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: aErr } = await supabase.from("affectations_benevoles").insert({
        mission_id:        form.assign_mission_id,
        volunteer_source:  "SHEET",
        benevole_id:       benevoleId,
        assigned_role:     form.assign_role.trim(),
        assignment_status: form.assign_status || "ASSIGNED",
        assigned_date:     new Date().toISOString().slice(0, 10),
        created_by:        user?.id || null,
      });
      if (aErr) {
        toast.error("Fiche créée, mais affectation échouée : " + aErr.message);
      } else {
        const mission = missions.find((m) => m.id === form.assign_mission_id);
        notifyAssignment({
          to_email: form.email, to_name: form.nom, mission_titre: mission?.titre,
          assigned_role: form.assign_role.trim(), assignment_status: form.assign_status || "ASSIGNED",
        });
      }
    }
    toast.success(form.id ? "Fiche mise à jour." : (wantsAssign ? "Bénévole ajouté et affecté." : "Bénévole ajouté."));
    setForm(null);
    load();
    setSaving(false);
  }

  async function remove(id) {
    if (!await confirm("Supprimer ce bénévole ?", "Ses heures seront également supprimées.")) return;
    const { error } = await supabase.from("benevoles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Bénévole supprimé."); load(); }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.statut === filter);

  return (
    <div className="space-y-4">
      {ConfirmEl}
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

            {/* Cas A : affectation à une mission (création de fiche uniquement) */}
            {!form.id && missions.length > 0 && (
              <div className="md:col-span-2 grid md:grid-cols-3 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
                <div className="md:col-span-3 -mb-1">
                  <p className="text-xs font-semibold text-foreground">Affecter à une mission (optionnel)</p>
                </div>
                <Field label="Mission">
                  <select className={inp} value={form.assign_mission_id}
                    onChange={e => setForm(f => ({ ...f, assign_mission_id: e.target.value }))}>
                    <option value="">— Aucune —</option>
                    {missions.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
                  </select>
                </Field>
                <Field label="Rôle" required={!!form.assign_mission_id}>
                  <input className={inp} list="role-suggestions-fiche" value={form.assign_role}
                    onChange={e => setForm(f => ({ ...f, assign_role: e.target.value }))}
                    placeholder="ex : Mentor" disabled={!form.assign_mission_id} />
                  <datalist id="role-suggestions-fiche">
                    {ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                  </datalist>
                </Field>
                <Field label="Statut">
                  <select className={inp} value={form.assign_status} disabled={!form.assign_mission_id}
                    onChange={e => setForm(f => ({ ...f, assign_status: e.target.value }))}>
                    {ASSIGNMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </div>
            )}
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
                    onClick={() => genererFicheBenevole(b)}
                    title="Imprimer la fiche"
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
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
  const { confirm, ConfirmEl } = useConfirm();

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
    if (!await confirm("Supprimer cette mission ?", "Cette action est irréversible.")) return;
    const { error } = await supabase.from("missions_benevoles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Mission supprimée."); load(); }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.statut === filter);

  return (
    <div className="space-y-4">
      {ConfirmEl}
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
  const { confirm, ConfirmEl } = useConfirm();

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
    if (!await confirm("Supprimer cette entrée d'heures ?", "Cette action est irréversible.")) return;
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
      {ConfirmEl}
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

// ── Onglet Affectations (bénévole/candidature ↔ mission) ───────────────────
function AffectationsTab() {
  const [items,        setItems]        = useState([]);
  const [missions,     setMissions]     = useState([]);
  const [benevoles,    setBenevoles]    = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [form,         setForm]         = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [busy,         setBusy]         = useState(null);
  const { confirm, ConfirmEl } = useConfirm();

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [aRes, mRes, bRes, cRes] = await Promise.all([
      supabase.from("affectations_benevoles")
        .select("*, missions_benevoles(titre, responsable), benevoles(nom, email, telephone), candidatures_benevoles(full_name, email, phone)")
        .order("created_at", { ascending: false }),
      supabase.from("missions_benevoles").select("id, titre, responsable").in("statut", ["planifiée", "en_cours"]).order("titre"),
      supabase.from("benevoles").select("id, nom, email, telephone").order("nom"),
      supabase.from("candidatures_benevoles").select("id, full_name, email, phone").order("created_at", { ascending: false }),
    ]);
    if (aRes.error) toast.error("Erreur chargement : " + aRes.error.message);
    else setItems(aRes.data || []);
    setMissions(mRes.data || []);
    setBenevoles(bRes.data || []);
    setCandidatures(cRes.data || []);
    setLoading(false);
  }

  function openForm() {
    setForm({
      volunteer_source: "SHEET",
      benevole_id: benevoles[0]?.id || "",
      candidature_id: candidatures[0]?.id || "",
      mission_id: missions[0]?.id || "",
      assigned_role: "",
      assignment_status: "ASSIGNED",
      start_date: "",
      end_date: "",
      admin_notes: "",
    });
  }

  function volunteerInfo(f) {
    if (f.volunteer_source === "SHEET") {
      const b = benevoles.find((x) => x.id === f.benevole_id);
      return b ? { nom: b.nom, email: b.email, tel: b.telephone } : null;
    }
    const c = candidatures.find((x) => x.id === f.candidature_id);
    return c ? { nom: c.full_name, email: c.email, tel: c.phone } : null;
  }

  async function save() {
    if (!form.mission_id)            { toast.error("Sélectionnez une mission."); return; }
    if (!form.assigned_role.trim())  { toast.error("Le rôle est obligatoire."); return; }
    const isSheet = form.volunteer_source === "SHEET";
    if (isSheet && !form.benevole_id)        { toast.error("Sélectionnez un bénévole."); return; }
    if (!isSheet && !form.candidature_id)    { toast.error("Sélectionnez une candidature."); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      mission_id:        form.mission_id,
      volunteer_source:  form.volunteer_source,
      benevole_id:       isSheet ? form.benevole_id : null,
      candidature_id:    isSheet ? null : form.candidature_id,
      assigned_role:     form.assigned_role.trim(),
      assignment_status: form.assignment_status,
      assigned_date:     new Date().toISOString().slice(0, 10),
      start_date:        form.start_date || null,
      end_date:          form.end_date || null,
      admin_notes:       form.admin_notes || null,
      created_by:        user?.id || null,
    };
    const { error } = await supabase.from("affectations_benevoles").insert(payload);
    if (error) {
      // 23505 = violation d'unicité (déjà affecté à cette mission)
      toast.error(error.code === "23505" ? "Ce bénévole est déjà affecté à cette mission." : "Erreur : " + error.message);
      setSaving(false);
      return;
    }
    const v = volunteerInfo(form);
    const mission = missions.find((m) => m.id === form.mission_id);
    notifyAssignment({
      to_email: v?.email, to_name: v?.nom, mission_titre: mission?.titre,
      assigned_role: payload.assigned_role, assignment_status: payload.assignment_status,
      start_date: payload.start_date, end_date: payload.end_date,
    });
    toast.success(v?.email ? "Affectation créée — email de confirmation envoyé." : "Affectation créée.");
    setForm(null);
    setSaving(false);
    loadAll();
  }

  async function setStatut(item, assignment_status) {
    setBusy(item.id);
    const { error } = await supabase.from("affectations_benevoles").update({ assignment_status }).eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Statut mis à jour : " + statusLabel(assignment_status)); loadAll(); }
    setBusy(null);
  }

  async function remove(item) {
    if (!await confirm("Supprimer cette affectation ?", "Cette action est irréversible.")) return;
    const { error } = await supabase.from("affectations_benevoles").delete().eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Affectation supprimée."); loadAll(); }
  }

  function print(item) {
    const isSheet = item.volunteer_source === "SHEET";
    const v = isSheet ? item.benevoles : item.candidatures_benevoles;
    genererFicheAffectation({
      volunteer_nom:   isSheet ? v?.nom : v?.full_name,
      volunteer_email: v?.email,
      volunteer_tel:   isSheet ? v?.telephone : v?.phone,
      source:          item.volunteer_source,
      mission_titre:        item.missions_benevoles?.titre,
      mission_responsable:  item.missions_benevoles?.responsable,
      assigned_role:        item.assigned_role,
      assignment_status:    item.assignment_status,
      assignment_status_label: statusLabel(item.assignment_status),
      assigned_date: item.assigned_date,
      start_date:    item.start_date,
      end_date:      item.end_date,
      admin_notes:   item.admin_notes,
    });
  }

  const isSheet = form?.volunteer_source === "SHEET";
  const canAssign = missions.length > 0 && (benevoles.length > 0 || candidatures.length > 0);

  return (
    <div className="space-y-4">
      {ConfirmEl}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={openForm} disabled={!canAssign}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Assigner un bénévole
        </button>
        <span className="text-xs text-muted-foreground">{items.length} affectation{items.length !== 1 ? "s" : ""}</span>
        {!canAssign && (
          <span className="text-xs text-amber-500">Créez d'abord une mission (onglet Missions) et au moins un bénévole / une candidature.</span>
        )}
      </div>

      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">Nouvelle affectation</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Origine du bénévole" required>
              <select className={inp} value={form.volunteer_source}
                onChange={(e) => setForm((f) => ({ ...f, volunteer_source: e.target.value }))}>
                <option value="SHEET">Fiche bénévole</option>
                <option value="CANDIDATE">Candidature en ligne</option>
              </select>
            </Field>
            <Field label={isSheet ? "Bénévole" : "Candidature"} required>
              <select className={inp}
                value={isSheet ? form.benevole_id : form.candidature_id}
                onChange={(e) => setForm((f) => ({ ...f, [isSheet ? "benevole_id" : "candidature_id"]: e.target.value }))}>
                {isSheet
                  ? (benevoles.length ? benevoles.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>) : <option value="">— Aucun bénévole —</option>)
                  : (candidatures.length ? candidatures.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>) : <option value="">— Aucune candidature —</option>)}
              </select>
            </Field>
            <Field label="Mission" required>
              <select className={inp} value={form.mission_id}
                onChange={(e) => setForm((f) => ({ ...f, mission_id: e.target.value }))}>
                {missions.map((m) => <option key={m.id} value={m.id}>{m.titre}</option>)}
              </select>
            </Field>
            <Field label="Rôle confié" required>
              <input className={inp} list="role-suggestions" value={form.assigned_role}
                onChange={(e) => setForm((f) => ({ ...f, assigned_role: e.target.value }))}
                placeholder="ex : Mentor, Conférencier…" />
              <datalist id="role-suggestions">
                {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </Field>
            <Field label="Statut de l'affectation">
              <select className={inp} value={form.assignment_status}
                onChange={(e) => setForm((f) => ({ ...f, assignment_status: e.target.value }))}>
                {ASSIGNMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <div />
            <Field label="Date de début">
              <input className={inp} type="date" value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </Field>
            <Field label="Date de fin">
              <input className={inp} type="date" value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes internes">
                <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={2} value={form.admin_notes}
                  onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
                  placeholder="Précisions sur le rôle, contexte…" />
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border justify-end">
            <button onClick={() => setForm(null)} className="px-4 h-9 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Annuler</button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Assigner
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">Aucune affectation. Cliquez sur « Assigner un bénévole ».</div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => {
            const isS = a.volunteer_source === "SHEET";
            const nom = isS ? a.benevoles?.nom : a.candidatures_benevoles?.full_name;
            return (
              <div key={a.id} className="bg-background border border-border rounded-2xl px-5 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{nom || "—"}</p>
                    <span className="text-muted-foreground text-xs">→</span>
                    <p className="text-sm font-medium text-foreground">{a.missions_benevoles?.titre || "—"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(a.assignment_status)}`}>{statusLabel(a.assignment_status)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                    <span>Rôle : {a.assigned_role}</span>
                    <span>{isS ? "Fiche bureau" : "Candidature"}</span>
                    {(a.start_date || a.end_date) && (
                      <span>
                        {a.start_date ? new Date(a.start_date + "T00:00:00").toLocaleDateString("fr-FR") : "?"}
                        {" → "}
                        {a.end_date ? new Date(a.end_date + "T00:00:00").toLocaleDateString("fr-FR") : "?"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select value={a.assignment_status} onChange={(e) => setStatut(a, e.target.value)} disabled={busy === a.id}
                    className="h-8 px-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50">
                    {ASSIGNMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button onClick={() => print(a)} title="Imprimer la fiche"
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(a)} title="Supprimer"
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

// ── Export principal ──────────────────────────────────────────────────────
export default function BenevolesSection() {
  const [activeTab, setActiveTab] = useState("candidatures");

  const TABS = [
    { key: "candidatures", label: "Candidatures",     icon: UserPlus },
    { key: "fiches",       label: "Fiches bénévoles", icon: Users },
    { key: "missions",     label: "Missions",         icon: Briefcase },
    { key: "affectations", label: "Affectations",     icon: Target },
    { key: "heures",       label: "Journal d'heures", icon: Clock },
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

      {activeTab === "candidatures" && <CandidaturesSection embedded />}
      {activeTab === "fiches"       && <FichesTab />}
      {activeTab === "missions"     && <MissionsTab />}
      {activeTab === "affectations" && <AffectationsTab />}
      {activeTab === "heures"       && <HeuresTab />}
    </div>
  );
}
