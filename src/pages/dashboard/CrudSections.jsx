import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";

const RichEditor = lazy(() => import("../../components/RichEditor.jsx"));
import { useArticles } from "../../hooks/useArticles";
import { useEvenements } from "../../hooks/useEvenements";
import { useProjets } from "../../hooks/useProjets";
import { useEquipe } from "../../hooks/useEquipe";
import { useCommuniques } from "../../hooks/useCommuniques";
import { useDocuments } from "../../hooks/useDocuments";
import { useRessources } from "../../hooks/useRessources";
import { useGaleries } from "../../hooks/useGaleries";
import { useMediaVideos } from "../../hooks/useMediaVideos";
import { useMediaPhotos } from "../../hooks/useMediaPhotos";
import { useProgrammes } from "../../hooks/useProgrammes";
import { useSponsors } from "../../hooks/useSponsors";
import { articles as articlesStatic } from "../../data/articles.js";
import { slugify } from "../../lib/localStore";
import { Globe, BookOpen, Images, Link2, Edit2, Trash2, Plus } from "lucide-react";
import {
  inp, ta, sel,
  Field, ImgField, GalerieField, VideoField, FileField,
  SectionLoader, CrudHeader, FormPanel, ItemRow,
} from "./shared.jsx";

/* ─── Articles ─── */
export function ArticlesSection() {
  const { articles: items, add, update, remove, loading, isSeeded, seedFromStatic } = useArticles();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { id: "", titre: "", extrait: "", date: "", categorie: "Événement", image: "", photo_position: "center", videos: [], contenu: "", photos: [] };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Webinaire", "Conférence", "Gala", "Solidarité", "Événement", "Juridique"];

  async function doSave() {
    if (!form.titre || !form.extrait || !form.date) { toast.error("Titre, extrait et date obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm(`Importer les ${articlesStatic.length} articles statiques dans Supabase ? Les articles existants avec le même ID seront mis à jour.`)) return;
    setSeeding(true);
    await seedFromStatic();
    setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Articles & Actualités</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} élément{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isSeeded && (
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-60">
              {seeding
                ? <><div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Migration…</>
                : <>☁️ Migrer les données initiales</>}
            </button>
          )}
          <button onClick={() => setForm({ ...empty })}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>
      {form && (
        <FormPanel title={form._editing ? "Modifier l'article" : "Nouvel article"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Date" required><input className={inp} placeholder="ex: 15 Jan 2025" value={form.date} onChange={f("date")} /></Field>
            <Field label="Catégorie"><select className={sel} value={form.categorie} onChange={f("categorie")}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Extrait" required><textarea className={ta} rows={2} value={form.extrait} onChange={f("extrait")} /></Field></div>
            <div className="md:col-span-2"><ImgField label="Image de couverture" value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} /></div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary"
                  checked={form.photo_position === "top"}
                  onChange={e => setForm(p => ({ ...p, photo_position: e.target.checked ? "top" : "center" }))} />
                <span className="text-sm text-foreground">Photo portrait — cadrer depuis le haut (pour ne pas couper les têtes)</span>
              </label>
            </div>
            <div className="md:col-span-2"><GalerieField photos={form.photos || []} onChange={v => setForm(p => ({ ...p, photos: v }))} /></div>
            <div className="md:col-span-2"><VideoField videos={Array.isArray(form.videos) ? form.videos : (form.youtube ? [form.youtube] : [])} onChange={v => setForm(p => ({ ...p, videos: v, youtube: "" }))} /></div>
            <div className="md:col-span-2">
              <Field label="Contenu" required>
                <Suspense fallback={<div className="min-h-[180px] flex items-center justify-center text-xs text-muted-foreground">Chargement éditeur…</div>}>
                  <RichEditor value={form.contenu || ""} onChange={v => setForm(p => ({ ...p, contenu: v }))} />
                </Suspense>
              </Field>
            </div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun article.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(a => (
          <ItemRow key={a.id} img={a.image} title={a.titre} subtitle={`${a.date} · ${a.categorie}`}
            extraLink={`/actualites/${a.id}`}
            onEdit={() => setForm({ ...a, _editing: a.id })}
            onDelete={() => remove(a.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Événements ─── */
export function EvenementsSection() {
  const { evenements: items, add, update, remove, loading, isSeeded, seedFromStatic } = useEvenements();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { titre: "", date: "", heures: "", lieu: "", type: "Conférence", statut: "À venir", description: "", image: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const TYPES = ["Webinaire", "Conférence", "Gala", "Projet éditorial", "Autre"];
  const STATUTS = ["À venir", "En cours", "Passé"];

  async function doSave() {
    if (!form.titre || !form.date || !form.lieu) { toast.error("Titre, date et lieu obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les événements statiques dans Supabase ?")) return;
    setSeeding(true);
    await seedFromStatic();
    setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Événements" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier l'événement" : "Nouvel événement"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Date" required><input className={inp} placeholder="ex: 18 Novembre 2025" value={form.date} onChange={f("date")} /></Field>
            <Field label="Heure"><input className={inp} placeholder="ex: 18h00" value={form.heures} onChange={f("heures")} /></Field>
            <Field label="Lieu" required><input className={inp} value={form.lieu} onChange={f("lieu")} /></Field>
            <Field label="Type"><select className={sel} value={form.type} onChange={f("type")}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Statut"><select className={sel} value={form.statut} onChange={f("statut")}>{STATUTS.map(s => <option key={s}>{s}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Description" required><textarea className={ta} rows={3} value={form.description} onChange={f("description")} /></Field></div>
            <div className="md:col-span-2"><ImgField label="Image" value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} /></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun événement.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(e => (
          <ItemRow key={e.id} img={e.image} title={e.titre}
            subtitle={`${e.date}${e.heures ? " · " + e.heures : ""} · ${e.lieu}`}
            badge={e.statut}
            badgeColor={e.statut === "À venir" ? "bg-green-100 text-green-700" : e.statut === "En cours" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}
            onEdit={() => setForm({ ...e, _editing: e.id })}
            onDelete={() => remove(e.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Projets ─── */
export function ProjetsSection() {
  const { projets: items, add, update, remove, loading, isSeeded, seedFromStatic } = useProjets();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { id: "", titre: "", extrait: "", description: "", contenu: "", date: "", categorie: "Solidarité", image: "", photo_position: "center", photos: [], videos: [] };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Solidarité", "Éducation", "Santé publique", "Autre"];

  async function doSave() {
    if (!form.titre || !form.description) { toast.error("Titre et description obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les projets statiques dans Supabase ?")) return;
    setSeeding(true);
    await seedFromStatic();
    setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Projets & Réalisations" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le projet" : "Nouveau projet"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Date"><input className={inp} placeholder="ex: Décembre 2024" value={form.date} onChange={f("date")} /></Field>
            <Field label="Catégorie"><select className={sel} value={form.categorie} onChange={f("categorie")}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Extrait (accroche courte)"><textarea className={ta} rows={2} placeholder="1-2 phrases résumant l'action..." value={form.extrait || ""} onChange={f("extrait")} /></Field></div>
            <div className="md:col-span-2"><Field label="Description courte" required><textarea className={ta} rows={3} value={form.description} onChange={f("description")} /></Field></div>
            <div className="md:col-span-2">
              <Field label="Contenu détaillé (page projet)">
                <Suspense fallback={<div className="min-h-[180px] flex items-center justify-center text-xs text-muted-foreground">Chargement éditeur…</div>}>
                  <RichEditor value={form.contenu || ""} onChange={v => setForm(p => ({ ...p, contenu: v }))} />
                </Suspense>
              </Field>
            </div>
            <div className="md:col-span-2"><ImgField label="Image d'accroche" value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} /></div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary"
                  checked={form.photo_position === "top"}
                  onChange={e => setForm(p => ({ ...p, photo_position: e.target.checked ? "top" : "center" }))} />
                <span className="text-sm text-foreground">Photo portrait — cadrer depuis le haut (pour ne pas couper les têtes)</span>
              </label>
            </div>
            <div className="md:col-span-2"><GalerieField photos={form.photos || []} onChange={v => setForm(p => ({ ...p, photos: v }))} /></div>
            <div className="md:col-span-2"><VideoField videos={form.videos || []} onChange={v => setForm(p => ({ ...p, videos: v }))} /></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun projet.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(p => (
          <ItemRow key={p.id} img={p.image} title={p.titre} subtitle={`${p.date} · ${p.categorie}`}
            onEdit={() => setForm({ ...p, photos: p.photos || [], videos: p.videos || [], _editing: p.id })}
            onDelete={() => remove(p.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Programmes ─── */
export function ProgrammesSection() {
  const { programmes: items, add, update, remove, loading, isSeeded, seedFromStatic } = useProgrammes();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { titre: "", description: "", status: "En gestation", lien: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const STATUTS = ["Actif", "En cours", "En gestation", "Terminé"];

  async function doSave() {
    if (!form.titre || !form.description) { toast.error("Titre et description obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les programmes statiques dans Supabase ?")) return;
    setSeeding(true); await seedFromStatic(); setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Programmes" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le programme" : "Nouveau programme"} onClose={() => setForm(null)} onSave={doSave}>
          <Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field>
          <Field label="Statut"><select className={sel} value={form.status} onChange={f("status")}>{STATUTS.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Description" required><textarea className={ta} rows={4} value={form.description} onChange={f("description")} /></Field>
          <Field label="Lien interne (optionnel)"><input className={inp} placeholder="/activites/projets" value={form.lien} onChange={f("lien")} /></Field>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun programme.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(p => (
          <ItemRow key={p.id} title={p.titre} subtitle={p.description.slice(0, 80) + "..."}
            badge={p.status}
            badgeColor={p.status === "Actif" ? "bg-green-100 text-green-700" : p.status === "En cours" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}
            onEdit={() => setForm({ ...p, _editing: p.id })}
            onDelete={() => remove(p.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Équipe ─── */
export function EquipeSection() {
  const { equipe: items, add, update, remove, loading, isSeeded, seedFromStatic } = useEquipe();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { nom: "", role: "", profession: "", email: "", tel: "", photo: "", linkedin: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  async function doSave() {
    if (!form.nom || !form.role) { toast.error("Nom et rôle obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les membres du bureau dans Supabase ?")) return;
    setSeeding(true);
    await seedFromStatic();
    setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Équipe / Bureau exécutif" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le membre" : "Nouveau membre du bureau"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom complet" required><input className={inp} value={form.nom} onChange={f("nom")} /></Field>
            <Field label="Rôle / Fonction" required><input className={inp} placeholder="ex: Présidente" value={form.role} onChange={f("role")} /></Field>
            <div className="md:col-span-2"><Field label="Profession / Description"><textarea className={ta} rows={2} value={form.profession} onChange={f("profession")} /></Field></div>
            <Field label="Email"><input className={inp} type="email" value={form.email} onChange={f("email")} /></Field>
            <Field label="Téléphone"><input className={inp} value={form.tel} onChange={f("tel")} /></Field>
            <div className="md:col-span-2">
              <Field label="LinkedIn">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin || ""} onChange={f("linkedin")} />
                </div>
              </Field>
            </div>
            <div className="md:col-span-2"><ImgField label="Photo" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} /></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun membre dans l'équipe.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(m => (
          <ItemRow key={m.id} img={m.photo} title={m.nom}
            subtitle={`${m.role} · ${m.profession?.slice(0, 60)}${m.profession?.length > 60 ? "..." : ""}`}
            onEdit={() => setForm({ ...m, _editing: m.id })}
            onDelete={() => remove(m.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Sponsors ─── */
export function SponsorsSection() {
  const { items, add, update, remove, loading } = useSponsors();
  const [form, setForm] = useState(null);
  const empty = { nom: "", logo: "", url: "", niveau: "Partenaire Bronze", description: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const NIVEAUX = ["Partenaire Platine", "Partenaire Or", "Partenaire Argent", "Partenaire Bronze"];

  async function doSave() {
    if (!form.nom) { toast.error("Nom obligatoire"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Partenaires" count={items.length} onAdd={() => setForm({ ...empty })} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le partenaire" : "Nouveau partenaire"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom du partenaire" required><input className={inp} value={form.nom} onChange={f("nom")} /></Field>
            <Field label="Niveau"><select className={sel} value={form.niveau} onChange={f("niveau")}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></Field>
            <div className="md:col-span-2"><ImgField label="Logo" value={form.logo} onChange={v => setForm(p => ({ ...p, logo: v }))} /></div>
            <div className="md:col-span-2"><Field label="Site web"><input className={inp} type="url" value={form.url} onChange={f("url")} /></Field></div>
            <div className="md:col-span-2"><Field label="Description"><textarea className={ta} rows={2} value={form.description} onChange={f("description")} /></Field></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun partenaire. Cliquez sur <strong>+ Ajouter</strong> pour en créer un.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(s => (
          <ItemRow key={s.id} img={s.logo} title={s.nom} subtitle={s.niveau}
            extraLink={s.url || undefined}
            onEdit={() => setForm({ ...s, _editing: s.id })}
            onDelete={() => remove(s.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Communiqués ─── */
export function CommuniquesSection() {
  const { communiques: items, add, update, remove, loading, isSeeded, seedFromStatic } = useCommuniques();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { titre: "", date: "", type: "Communiqué", resume: "", url: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const TYPES = ["Communiqué", "Communiqué de presse", "Invitation", "Rapport AG", "Déclaration", "Autre"];

  async function doSave() {
    if (!form.titre || !form.date || !form.resume) { toast.error("Titre, date et résumé obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les communiqués statiques dans Supabase ?")) return;
    setSeeding(true); await seedFromStatic(); setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Communiqués" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le communiqué" : "Nouveau communiqué"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Date" required><input className={inp} placeholder="ex: 15 Jan 2025" value={form.date} onChange={f("date")} /></Field>
            <Field label="Type"><select className={sel} value={form.type} onChange={f("type")}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Résumé" required><textarea className={ta} rows={3} value={form.resume} onChange={f("resume")} /></Field></div>
            <div className="md:col-span-2"><Field label="URL du document (optionnel)"><input className={inp} type="url" placeholder="Lien Google Drive, PDF..." value={form.url} onChange={f("url")} /></Field></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun communiqué.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(c => (
          <ItemRow key={c.id} title={c.titre} subtitle={`${c.date} · ${c.type}`}
            extraLink={c.url || undefined}
            onEdit={() => setForm({ ...c, _editing: c.id })}
            onDelete={() => remove(c.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Médiathèque ─── */
export function MediathequeSection() {
  const { videos, add: addV, update: updateV, remove: removeV, loading: loadingV, isSeeded: seededV, seedFromStatic: seedV } = useMediaVideos();
  const { photos, add: addP, update: updateP, remove: removeP, loading: loadingP, isSeeded: seededP, seedFromStatic: seedP } = useMediaPhotos();
  const [sub, setSub] = useState("videos");
  const [form, setForm] = useState(null);
  const emptyV = { titre: "", videoId: "", duree: "", date: "", type: "Webinaire" };
  const emptyP = { src: "", alt: "", date: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const TYPES_V = ["Webinaire", "Présentation", "Conférence", "Événement", "Autre"];

  async function doSaveV() {
    if (!form.titre || !form.videoId) { toast.error("Titre et ID YouTube obligatoires"); return; }
    if (form._editing) await updateV(form._editing, { ...form, _editing: undefined });
    else await addV({ ...form });
    setForm(null);
  }
  async function doSaveP() {
    if (!form.src) { toast.error("URL ou image obligatoire"); return; }
    if (form._editing) await updateP(form._editing, { ...form, _editing: undefined });
    else await addP({ ...form });
    setForm(null);
  }

  if (loadingV || loadingP) return <SectionLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">Médiathèque</h2>
        <div className="flex gap-2">
          {["videos", "photos"].map(s => (
            <button key={s} onClick={() => { setSub(s); setForm(null); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${sub === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {s === "videos" ? `Vidéos (${videos.length})` : `Photos (${photos.length})`}
            </button>
          ))}
          {sub === "videos" && !seededV && (
            <button onClick={async () => { if (confirm("Migrer les vidéos statiques ?")) { await seedV(); } }}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
              ☁️ Migrer
            </button>
          )}
          {sub === "photos" && !seededP && (
            <button onClick={async () => { if (confirm("Migrer les photos statiques ?")) { await seedP(); } }}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
              ☁️ Migrer
            </button>
          )}
          <button onClick={() => setForm(sub === "videos" ? { ...emptyV } : { ...emptyP })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </div>

      {sub === "videos" && (
        <>
          {form && (
            <FormPanel title={form._editing ? "Modifier la vidéo" : "Nouvelle vidéo"} onClose={() => setForm(null)} onSave={doSaveV}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
                <Field label="ID YouTube" required><input className={inp} placeholder="ex: enhXRt8erJ0" value={form.videoId} onChange={f("videoId")} /></Field>
                <Field label="Durée"><input className={inp} placeholder="ex: 45 min" value={form.duree} onChange={f("duree")} /></Field>
                <Field label="Date"><input className={inp} placeholder="ex: Jan 2025" value={form.date} onChange={f("date")} /></Field>
                <Field label="Type"><select className={sel} value={form.type} onChange={f("type")}>{TYPES_V.map(t => <option key={t}>{t}</option>)}</select></Field>
              </div>
              {form.videoId && <img src={`https://i.ytimg.com/vi/${form.videoId}/sddefault.jpg`} alt="" className="h-24 rounded-lg mt-2 object-cover" onError={e => e.target.style.display = "none"} />}
            </FormPanel>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {videos.length === 0 && <p className="text-center py-12 text-muted-foreground text-sm">Aucune vidéo.</p>}
            {videos.map(v => (
              <ItemRow key={v.id} img={`https://i.ytimg.com/vi/${v.videoId}/sddefault.jpg`} title={v.titre}
                subtitle={`${v.date} · ${v.duree} · ${v.type}`}
                extraLink={`https://youtube.com/watch?v=${v.videoId}`}
                onEdit={() => setForm({ ...v, _editing: v.id })}
                onDelete={() => removeV(v.id)} />
            ))}
          </div>
        </>
      )}

      {sub === "photos" && (
        <>
          {form && (
            <FormPanel title={form._editing ? "Modifier la photo" : "Nouvelle photo"} onClose={() => setForm(null)} onSave={doSaveP}>
              <ImgField label="Photo" value={form.src} onChange={v => setForm(p => ({ ...p, src: v }))} />
              <Field label="Description / Légende"><input className={inp} value={form.alt} onChange={f("alt")} /></Field>
              <Field label="Date"><input className={inp} placeholder="ex: Nov 2024" value={form.date} onChange={f("date")} /></Field>
            </FormPanel>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.length === 0 && <p className="col-span-4 text-center py-12 text-muted-foreground text-sm">Aucune photo.</p>}
            {photos.map(p => (
              <div key={p.id} className="relative group rounded-xl overflow-hidden bg-muted aspect-video">
                <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => setForm({ ...p, _editing: p.id })} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/40"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeP(p.id)} className="w-8 h-8 bg-red-500/70 rounded-lg flex items-center justify-center text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                {p.alt && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">{p.alt}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Documents ─── */
export function DocumentsSection() {
  const { documents: items, add, update, remove, loading, isSeeded, seedFromStatic } = useDocuments();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { titre: "", type: "PDF", taille: "", date: "", categorie: "Gouvernance", acces: "public", desc: "", url: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Gouvernance", "Stratégie", "Rapport", "Finance", "Autre"];
  const TYPES = ["PDF", "Word", "Excel", "PowerPoint", "Autre"];
  const ACC_COLORS = { public: "bg-green-100 text-green-700", members: "bg-amber-100 text-amber-700" };

  async function doSave() {
    if (!form.titre || !form.categorie) { toast.error("Titre obligatoire"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les documents statiques dans Supabase ?")) return;
    setSeeding(true); await seedFromStatic(); setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Documents" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le document" : "Nouveau document"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Catégorie"><select className={sel} value={form.categorie} onChange={f("categorie")}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Type de fichier"><select className={sel} value={form.type} onChange={f("type")}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Taille"><input className={inp} placeholder="ex: 245 Ko" value={form.taille} onChange={f("taille")} /></Field>
            <Field label="Date"><input className={inp} placeholder="ex: Janvier 2025" value={form.date} onChange={f("date")} /></Field>
            <Field label="Accès">
              <select className={sel} value={form.acces} onChange={f("acces")}>
                <option value="public">Public</option>
                <option value="members">Membres uniquement</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <FileField
                label="Fichier (upload direct ou URL externe)"
                url={form.url}
                onUpload={({ url, type, taille }) =>
                  setForm(p => ({ ...p, url, type, taille }))
                }
                onRemove={() => setForm(p => ({ ...p, url: "" }))}
              />
              {!form.url && (
                <div className="mt-2">
                  <Field label="Ou coller une URL (Google Drive, Dropbox…)">
                    <input className={inp} type="url" placeholder="https://..." value={form.url} onChange={f("url")} />
                  </Field>
                </div>
              )}
            </div>
            <div className="md:col-span-2"><Field label="Description"><textarea className={ta} rows={2} value={form.desc} onChange={f("desc")} /></Field></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun document.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(d => (
          <ItemRow key={d.id} title={d.titre}
            subtitle={`${d.categorie} · ${d.type}${d.taille ? " · " + d.taille : ""}${d.date ? " · " + d.date : ""}`}
            badge={d.acces === "public" ? "Public" : "Membres"} badgeColor={ACC_COLORS[d.acces]}
            extraLink={d.url || undefined}
            onEdit={() => setForm({ ...d, _editing: d.id })}
            onDelete={() => remove(d.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Ressources Juridiques ─── */
export function RessourcesSection() {
  const { ressources: items, add, update, remove, loading, isSeeded, seedFromStatic } = useRessources();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { titre: "", description: "", categorie: "Guide pratique", domaine: "Général", file_url: "", file_type: "PDF", file_size: "", acces: "membres", date: "" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Modèle de contrat", "Fiche de synthèse", "Guide pratique", "Jurisprudence", "Législation", "Formulaire", "Autre"];
  const DOMS = ["Droit des affaires", "Droit public", "Droit pénal", "Droit international", "Droit social", "Fiscalité", "Notariat", "Magistrature", "Général", "Autre"];
  const TYPES = ["PDF", "DOCX", "DOC", "XLSX", "PPTX"];

  async function doSave() {
    if (!form.titre || !form.file_url) { toast.error("Titre et URL obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les ressources statiques dans Supabase ?")) return;
    setSeeding(true); await seedFromStatic(); setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Ressources Juridiques" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier la ressource" : "Nouvelle ressource"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Catégorie"><select className={sel} value={form.categorie} onChange={f("categorie")}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Domaine juridique"><select className={sel} value={form.domaine} onChange={f("domaine")}>{DOMS.map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Type de fichier"><select className={sel} value={form.file_type} onChange={f("file_type")}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Taille"><input className={inp} placeholder="ex: 245 Ko" value={form.file_size} onChange={f("file_size")} /></Field>
            <Field label="Accès">
              <select className={sel} value={form.acces} onChange={f("acces")}>
                <option value="membres">Membres uniquement</option>
                <option value="public">Public</option>
              </select>
            </Field>
            <Field label="Date"><input className={inp} placeholder="ex: janvier 2025" value={form.date} onChange={f("date")} /></Field>
            <div className="md:col-span-2"><Field label="URL du fichier" required><input className={inp} type="url" placeholder="Lien Google Drive, Dropbox..." value={form.file_url} onChange={f("file_url")} /></Field></div>
            <div className="md:col-span-2"><Field label="Description"><textarea className={ta} rows={2} value={form.description} onChange={f("description")} /></Field></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune ressource. Cliquez sur <strong>+ Ajouter</strong> pour commencer.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(r => (
          <ItemRow key={r.id} title={r.titre} subtitle={`${r.categorie} · ${r.domaine} · ${r.file_type}`}
            badge={r.acces === "public" ? "Public" : "Membres"}
            badgeColor={r.acces === "public" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
            extraLink={r.file_url || undefined}
            onEdit={() => setForm({ ...r, _editing: r.id })}
            onDelete={() => remove(r.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Galeries ─── */
export function GaleriesSection() {
  const { galeries: items, add, update, remove, loading, isSeeded, seedFromStatic } = useGaleries();
  const [form, setForm] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const empty = { id: "", titre: "", date: "", lieu: "", description: "", cover: "", photos: [], access: "membres" };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const ACCESS_COLORS = { membres: "bg-amber-100 text-amber-700", public: "bg-green-100 text-green-700" };

  async function doSave() {
    if (!form.titre || !form.date) { toast.error("Titre et date obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  async function handleSeed() {
    if (!confirm("Importer les galeries statiques dans Supabase ?")) return;
    setSeeding(true); await seedFromStatic(); setSeeding(false);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Galeries photos" count={items.length} onAdd={() => setForm({ ...empty })} seedBtn={!isSeeded && { loading: seeding, onClick: handleSeed }} />
      {form && (
        <FormPanel title={form._editing ? "Modifier la galerie" : "Nouvelle galerie"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field></div>
            <Field label="Date" required><input className={inp} placeholder="ex: 30 Juillet 2022" value={form.date} onChange={f("date")} /></Field>
            <Field label="Lieu"><input className={inp} placeholder="ex: Lomé, Togo" value={form.lieu} onChange={f("lieu")} /></Field>
            <Field label="Accès">
              <select className={sel} value={form.access} onChange={f("access")}>
                <option value="membres">Membres uniquement</option>
                <option value="public">Public</option>
              </select>
            </Field>
            <div className="md:col-span-2"><Field label="Description"><textarea className={ta} rows={2} value={form.description} onChange={f("description")} /></Field></div>
            <div className="md:col-span-2"><ImgField label="Photo de couverture" value={form.cover} onChange={v => setForm(p => ({ ...p, cover: v }))} /></div>
            <div className="md:col-span-2"><GalerieField photos={form.photos || []} onChange={v => setForm(p => ({ ...p, photos: v }))} /></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Images className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune galerie. Cliquez sur <strong>+ Ajouter</strong> pour en créer une.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(g => (
          <ItemRow key={g.id} img={g.cover} title={g.titre}
            subtitle={`${g.date}${g.lieu ? " · " + g.lieu : ""} · ${(g.photos || []).length} photo${(g.photos || []).length !== 1 ? "s" : ""}`}
            badge={g.access === "public" ? "Public" : "Membres"}
            badgeColor={ACCESS_COLORS[g.access]}
            extraLink={`/galeries/${g.id}`}
            onEdit={() => setForm({ ...g, _editing: g.id })}
            onDelete={() => remove(g.id)} />
        ))}
      </div>
    </div>
  );
}
