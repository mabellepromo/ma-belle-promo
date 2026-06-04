import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useLocalAuth } from "../../lib/LocalAuth";
import {
  BookOpen, ClipboardList, Search, Edit2, Trash2, History, X, Plus,
  CheckCircle2, Circle, FileText, Tag,
} from "lucide-react";
import {
  useProcedures, usePassationModeles, usePassations,
} from "../../hooks/useMemoire";
import { FormPanel, Field, SectionLoader, inp, ta, sel } from "./shared.jsx";
import RichEditor from "../../components/RichEditor";

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
function PassationTab({ members }) {
  const modeles = usePassationModeles();
  const passations = usePassations();
  const [modeleForm, setModeleForm] = useState(null);
  const [instForm, setInstForm]     = useState(null);

  const memberName = useCallback(
    (id) => members.find(m => String(m.id) === String(id))?.nom || "",
    [members]
  );

  /* — Modèles — */
  async function saveModele() {
    if (!modeleForm.titre) { toast.error("Titre obligatoire"); return; }
    const taches = (modeleForm.tachesText || "").split("\n").map(t => t.trim()).filter(Boolean);
    const payload = { titre: modeleForm.titre, description: modeleForm.description || null, taches };
    if (modeleForm._editing) await modeles.update(modeleForm._editing, payload);
    else await modeles.add(payload);
    setModeleForm(null);
  }

  /* — Instances — */
  async function saveInstance() {
    if (!instForm.titre) { toast.error("Titre obligatoire"); return; }
    let taches = instForm.taches;
    // Si un modèle est choisi à la création, on copie ses tâches
    if (!instForm._editing && instForm.modele_id) {
      const m = modeles.items.find(x => x.id === instForm.modele_id);
      taches = (m?.taches || []).map(libelle => ({ libelle, assignee_member_id: "", assignee_nom: "", fait: false, fait_le: null }));
    }
    const payload = {
      titre: instForm.titre,
      date_passation: instForm.date_passation || null,
      modele_id: instForm.modele_id || null,
      taches: taches || [],
      notes: instForm.notes || null,
    };
    if (instForm._editing) await passations.update(instForm._editing, payload);
    else await passations.add(payload);
    setInstForm(null);
  }

  // Coche/décoche une tâche d'une passation existante
  async function toggleTache(passation, idx) {
    const taches = passation.taches.map((t, i) =>
      i === idx ? { ...t, fait: !t.fait, fait_le: !t.fait ? new Date().toISOString() : null } : t
    );
    await passations.update(passation.id, { taches });
  }
  async function assignTache(passation, idx, memberId) {
    const taches = passation.taches.map((t, i) =>
      i === idx ? { ...t, assignee_member_id: memberId, assignee_nom: memberName(memberId) } : t
    );
    await passations.update(passation.id, { taches });
  }

  return (
    <div className="space-y-10">
      {/* ─── Modèles réutilisables ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Modèles de passation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Listes de tâches types, réutilisables à chaque changement de bureau.</p>
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
            <Field label="Tâches (une par ligne)">
              <textarea className={ta} rows={6} value={modeleForm.tachesText} onChange={e => setModeleForm(p => ({ ...p, tachesText: e.target.value }))}
                placeholder={"Remettre les accès bancaires\nTransmettre les statuts\nFaire le point sur les cotisations en cours"} />
            </Field>
          </FormPanel>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeles.items.map(m => (
            <div key={m.id} className="bg-background border border-border rounded-2xl p-4">
              <p className="font-bold text-foreground text-sm">{m.titre}</p>
              {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
              <ul className="mt-2 space-y-1">
                {(m.taches || []).map((t, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><Circle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {t}</li>)}
              </ul>
              <div className="flex justify-end gap-1.5 pt-2 mt-2 border-t border-border/60">
                <button onClick={() => setModeleForm({ _editing: m.id, titre: m.titre, description: m.description || "", tachesText: (m.taches || []).join("\n") })}
                  className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-primary/8"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => modeles.remove(m.id)}
                  className="text-xs text-muted-foreground hover:text-red-500 px-2 py-1 rounded hover:bg-red-500/15"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {modeles.items.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Aucun modèle. Créez-en un pour standardiser vos passations.</p>}
        </div>
      </div>

      {/* ─── Passations en cours ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Passations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Suivi de complétion d'un changement de bureau.</p>
          </div>
          <button onClick={() => setInstForm({ titre: "", date_passation: new Date().toISOString().slice(0, 10), modele_id: "", notes: "", taches: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90">
            <Plus className="w-4 h-4" /> Passation
          </button>
        </div>

        {instForm && (
          <FormPanel title={instForm._editing ? "Modifier la passation" : "Nouvelle passation"} onClose={() => setInstForm(null)} onSave={saveInstance}>
            <Field label="Titre" required>
              <input className={inp} value={instForm.titre} onChange={e => setInstForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Passation Bureau 2026 → 2028" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <input type="date" className={inp} value={instForm.date_passation || ""} onChange={e => setInstForm(p => ({ ...p, date_passation: e.target.value }))} />
              </Field>
              {!instForm._editing && (
                <Field label="Basé sur un modèle">
                  <select className={sel} value={instForm.modele_id} onChange={e => setInstForm(p => ({ ...p, modele_id: e.target.value }))}>
                    <option value="">Aucun (vide)</option>
                    {modeles.items.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <Field label="Notes">
              <textarea className={ta} rows={2} value={instForm.notes} onChange={e => setInstForm(p => ({ ...p, notes: e.target.value }))} />
            </Field>
          </FormPanel>
        )}

        <div className="space-y-4">
          {passations.items.map(pa => {
            const total = (pa.taches || []).length;
            const done  = (pa.taches || []).filter(t => t.fait).length;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={pa.id} className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">{pa.titre}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(pa.date_passation)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{done}/{total} · {pct}%</span>
                    <button onClick={() => setInstForm({ _editing: pa.id, titre: pa.titre, date_passation: pa.date_passation || "", notes: pa.notes || "", modele_id: "", taches: pa.taches })}
                      className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-primary/8"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => passations.remove(pa.id)}
                      className="text-xs text-muted-foreground hover:text-red-500 px-2 py-1 rounded hover:bg-red-500/15"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden my-3">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="space-y-1.5">
                  {(pa.taches || []).map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <button onClick={() => toggleTache(pa, i)} className="flex-shrink-0">
                        {t.fait ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <span className={`flex-1 ${t.fait ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.libelle}</span>
                      <select className="h-7 px-2 rounded-md border border-border bg-background text-xs text-muted-foreground"
                        value={t.assignee_member_id || ""} onChange={e => assignTache(pa, i, e.target.value)}>
                        <option value="">— Assigner</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                      </select>
                    </div>
                  ))}
                  {total === 0 && <p className="text-xs text-muted-foreground">Aucune tâche. Modifiez la passation pour en ajouter via un modèle.</p>}
                </div>
                {pa.notes && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">{pa.notes}</p>}
              </div>
            );
          })}
          {passations.items.length === 0 && <p className="text-sm text-muted-foreground">Aucune passation en cours.</p>}
        </div>
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
      {tab === "passation"  && <PassationTab members={members} />}
    </div>
  );
}
