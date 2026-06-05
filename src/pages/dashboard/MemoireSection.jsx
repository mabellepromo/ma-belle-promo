import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useLocalAuth } from "../../lib/LocalAuth";
import {
  BookOpen, ClipboardList, Search, Edit2, Trash2, History, X, Plus,
  CheckCircle2, Circle, FileText, Tag, FileDown, Lock, Check, RotateCcw, PenTool,
} from "lucide-react";
import {
  useProcedures, usePassationModeles, usePassations,
} from "../../hooks/useMemoire";
import { FormPanel, Field, SectionLoader, inp, ta, sel } from "./shared.jsx";
import RichEditor from "../../components/RichEditor";
import { genererPVPassation } from "../../lib/documentGenerators";

/* Normalise un item de modèle : ancien format (string) → { categorie, libelle } */
function normalizeModeleTache(t) {
  if (typeof t === "string") return { categorie: "Divers", libelle: t };
  return { categorie: t.categorie || "Divers", libelle: t.libelle || "" };
}

/* Sérialise les tâches d'un modèle en texte éditable avec en-têtes « # Catégorie » */
function modeleTachesToText(taches) {
  const groupes = [];
  const map = {};
  (taches || []).map(normalizeModeleTache).forEach((t) => {
    if (!map[t.categorie]) { map[t.categorie] = []; groupes.push(t.categorie); }
    map[t.categorie].push(t.libelle);
  });
  return groupes.map((cat) => `# ${cat}\n${map[cat].join("\n")}`).join("\n\n");
}

/* Parse le texte (avec en-têtes « # Catégorie ») en [{ categorie, libelle }] */
function textToModeleTaches(text) {
  let cat = "Divers";
  const out = [];
  (text || "").split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("#")) { cat = line.replace(/^#+/, "").trim() || "Divers"; return; }
    out.push({ categorie: cat, libelle: line });
  });
  return out;
}

/* Regroupe les tâches d'une passation par catégorie, en gardant l'index d'origine */
function groupTaches(taches) {
  const ordre = [];
  const map = {};
  (taches || []).forEach((t, i) => {
    const cat = t.categorie || "Divers";
    if (!map[cat]) { map[cat] = []; ordre.push(cat); }
    map[cat].push({ ...t, _i: i });
  });
  return ordre.map((cat) => ({ cat, items: map[cat] }));
}

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}
function formatDateTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

/* ════════════════════ Onglet Procédures ════════════════════ */
function ProceduresTab({ assemblees, session }) {
  const { items, add, update, remove, fetchVersions, loading } = useProcedures();
  const [form, setForm]       = useState(null);
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("Toutes");
  const [viewing, setViewing] = useState(null);
  const [versions, setVersions] = useState(null);

  const empty = { titre: "", categorie: "", tags: "", contenu: "", assemblee_id: "" };
  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(items.map(p => p.categorie).filter(Boolean)))],
    [items]
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(p => {
      const matchSearch = !search
        || [p.titre, p.categorie, (p.tags || []).join(" "), p.contenu].join(" ").toLowerCase().includes(s);
      const matchCat = cat === "Toutes" || p.categorie === cat;
      return matchSearch && matchCat;
    });
  }, [items, search, cat]);

  async function doSave() {
    if (!form.titre) { toast.error("Titre obligatoire"); return; }
    const payload = {
      titre: form.titre,
      categorie: form.categorie || null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      contenu: form.contenu,
      assemblee_id: form.assemblee_id || null,
      auteur: session?.nom || session?.email || "Bureau",
    };
    if (form._editing) await update(form._editing, payload);
    else await add(payload);
    setForm(null);
  }

  async function openVersions(p) {
    setViewing(p);
    setVersions(null);
    const v = await fetchVersions(p.id);
    setVersions(v);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className={inp + " pl-9"} placeholder="Rechercher une procédure…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={sel + " max-w-[160px]"} value={cat} onChange={e => setCat(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setForm({ ...empty })}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Nouvelle procédure
        </button>
      </div>

      {form && (
        <FormPanel title={form._editing ? "Modifier la procédure" : "Nouvelle procédure"} onClose={() => setForm(null)} onSave={doSave}>
          <Field label="Titre" required>
            <input className={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Comment organiser un webinaire" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Catégorie">
              <input className={inp} value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} placeholder="Événementiel, Comptabilité…" />
            </Field>
            <Field label="Tags (séparés par des virgules)">
              <input className={inp} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="webinaire, zoom, mentor" />
            </Field>
          </div>
          <Field label="Décision liée (Assemblée) — optionnel">
            <select className={sel} value={form.assemblee_id} onChange={e => setForm(p => ({ ...p, assemblee_id: e.target.value }))}>
              <option value="">Aucune</option>
              {assemblees.map(a => <option key={a.id} value={a.id}>{a.titre} ({formatDate(a.date)})</option>)}
            </select>
          </Field>
          <Field label="Contenu">
            <RichEditor value={form.contenu} onChange={html => setForm(p => ({ ...p, contenu: html }))} />
          </Field>
        </FormPanel>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune procédure documentée. Commencez par capitaliser un savoir-faire récurrent.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border rounded-2xl p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{p.titre}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {p.categorie && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p.categorie}</span>}
                  {(p.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/8 text-primary flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{t}</span>)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Maj {formatDate(p.updated_at)}{p.auteur ? ` · ${p.auteur}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/60 flex-wrap">
              <button onClick={() => setViewing({ ...p, _read: true })}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                <BookOpen className="w-3.5 h-3.5" /> Lire
              </button>
              <button onClick={() => openVersions(p)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                <History className="w-3.5 h-3.5" /> Historique
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => setForm({ id: p.id, _editing: p.id, titre: p.titre, categorie: p.categorie || "", tags: (p.tags || []).join(", "), contenu: p.contenu || "", assemblee_id: p.assemblee_id || "" })}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>
                <button onClick={() => remove(p.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/15 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lecture d'une procédure */}
      {viewing?._read && (
        <Modal title={viewing.titre} onClose={() => setViewing(null)}>
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: viewing.contenu || "<p class='text-muted-foreground'>Aucun contenu.</p>" }} />
        </Modal>
      )}

      {/* Historique des versions */}
      {viewing && !viewing._read && (
        <Modal title={`Historique — ${viewing.titre}`} onClose={() => { setViewing(null); setVersions(null); }}>
          {versions === null ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune version antérieure — cette procédure n'a pas encore été modifiée.</p>
          ) : (
            <div className="space-y-3">
              {versions.map(v => (
                <details key={v.id} className="border border-border rounded-xl p-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Version du {formatDateTime(v.modifie_le)}{v.auteur ? ` · ${v.auteur}` : ""}
                  </summary>
                  <div className="prose prose-sm max-w-none text-muted-foreground mt-2 pt-2 border-t border-border/50"
                    dangerouslySetInnerHTML={{ __html: v.contenu || "<em>vide</em>" }} />
                </details>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════ Onglet Passation ════════════════════ */
function PassationTab({ members, session }) {
  const modeles = usePassationModeles();
  const passations = usePassations();
  const [modeleForm, setModeleForm] = useState(null);
  const [instForm, setInstForm]     = useState(null);
  // Brouillons de notes par item, clé `${passationId}:${index}` (évite un write par frappe)
  const [notesDraft, setNotesDraft] = useState({});
  // Ajout d'un item custom : { paId, categorie, libelle }
  const [addItem, setAddItem]       = useState(null);
  // Édition du libellé d'un item : { paId, idx, libelle }
  const [editItem, setEditItem]     = useState(null);

  /* — Modèles — */
  async function saveModele() {
    if (!modeleForm.titre) { toast.error("Titre obligatoire"); return; }
    const taches = textToModeleTaches(modeleForm.tachesText);
    const payload = { titre: modeleForm.titre, description: modeleForm.description || null, taches };
    if (modeleForm._editing) await modeles.update(modeleForm._editing, payload);
    else await modeles.add(payload);
    setModeleForm(null);
  }

  /* — Instances — */
  async function saveInstance() {
    if (!instForm.titre) { toast.error("Titre obligatoire"); return; }
    let taches = instForm.taches;
    // À la création depuis un modèle : on copie ses items en items de passation enrichis
    if (!instForm._editing && instForm.modele_id) {
      const m = modeles.items.find(x => x.id === instForm.modele_id);
      taches = (m?.taches || []).map(normalizeModeleTache).map(({ categorie, libelle }) => ({
        categorie, libelle, responsable: "", fait: false, date_fait: null, notes: "",
      }));
    }
    const payload = {
      titre: instForm.titre,
      date_passation: instForm.date_passation || null,
      date_cloture: instForm.date_cloture || null,
      bureau_sortant: instForm.bureau_sortant || null,
      bureau_entrant: instForm.bureau_entrant || null,
      modele_id: instForm.modele_id || null,
      taches: taches || [],
      notes: instForm.notes || null,
    };
    if (instForm._editing) await passations.update(instForm._editing, payload);
    else await passations.add(payload);
    setInstForm(null);
  }

  /* — Mutations d'items (sur le tableau jsonb) — */
  function mutateTaches(pa, idx, patch) {
    const taches = (pa.taches || []).map((t, i) => (i === idx ? { ...t, ...patch } : t));
    return passations.update(pa.id, { taches });
  }
  function toggleTache(pa, idx) {
    const cur = pa.taches[idx];
    return mutateTaches(pa, idx, { fait: !cur.fait, date_fait: !cur.fait ? new Date().toISOString() : null });
  }
  function setResponsable(pa, idx, nom) {
    return mutateTaches(pa, idx, { responsable: nom });
  }
  function commitNotes(pa, idx) {
    const key = `${pa.id}:${idx}`;
    const val = notesDraft[key];
    if (val === undefined || val === (pa.taches[idx].notes || "")) return;
    setNotesDraft(d => { const n = { ...d }; delete n[key]; return n; });
    return mutateTaches(pa, idx, { notes: val });
  }
  async function removeTache(pa, idx) {
    if (!confirm("Retirer cet élément de la passation ?")) return;
    const taches = (pa.taches || []).filter((_, i) => i !== idx);
    await passations.update(pa.id, { taches });
  }
  async function saveEditItem() {
    const pa = passations.items.find(p => p.id === editItem.paId);
    if (!pa) return;
    if (!editItem.libelle.trim()) { toast.error("Le libellé ne peut pas être vide."); return; }
    await mutateTaches(pa, editItem.idx, { libelle: editItem.libelle.trim() });
    setEditItem(null);
  }
  async function saveAddItem() {
    const pa = passations.items.find(p => p.id === addItem.paId);
    if (!pa) return;
    if (!addItem.libelle.trim()) { toast.error("Le libellé est obligatoire."); return; }
    const taches = [...(pa.taches || []), {
      categorie: addItem.categorie.trim() || "Divers",
      libelle: addItem.libelle.trim(), responsable: "", fait: false, date_fait: null, notes: "",
    }];
    await passations.update(pa.id, { taches });
    setAddItem(null);
  }
  function toggleCloture(pa) {
    const cloturee = pa.statut === "cloturee";
    return passations.update(pa.id, {
      statut: cloturee ? "en_cours" : "cloturee",
      date_cloture: cloturee ? null : new Date().toISOString().slice(0, 10),
    });
  }

  // Crée un suivi de signature du PV dans le module Signatures (DocuSeal Cloud)
  async function envoyerEnSignature(pa) {
    const titre = `PV de passation — ${pa.titre}`;
    const { data: existing } = await supabase
      .from("signatures").select("id").eq("document_titre", titre).limit(1);
    if (existing?.length && !confirm("Un suivi de signature existe déjà pour ce PV. En créer un nouveau ?")) return;
    const signataires = [
      { name: pa.bureau_sortant ? `Président(e) sortant(e) — ${pa.bureau_sortant}` : "Président(e) sortant(e)", email: "" },
      { name: pa.bureau_entrant ? `Président(e) entrant(e) — ${pa.bureau_entrant}` : "Président(e) entrant(e)", email: "" },
    ];
    const { error } = await supabase.from("signatures").insert({
      document_titre: titre,
      type: "PV de Passation",
      signataires,
      statut: "brouillon",
      created_by: session?.email || null,
    });
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Suivi créé dans le module Signatures. Générez le PV PDF, faites-le signer sur DocuSeal, puis consignez le lien.");
  }

  // Catégories connues (modèles + passations) pour le datalist d'ajout d'item
  const categoriesConnues = useMemo(() => {
    const s = new Set();
    modeles.items.forEach(m => (m.taches || []).map(normalizeModeleTache).forEach(t => s.add(t.categorie)));
    passations.items.forEach(p => (p.taches || []).forEach(t => t.categorie && s.add(t.categorie)));
    return Array.from(s);
  }, [modeles.items, passations.items]);

  return (
    <div className="space-y-10">
      {/* ─── Modèles réutilisables ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Modèles de passation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Listes d'items types, organisées par catégorie, réutilisables à chaque changement de bureau.</p>
          </div>
          <button onClick={() => setModeleForm({ titre: "", description: "", tachesText: "" })}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90">
            <Plus className="w-4 h-4" /> Modèle
          </button>
        </div>

        {modeleForm && (
          <FormPanel title={modeleForm._editing ? "Modifier le modèle" : "Nouveau modèle"} onClose={() => setModeleForm(null)} onSave={saveModele}>
            <Field label="Titre" required>
              <input className={inp} value={modeleForm.titre} onChange={e => setModeleForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Passation Trésorier" />
            </Field>
            <Field label="Description">
              <input className={inp} value={modeleForm.description} onChange={e => setModeleForm(p => ({ ...p, description: e.target.value }))} />
            </Field>
            <Field label="Items — une ligne par item, « # Catégorie » pour démarrer une catégorie">
              <textarea className={ta} rows={10} value={modeleForm.tachesText} onChange={e => setModeleForm(p => ({ ...p, tachesText: e.target.value }))}
                placeholder={"# Finances\nRemettre les accès bancaires\nFaire le point sur les cotisations\n\n# Documents légaux\nTransmettre les statuts"} />
            </Field>
          </FormPanel>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeles.items.map(m => {
            const groupes = groupTaches((m.taches || []).map(normalizeModeleTache));
            const nbItems = (m.taches || []).length;
            return (
              <div key={m.id} className="bg-background border border-border rounded-2xl p-4">
                <p className="font-bold text-foreground text-sm">{m.titre}</p>
                {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                <p className="text-[11px] text-primary font-semibold mt-1">{nbItems} item{nbItems > 1 ? "s" : ""} · {groupes.length} catégorie{groupes.length > 1 ? "s" : ""}</p>
                <div className="mt-2 space-y-2">
                  {groupes.map(g => (
                    <div key={g.cat}>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/70">{g.cat}</p>
                      <ul className="mt-0.5 space-y-0.5">
                        {g.items.map((t, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><Circle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {t.libelle}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-1.5 pt-2 mt-2 border-t border-border/60">
                  <button onClick={() => setModeleForm({ _editing: m.id, titre: m.titre, description: m.description || "", tachesText: modeleTachesToText(m.taches) })}
                    className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-primary/8"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => modeles.remove(m.id)}
                    className="text-xs text-muted-foreground hover:text-red-500 px-2 py-1 rounded hover:bg-red-500/15"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
          {modeles.items.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Aucun modèle. Créez-en un pour standardiser vos passations.</p>}
        </div>
      </div>

      {/* ─── Passations ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Passations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Suivi de complétion d'un changement de bureau, par catégorie.</p>
          </div>
          <button onClick={() => setInstForm({ titre: "", date_passation: new Date().toISOString().slice(0, 10), date_cloture: "", bureau_sortant: "", bureau_entrant: "", modele_id: "", notes: "", taches: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90">
            <Plus className="w-4 h-4" /> Passation
          </button>
        </div>

        {/* Avertissement sécurité */}
        <div className="flex items-start gap-2.5 mb-5 p-3.5 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>Ne stockez ici aucun mot de passe ni identifiant.</strong> Les items « accès » servent uniquement à
            <em> cocher</em> que la remise des identifiants a bien eu lieu (de la main à la main). Les notes restent visibles par tout le bureau.
          </p>
        </div>

        {instForm && (
          <FormPanel title={instForm._editing ? "Modifier la passation" : "Nouvelle passation"} onClose={() => setInstForm(null)} onSave={saveInstance}>
            <Field label="Titre" required>
              <input className={inp} value={instForm.titre} onChange={e => setInstForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Passation Bureau 2026 → 2028" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bureau sortant">
                <input className={inp} value={instForm.bureau_sortant} onChange={e => setInstForm(p => ({ ...p, bureau_sortant: e.target.value }))} placeholder="Ex : Bureau 2022–2026" />
              </Field>
              <Field label="Bureau entrant">
                <input className={inp} value={instForm.bureau_entrant} onChange={e => setInstForm(p => ({ ...p, bureau_entrant: e.target.value }))} placeholder="Ex : Bureau 2026–2030" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date de début">
                <input type="date" className={inp} value={instForm.date_passation || ""} onChange={e => setInstForm(p => ({ ...p, date_passation: e.target.value }))} />
              </Field>
              {!instForm._editing ? (
                <Field label="Basé sur un modèle">
                  <select className={sel} value={instForm.modele_id} onChange={e => setInstForm(p => ({ ...p, modele_id: e.target.value }))}>
                    <option value="">Aucun (vide)</option>
                    {modeles.items.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label="Date de clôture">
                  <input type="date" className={inp} value={instForm.date_cloture || ""} onChange={e => setInstForm(p => ({ ...p, date_cloture: e.target.value }))} />
                </Field>
              )}
            </div>
            <Field label="Notes générales">
              <textarea className={ta} rows={2} value={instForm.notes} onChange={e => setInstForm(p => ({ ...p, notes: e.target.value }))} />
            </Field>
          </FormPanel>
        )}

        <div className="space-y-4">
          {passations.items.map(pa => {
            const taches = pa.taches || [];
            const total = taches.length;
            const done  = taches.filter(t => t.fait).length;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            const cloturee = pa.statut === "cloturee";
            const groupes = groupTaches(taches);
            return (
              <div key={pa.id} className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{pa.titre}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cloturee ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
                        {cloturee ? "Clôturée" : "En cours"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(pa.bureau_sortant || pa.bureau_entrant) && <span>{pa.bureau_sortant || "?"} → {pa.bureau_entrant || "?"} · </span>}
                      {formatDate(pa.date_passation)}{pa.date_cloture ? ` → ${formatDate(pa.date_cloture)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-primary mr-1">{done}/{total} · {pct}%</span>
                    <button onClick={() => genererPVPassation(pa)} title="Générer le PV de passation (PDF)"
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/8">
                      <FileDown className="w-3.5 h-3.5" /> PV PDF
                    </button>
                    <button onClick={() => envoyerEnSignature(pa)} title="Créer un suivi de signature du PV dans le module Signatures"
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/8">
                      <PenTool className="w-3.5 h-3.5" /> Signer
                    </button>
                    <button onClick={() => toggleCloture(pa)} title={cloturee ? "Rouvrir" : "Clôturer"}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10">
                      {cloturee ? <><RotateCcw className="w-3.5 h-3.5" /> Rouvrir</> : <><Check className="w-3.5 h-3.5" /> Clôturer</>}
                    </button>
                    <button onClick={() => setInstForm({ _editing: pa.id, titre: pa.titre, date_passation: pa.date_passation || "", date_cloture: pa.date_cloture || "", bureau_sortant: pa.bureau_sortant || "", bureau_entrant: pa.bureau_entrant || "", notes: pa.notes || "", modele_id: "", taches: pa.taches })}
                      className="text-xs text-muted-foreground hover:text-primary px-2 py-1.5 rounded hover:bg-primary/8"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => passations.remove(pa.id)}
                      className="text-xs text-muted-foreground hover:text-red-500 px-2 py-1.5 rounded hover:bg-red-500/15"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Progression globale */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden my-3">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>

                {/* Items groupés par catégorie */}
                <div className="space-y-4">
                  {groupes.map(g => {
                    const gDone = g.items.filter(t => t.fait).length;
                    const gPct  = g.items.length > 0 ? Math.round((gDone / g.items.length) * 100) : 0;
                    return (
                      <div key={g.cat}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-xs font-bold uppercase tracking-wide text-foreground/70">{g.cat}</p>
                          <span className="text-[11px] text-muted-foreground">{gDone}/{g.items.length}</span>
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${gPct}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {g.items.map(t => {
                            const key = `${pa.id}:${t._i}`;
                            const isEditing = editItem && editItem.paId === pa.id && editItem.idx === t._i;
                            return (
                              <div key={t._i} className="flex items-start gap-2 text-sm group">
                                <button onClick={() => toggleTache(pa, t._i)} className="flex-shrink-0 mt-0.5">
                                  {t.fait ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  {isEditing ? (
                                    <div className="flex items-center gap-1.5">
                                      <input autoFocus className={inp + " h-7 text-xs"} value={editItem.libelle}
                                        onChange={e => setEditItem(p => ({ ...p, libelle: e.target.value }))}
                                        onKeyDown={e => { if (e.key === "Enter") saveEditItem(); if (e.key === "Escape") setEditItem(null); }} />
                                      <button onClick={saveEditItem} className="text-emerald-600 px-1"><Check className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => setEditItem(null)} className="text-muted-foreground px-1"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`${t.fait ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.libelle}</span>
                                      {t.fait && t.date_fait && <span className="text-[10px] text-muted-foreground">· {formatDate(t.date_fait)}</span>}
                                      <button onClick={() => setEditItem({ paId: pa.id, idx: t._i, libelle: t.libelle })}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"><Edit2 className="w-3 h-3" /></button>
                                      <button onClick={() => removeTache(pa, t._i)}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  )}
                                  {/* Notes par item */}
                                  <input className="mt-1 w-full h-7 px-2 rounded-md border border-border/60 bg-background text-xs text-muted-foreground"
                                    placeholder="Note (ex : transmis à…, en attente…)"
                                    value={notesDraft[key] ?? t.notes ?? ""}
                                    onChange={e => setNotesDraft(d => ({ ...d, [key]: e.target.value }))}
                                    onBlur={() => commitNotes(pa, t._i)} />
                                </div>
                                {/* Responsable */}
                                <select className="h-7 px-2 rounded-md border border-border bg-background text-xs text-muted-foreground flex-shrink-0 max-w-[130px]"
                                  value={t.responsable || ""} onChange={e => setResponsable(pa, t._i, e.target.value)}>
                                  <option value="">— Responsable</option>
                                  {members.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {total === 0 && <p className="text-xs text-muted-foreground">Aucun item. Ajoutez-en un ou créez la passation depuis un modèle.</p>}
                </div>

                {/* Ajout d'un item custom */}
                {addItem && addItem.paId === pa.id ? (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60 flex-wrap">
                    <input className={inp + " h-8 text-xs max-w-[180px]"} list="passation-cats" placeholder="Catégorie"
                      value={addItem.categorie} onChange={e => setAddItem(p => ({ ...p, categorie: e.target.value }))} />
                    <input className={inp + " h-8 text-xs flex-1 min-w-[160px]"} autoFocus placeholder="Libellé de l'item"
                      value={addItem.libelle} onChange={e => setAddItem(p => ({ ...p, libelle: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") saveAddItem(); if (e.key === "Escape") setAddItem(null); }} />
                    <button onClick={saveAddItem} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90">Ajouter</button>
                    <button onClick={() => setAddItem(null)} className="text-xs text-muted-foreground px-2 py-1.5 hover:text-foreground">Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => setAddItem({ paId: pa.id, categorie: "", libelle: "" })}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary mt-3 pt-3 border-t border-border/60 w-full">
                    <Plus className="w-3.5 h-3.5" /> Ajouter un item
                  </button>
                )}

                {pa.notes && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">{pa.notes}</p>}
              </div>
            );
          })}
          {passations.items.length === 0 && <p className="text-sm text-muted-foreground">Aucune passation en cours.</p>}
        </div>

        <datalist id="passation-cats">
          {categoriesConnues.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>
    </div>
  );
}

/* ── Petit modal réutilisable ── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-heading font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

/* ════════════════════ Section principale ════════════════════ */
export default function MemoireSection() {
  const { session } = useLocalAuth();
  const [tab, setTab] = useState("procedures");
  const [assemblees, setAssemblees] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    supabase.from("assemblees").select("id, titre, date").order("date", { ascending: false })
      .then(({ data }) => setAssemblees(data ?? []));
    supabase.from("members").select("id, nom").eq("status", "validated").order("nom")
      .then(({ data }) => setMembers(data ?? []));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Mémoire & Passation</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Savoir-faire procédural interne et transmission entre bureaux — distinct des ressources documentaires téléchargeables.
        </p>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-max mb-6">
        {[
          { id: "procedures", label: "Procédures", icon: BookOpen },
          { id: "passation",  label: "Passation",  icon: ClipboardList },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "procedures" && <ProceduresTab assemblees={assemblees} session={session} />}
      {tab === "passation"  && <PassationTab members={members} session={session} />}
    </div>
  );
}
