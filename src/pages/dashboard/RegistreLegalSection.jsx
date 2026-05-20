import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase, uploadFile } from "@/lib/supabase";
import { openDocUrl } from "@/lib/documentGenerators";
import {
  Shield, AlertTriangle, Plus, Trash2, X, Loader2,
  FileText, Upload, Check, Clock, Archive, Eye, Edit2,
} from "lucide-react";
import { inp, Field } from "./shared";

// ── Configuration catégories ──────────────────────────────────────────────
const CATEGORIES = [
  { key: "statuts",             label: "Statuts associatifs" },
  { key: "reglement_interieur", label: "Règlement intérieur" },
  { key: "rgpd",                label: "RGPD / Données" },
  { key: "charte",              label: "Charte éthique" },
  { key: "autre",               label: "Autre" },
];

const CAT_CFG = {
  statuts:             { label: "Statuts associatifs", color: "bg-blue-500/15 text-blue-400" },
  reglement_interieur: { label: "Règlement intérieur", color: "bg-violet-500/15 text-violet-400" },
  rgpd:                { label: "RGPD / Données",      color: "bg-amber-500/15 text-amber-500" },
  charte:              { label: "Charte éthique",      color: "bg-emerald-500/15 text-emerald-400" },
  autre:               { label: "Autre",               color: "bg-muted text-muted-foreground" },
};

// ── Configuration statuts conflits ────────────────────────────────────────
const CONFLIT_CFG = {
  "déclaré": { label: "Déclaré",  color: "bg-amber-500/15 text-amber-500",     iconBg: "bg-amber-500/15",   iconCl: "text-amber-500",     icon: Clock },
  "résolu":  { label: "Résolu",   color: "bg-emerald-500/15 text-emerald-400", iconBg: "bg-emerald-500/15", iconCl: "text-emerald-400",   icon: Check },
  "archivé": { label: "Archivé",  color: "bg-muted text-muted-foreground",     iconBg: "bg-muted",          iconCl: "text-muted-foreground", icon: Archive },
};

const CONFLIT_NEXT = { "déclaré": "résolu", "résolu": "archivé" };

const emptyDoc = {
  categorie: "statuts", titre: "", description: "",
  version: "", date_adoption: "", url_fichier: "", actif: true,
};

function emptyConflit() {
  return {
    declarant: "", date_declaration: new Date().toISOString().slice(0, 10),
    objet: "", mesures: "", statut: "déclaré", date_resolution: "",
  };
}

// ── Onglet Documents légaux ───────────────────────────────────────────────
function DocumentsTab() {
  const [docs,      setDocs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [form,      setForm]      = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("registre_documents_legaux")
      .select("*")
      .order("date_adoption", { ascending: false, nullsFirst: false });
    if (error) toast.error("Erreur chargement : " + error.message);
    else setDocs(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.titre.trim()) { toast.error("Le titre est obligatoire."); return; }
    setSaving(true);
    const payload = {
      categorie:     form.categorie,
      titre:         form.titre.trim(),
      description:   form.description || null,
      version:       form.version || null,
      date_adoption: form.date_adoption || null,
      url_fichier:   form.url_fichier || null,
      actif:         form.actif,
    };
    const { error } = form.id
      ? await supabase.from("registre_documents_legaux").update(payload).eq("id", form.id)
      : await supabase.from("registre_documents_legaux").insert(payload);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(form.id ? "Document mis à jour." : "Document ajouté."); setForm(null); load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce document définitivement ?")) return;
    const { error } = await supabase.from("registre_documents_legaux").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Document supprimé."); load(); }
  }

  async function toggleActif(doc) {
    const { error } = await supabase
      .from("registre_documents_legaux")
      .update({ actif: !doc.actif })
      .eq("id", doc.id);
    if (error) toast.error("Erreur : " + error.message);
    else setDocs(d => d.map(x => x.id === doc.id ? { ...x, actif: !x.actif } : x));
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm(f => ({ ...f, url_fichier: url }));
      toast.success("Fichier uploadé.");
    } catch (err) {
      toast.error("Upload échoué : " + (err.message || err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const filtered = catFilter === "all" ? docs : docs.filter(d => d.categorie === catFilter);

  return (
    <div className="space-y-4">
      {/* Actions + filtres catégories */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setForm({ ...emptyDoc })}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un document
        </button>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setCatFilter("all")}
            className={`px-3 h-7 rounded-full text-xs font-semibold transition-colors ${catFilter === "all" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
            Tous
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)}
              className={`px-3 h-7 rounded-full text-xs font-semibold transition-colors ${catFilter === c.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire ajout / modification */}
      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">
              {form.id ? "Modifier le document" : "Nouveau document légal"}
            </p>
            <button onClick={() => setForm(null)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Catégorie" required>
              <select className={inp} value={form.categorie}
                onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Titre" required>
              <input className={inp} value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="ex : Statuts de l'association MBP" />
            </Field>
            <Field label="Version">
              <input className={inp} value={form.version}
                onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                placeholder="ex : v2.1 — révisé AG 2024" />
            </Field>
            <Field label="Date d'adoption">
              <input className={inp} type="date" value={form.date_adoption}
                onChange={e => setForm(f => ({ ...f, date_adoption: e.target.value }))} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Contexte d'adoption, portée du document…" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Fichier (PDF, Word)">
                <div className="flex items-center gap-2">
                  <input className={inp} type="url" value={form.url_fichier}
                    onChange={e => setForm(f => ({ ...f, url_fichier: e.target.value }))}
                    placeholder="URL du fichier ou cliquer sur Uploader →" />
                  <button type="button" disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 h-9 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 whitespace-nowrap">
                    {uploading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Upload…</>
                      : <><Upload className="w-3.5 h-3.5" /> Uploader</>}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                </div>
                {form.url_fichier && (
                  <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[400px]">{form.url_fichier}</span>
                  </p>
                )}
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.actif}
                onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-foreground">Document actif</span>
            </label>
            <div className="flex-1" />
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

      {/* Liste documents */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          {catFilter === "all"
            ? "Aucun document légal enregistré. Cliquez sur « Ajouter » pour commencer."
            : "Aucun document dans cette catégorie."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => {
            const cat = CAT_CFG[doc.categorie] || CAT_CFG.autre;
            return (
              <div key={doc.id} className="bg-background border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{doc.titre}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                      {!doc.actif && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Inactif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {doc.version && (
                        <span className="text-xs text-muted-foreground">{doc.version}</span>
                      )}
                      {doc.date_adoption && (
                        <span className="text-xs text-muted-foreground">
                          Adopté le {new Date(doc.date_adoption + "T00:00:00").toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {doc.url_fichier && (
                      <button
                        onClick={() => openDocUrl(doc.url_fichier, doc.titre)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                    )}
                    <button
                      onClick={() => toggleActif(doc)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${
                        doc.actif
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                      }`}>
                      {doc.actif ? "Actif" : "Inactif"}
                    </button>
                    <button
                      onClick={() => setForm({ ...doc, date_adoption: doc.date_adoption || "" })}
                      title="Modifier"
                      className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(doc.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

// ── Onglet Conflits d'intérêts ───────────────────────────────────────────
function ConflitsTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("registre_conflits")
      .select("*")
      .order("date_declaration", { ascending: false });
    if (error) toast.error("Erreur chargement : " + error.message);
    else setItems(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.declarant.trim()) { toast.error("Le déclarant est obligatoire."); return; }
    if (!form.objet.trim())     { toast.error("L'objet est obligatoire."); return; }
    setSaving(true);
    const payload = {
      declarant:        form.declarant.trim(),
      date_declaration: form.date_declaration,
      objet:            form.objet.trim(),
      mesures:          form.mesures || null,
      statut:           form.statut,
      date_resolution:  (form.statut === "résolu" || form.statut === "archivé")
                          ? (form.date_resolution || null)
                          : null,
    };
    const { error } = form.id
      ? await supabase.from("registre_conflits").update(payload).eq("id", form.id)
      : await supabase.from("registre_conflits").insert(payload);
    if (error) toast.error("Erreur : " + error.message);
    else {
      toast.success(form.id ? "Déclaration mise à jour." : "Déclaration enregistrée.");
      setForm(null);
      load();
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette déclaration définitivement ?")) return;
    const { error } = await supabase.from("registre_conflits").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Déclaration supprimée."); load(); }
  }

  async function advanceStatut(item) {
    const next = CONFLIT_NEXT[item.statut];
    if (!next) return;
    const update = { statut: next, date_resolution: new Date().toISOString().slice(0, 10) };
    const { error } = await supabase.from("registre_conflits").update(update).eq("id", item.id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(`Statut → ${next}`); load(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setForm(emptyConflit())}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Enregistrer une déclaration
        </button>
        <p className="text-xs text-muted-foreground">
          {items.length} déclaration{items.length !== 1 ? "s" : ""} au registre
        </p>
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-foreground text-sm">
              {form.id ? "Modifier la déclaration" : "Nouvelle déclaration de conflit d'intérêts"}
            </p>
            <button onClick={() => setForm(null)}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Déclarant" required>
              <input className={inp} value={form.declarant}
                onChange={e => setForm(f => ({ ...f, declarant: e.target.value }))}
                placeholder="Prénom NOM — ex : Jean DUPONT, Président" />
            </Field>
            <Field label="Date de déclaration" required>
              <input className={inp} type="date" value={form.date_declaration}
                onChange={e => setForm(f => ({ ...f, date_declaration: e.target.value }))} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Objet du conflit d'intérêts" required>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={3} value={form.objet}
                  onChange={e => setForm(f => ({ ...f, objet: e.target.value }))}
                  placeholder="Description précise de la situation de conflit potentiel…" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Mesures prises">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none"
                  rows={2} value={form.mesures}
                  onChange={e => setForm(f => ({ ...f, mesures: e.target.value }))}
                  placeholder="Récusation, abstention de vote, mesures correctives…" />
              </Field>
            </div>
            <Field label="Statut">
              <select className={inp} value={form.statut}
                onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                <option value="déclaré">Déclaré</option>
                <option value="résolu">Résolu</option>
                <option value="archivé">Archivé</option>
              </select>
            </Field>
            {(form.statut === "résolu" || form.statut === "archivé") && (
              <Field label="Date de résolution">
                <input className={inp} type="date" value={form.date_resolution}
                  onChange={e => setForm(f => ({ ...f, date_resolution: e.target.value }))} />
              </Field>
            )}
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <div className="flex-1" />
            <button onClick={() => setForm(null)}
              className="px-4 h-9 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {form.id ? "Enregistrer" : "Déclarer"}
            </button>
          </div>
        </div>
      )}

      {/* Liste déclarations */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          Aucune déclaration de conflit d'intérêts enregistrée.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const cfg = CONFLIT_CFG[item.statut] || CONFLIT_CFG["déclaré"];
            const StatutIcon = cfg.icon;
            const next = CONFLIT_NEXT[item.statut];
            return (
              <div key={item.id} className="bg-background border border-border rounded-2xl px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                    <StatutIcon className={`w-4 h-4 ${cfg.iconCl}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-foreground">{item.declarant}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date_declaration + "T00:00:00").toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.objet}</p>
                    {item.mesures && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        <span className="font-semibold">Mesures :</span> {item.mesures}
                      </p>
                    )}
                    {item.date_resolution && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Résolu le {new Date(item.date_resolution + "T00:00:00").toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {next && (
                      <button
                        onClick={() => advanceStatut(item)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium whitespace-nowrap">
                        → {CONFLIT_CFG[next].label}
                      </button>
                    )}
                    <button
                      onClick={() => setForm({ ...item, date_resolution: item.date_resolution || "" })}
                      title="Modifier"
                      className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

// ── Export principal ──────────────────────────────────────────────────────
export default function RegistreLegalSection() {
  const [activeTab, setActiveTab] = useState("documents");

  const TABS = [
    { key: "documents", label: "Documents légaux",     icon: FileText },
    { key: "conflits",  label: "Conflits d'intérêts",  icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg">Registre légal</h2>
          <p className="text-xs text-muted-foreground">
            Documents constitutifs, RGPD et déclarations de conflits d'intérêts
          </p>
        </div>
      </div>

      {/* Onglets */}
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

      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "conflits"  && <ConflitsTab />}
    </div>
  );
}
