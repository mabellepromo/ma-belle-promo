import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { compressImage } from "../lib/imageUtils";
import { useMemberStore } from "../lib/memberStore";
import { sbGet, sbSet, uploadVideo, uploadImage } from "../lib/supabase";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useLocalAuth } from "../lib/LocalAuth";
import { localStore, slugify } from "../lib/localStore";
import { articles as articlesStatic } from "../data/articles.js";
import { evenements as evenementsStatic } from "../data/evenements.js";
import { projets as projetsStatic } from "../data/projets.js";
import { equipe as equipeStatic } from "../data/equipe.js";
import { documents as documentsStatic } from "../data/documents.js";
import { communiques as communiquesStatic } from "../data/communiques.js";
import { mediaVideos as videosStatic, mediaPhotos as photosStatic } from "../data/mediatheque.js";
import { programmes as programmesStatic } from "../data/programmes.js";
import { sponsors as sponsorsStatic } from "../data/sponsors.js";
import { ressources as ressourcesStatic } from "../data/ressources.js";
import { galeries as galeriesStatic } from "../data/galeries.js";
import {
  Users, FileText, Clock, Check, X, Shield, LayoutDashboard, Lock,
  ExternalLink, Search, BookOpen, Image, Images, Mail, Phone, MapPin, Star,
  LogOut, AlertTriangle, Briefcase, Eye, Edit2, Trash2, Globe,
  UserCheck, Plus, Save, Upload, Video, Calendar, Tag, ChevronDown,
  Link2, Download, MessageSquare, Reply, Send, PenSquare, Paperclip
} from "lucide-react";

/* ─── Shared UI ─── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
const inp = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50";
const ta = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none";
const sel = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50";


function ImgField({ label, value, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      toast.error("Erreur upload image : " + (err.message || err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>
      <div className="space-y-2">
        <input className={inp} type="url" placeholder="URL de l'image (https://...)" value={value?.startsWith("data:") ? "" : (value || "")} onChange={e => onChange(e.target.value)} />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
            {uploading ? <><Upload className="w-3.5 h-3.5 animate-pulse" /> Upload…</> : <><Upload className="w-3.5 h-3.5" /> Uploader</>}
          </button>
          <span className="text-xs text-muted-foreground">ou coller une URL ci-dessus</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && <img src={value} alt="" className="h-24 rounded-lg object-cover border border-border" onError={e => e.target.style.display="none"} />}
      </div>
    </div>
  );
}

function GalerieField({ photos = [], onChange }) {
  const fileRef = useRef();
  const dragIndex = useRef(null);

  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      onChange([...photos, ...urls]);
    } catch (err) {
      toast.error("Erreur upload photos : " + (err.message || err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDragStart = (i) => { dragIndex.current = i; };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(i, 0, moved);
    dragIndex.current = i;
    onChange(reordered);
  };
  const handleDragEnd = () => { dragIndex.current = null; };

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-2">Galerie photos</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map((p, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className="relative group cursor-grab active:cursor-grabbing"
          >
            <div className="h-20 w-28 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
              <img src={p} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
          className="h-20 w-28 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
          {uploading ? <Upload className="w-5 h-5 animate-pulse" /> : <Plus className="w-5 h-5" />}
          <span className="text-xs">{uploading ? "Upload…" : "Ajouter"}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <p className="text-xs text-muted-foreground">Glissez les photos pour les réordonner. Survolez pour supprimer.</p>
    </div>
  );
}

function VideoField({ videos = [], onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const addUrl = () => {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...videos, url]);
    setNewUrl("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadVideo(file);
      onChange([...videos, url]);
    } catch (err) {
      toast.error("Erreur upload vidéo : " + (err.message || err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const remove = (i) => onChange(videos.filter((_, j) => j !== i));

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-2">Vidéos (YouTube, Vimeo ou fichier local)</label>

      {/* Liste des vidéos ajoutées */}
      {videos.length > 0 && (
        <div className="space-y-2 mb-3">
          {videos.map((v, i) => {
            const isDirect = !v.includes("youtube") && !v.includes("youtu.be") && !v.includes("vimeo");
            return (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border">
                {isDirect
                  ? <video src={v} controls className="h-14 rounded flex-shrink-0" />
                  : <span className="text-xs text-muted-foreground truncate flex-1">▶ {v}</span>
                }
                {!isDirect && <span className="flex-1" />}
                <button type="button" onClick={() => remove(i)}
                  className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Ajouter une URL */}
      <div className="flex gap-2 mb-2">
        <input
          className={inp + " flex-1"}
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())}
        />
        <button type="button" onClick={addUrl}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      {/* Upload fichier */}
      <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
        {uploading ? <><Upload className="w-3.5 h-3.5 animate-pulse" /> Upload en cours…</> : <><Upload className="w-3.5 h-3.5" /> Uploader un fichier vidéo</>}
      </button>
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      Chargement…
    </div>
  );
}

function CrudHeader({ title, count, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{count} élément{count !== 1 ? "s" : ""}</p>
      </div>
      <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
        <Plus className="w-4 h-4" /> Ajouter
      </button>
    </div>
  );
}

function FormPanel({ title, onClose, onSave, children }) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-primary/20 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-foreground">{title}</h3>
        <button onClick={onClose} disabled={saving} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center disabled:opacity-50"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="flex gap-3 mt-6 justify-end">
        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50">Annuler</button>
        <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" /> Enregistrement…</>
            : <><Save className="w-4 h-4" /> Enregistrer</>}
        </button>
      </div>
    </motion.div>
  );
}

function ItemRow({ img, title, subtitle, badge, badgeColor, onEdit, onDelete, extraLink }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
      {/* Corps */}
      <div className="flex items-start gap-4">
        {img !== undefined && (
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
            {img && !img.startsWith("data:")
              ? <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display="none"} />
              : <div className="w-full h-full flex items-center justify-center text-primary/30 text-xs">📷</div>}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">{title}</p>
          {subtitle && <p className="text-base text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{subtitle}</p>}
          {badge && <span className={`mt-2.5 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor || "bg-muted text-muted-foreground"}`}>{badge}</span>}
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-border/60">
        {extraLink && (
          <a href={extraLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Voir
          </a>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Fusionne les données stockées avec les données statiques :
 * - Les champs vides/manquants dans le stockage sont remplis par les données statiques
 * - Les modifications de l'admin (champs non vides) sont toujours conservées
 * - Les nouveaux items statiques sont ajoutés s'ils n'existent pas encore
 */
function mergeWithStatic(stored, staticData) {
  const result = staticData.map(staticItem => {
    const storedItem = stored.find(s => String(s.id) === String(staticItem.id));
    if (!storedItem) return staticItem;
    const merged = { ...storedItem };
    for (const [k, v] of Object.entries(staticItem)) {
      const cur = merged[k];
      const isEmpty = cur === "" || cur === null || cur === undefined ||
        (Array.isArray(cur) && cur.length === 0 && Array.isArray(v) && v.length > 0);
      if (isEmpty) merged[k] = v;
    }
    return merged;
  });
  // Garder les items ajoutés par l'admin (non présents dans le statique)
  const staticIds = new Set(staticData.map(s => String(s.id)));
  stored.filter(s => !staticIds.has(String(s.id))).forEach(s => result.push(s));
  return result;
}

function useCrud(storeKey, staticData) {
  const KEY = "mbp_store_" + storeKey;
  const [items, setItems] = useState(staticData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try { localStorage.removeItem(KEY); } catch {}
    sbGet(KEY)
      .then(remote => {
        if (remote !== null) setItems(mergeWithStatic(remote, staticData));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Impossible de charger les données. Vérifiez votre connexion.");
      });
  }, [storeKey]);

  async function save(data, successMsg = "Enregistré !") {
    const previous = items;
    setItems(data);
    setSaving(true);
    try {
      await sbSet(KEY, data);
      toast.success(successMsg);
    } catch {
      setItems(previous);
      toast.error("Échec de la sauvegarde — vos modifications n'ont pas été enregistrées.", { duration: 6000 });
    } finally {
      setSaving(false);
    }
  }

  function add(item) { return save([...items, { ...item, id: item.id || Date.now() }]); }
  function update(id, data) { return save(items.map(it => String(it.id) === String(id) ? { ...it, ...data } : it)); }
  function remove(id) {
    if (confirm("Supprimer cet élément ?"))
      return save(items.filter(it => String(it.id) !== String(id)), "Élément supprimé.");
  }

  return { items, add, update, remove, save, loading, saving };
}

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

/* ══════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════ */

/* ─── Articles ─── */
function ArticlesSection() {
  const { items, add, update, remove, save, loading } = useCrud("articles", articlesStatic);
  const [form, setForm] = useState(null);
  const empty = { id: "", titre: "", extrait: "", date: "", categorie: "Événement", image: "", videos: [], contenu: "", photos: [] };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Webinaire", "Conférence", "Gala", "Solidarité", "Événement", "Juridique"];

  async function doSave() {
    if (!form.titre || !form.extrait || !form.date) { toast.error("Titre, extrait et date obligatoires"); return; }
    const id = form.id || slugify(form.titre) + "-" + Date.now();
    if (form._editing) await update(form._editing, { ...form, id, _editing: undefined });
    else await add({ ...form, id });
    setForm(null);
  }

  const hasBase64 = items.some(a =>
    (a.image && a.image.startsWith("data:")) ||
    (Array.isArray(a.photos) && a.photos.some(p => p.startsWith("data:")))
  );

  const [migrating, setMigrating] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState("");

  async function migrateToStorage() {
    if (!confirm("Migrer automatiquement toutes les photos vers le Storage ? Cela peut prendre quelques minutes.")) return;
    setMigrating(true);

    function base64ToFile(b64, name) {
      const [header, data] = b64.split(",");
      const mime = header.match(/:(.*?);/)[1];
      const bytes = atob(data);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      return new File([arr], name, { type: mime });
    }

    const migrated = [];
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      setMigrateProgress(`Article ${i + 1}/${items.length} : ${a.titre}`);
      let image = a.image;
      if (image?.startsWith("data:")) {
        try { image = await uploadImage(base64ToFile(image, `cover-${a.id}.jpg`)); } catch { image = ""; }
      }
      const photos = [];
      for (const p of (a.photos || [])) {
        if (p.startsWith("data:")) {
          try { photos.push(await uploadImage(base64ToFile(p, `photo-${Date.now()}.jpg`))); } catch {}
        } else {
          photos.push(p);
        }
      }
      migrated.push({ ...a, image, photos });
    }

    await save(migrated);
    setMigrating(false);
    setMigrateProgress("");
    toast.success("Migration terminée ! Toutes les photos sont maintenant dans le Storage.");
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      {migrating && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Migration en cours…</p>
            <p className="text-xs text-muted-foreground">{migrateProgress}</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Articles & Actualités</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} élément{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasBase64 && !migrating && (
            <button onClick={migrateToStorage}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors">
              ☁️ Migrer les photos
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
            <div className="md:col-span-2"><GalerieField photos={form.photos || []} onChange={v => setForm(p => ({ ...p, photos: v }))} /></div>
            <div className="md:col-span-2"><VideoField videos={Array.isArray(form.videos) ? form.videos : (form.youtube ? [form.youtube] : [])} onChange={v => setForm(p => ({ ...p, videos: v, youtube: "" }))} /></div>
            <div className="md:col-span-2">
              <Field label="Contenu" required>
                <div className="rounded-lg border border-border overflow-hidden [&_.ql-toolbar]:bg-muted [&_.ql-container]:bg-background [&_.ql-container]:min-h-[180px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground">
                  <ReactQuill theme="snow" value={form.contenu || ""} onChange={v => setForm(p => ({ ...p, contenu: v }))} modules={quillModules} />
                </div>
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
function EvenementsSection() {
  const { items, add, update, remove, loading } = useCrud("evenements", evenementsStatic);
  const [form, setForm] = useState(null);
  const empty = { titre: "", date: "", heures: "", lieu: "", type: "Conférence", statut: "À venir", description: "", image: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const TYPES = ["Webinaire", "Conférence", "Gala", "Projet éditorial", "Autre"];
  const STATUTS = ["À venir", "En cours", "Passé"];

  async function doSave() {
    if (!form.titre || !form.date || !form.lieu) { toast.error("Titre, date et lieu obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Événements" count={items.length} onAdd={() => setForm({ ...empty })} />
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
          <ItemRow key={e.id} img={e.image} title={e.titre} subtitle={`${e.date}${e.heures ? " · " + e.heures : ""} · ${e.lieu}`}
            badge={e.statut} badgeColor={e.statut === "À venir" ? "bg-green-100 text-green-700" : e.statut === "En cours" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}
            onEdit={() => setForm({ ...e, _editing: e.id })}
            onDelete={() => remove(e.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Projets ─── */
function ProjetsSection() {
  const { items, add, update, remove, loading } = useCrud("projets", projetsStatic);
  const [form, setForm] = useState(null);
  const empty = {
    id: "", titre: "", extrait: "", description: "", contenu: "",
    date: "", categorie: "Solidarité", image: "", photos: [], videos: [],
  };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Solidarité", "Éducation", "Santé publique", "Autre"];

  async function doSave() {
    if (!form.titre || !form.description) { toast.error("Titre et description obligatoires"); return; }
    const id = form.id || slugify(form.titre) + "-" + Date.now();
    if (form._editing) await update(form._editing, { ...form, id, _editing: undefined });
    else await add({ ...form, id });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Projets & Réalisations" count={items.length} onAdd={() => setForm({ ...empty })} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le projet" : "Nouveau projet"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Titre */}
            <div className="md:col-span-2">
              <Field label="Titre" required><input className={inp} value={form.titre} onChange={f("titre")} /></Field>
            </div>
            {/* Date + Catégorie */}
            <Field label="Date"><input className={inp} placeholder="ex: Décembre 2024" value={form.date} onChange={f("date")} /></Field>
            <Field label="Catégorie">
              <select className={sel} value={form.categorie} onChange={f("categorie")}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            {/* Extrait */}
            <div className="md:col-span-2">
              <Field label="Extrait (accroche courte)">
                <textarea className={ta} rows={2} placeholder="1-2 phrases résumant l'action..." value={form.extrait || ""} onChange={f("extrait")} />
              </Field>
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <Field label="Description courte" required>
                <textarea className={ta} rows={3} value={form.description} onChange={f("description")} />
              </Field>
            </div>
            {/* Contenu riche */}
            <div className="md:col-span-2">
              <Field label="Contenu détaillé (page projet)">
                <ReactQuill
                  theme="snow"
                  value={form.contenu || ""}
                  onChange={v => setForm(p => ({ ...p, contenu: v }))}
                  className="bg-background rounded-lg"
                  style={{ minHeight: 180 }}
                />
              </Field>
            </div>
            {/* Image d'accroche */}
            <div className="md:col-span-2">
              <ImgField label="Image d'accroche" value={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} />
            </div>
            {/* Galerie */}
            <div className="md:col-span-2">
              <GalerieField photos={form.photos || []} onChange={v => setForm(p => ({ ...p, photos: v }))} />
            </div>
            {/* Vidéos */}
            <div className="md:col-span-2">
              <VideoField videos={form.videos || []} onChange={v => setForm(p => ({ ...p, videos: v }))} />
            </div>
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
function ProgrammesSection() {
  const { items, add, update, remove, loading } = useCrud("programmes", programmesStatic);
  const [form, setForm] = useState(null);
  const empty = { titre: "", description: "", status: "En gestation", lien: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const STATUTS = ["Actif", "En cours", "En gestation", "Terminé"];

  async function doSave() {
    if (!form.titre || !form.description) { toast.error("Titre et description obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Programmes" count={items.length} onAdd={() => setForm({ ...empty })} />
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
            badge={p.status} badgeColor={p.status === "Actif" ? "bg-green-100 text-green-700" : p.status === "En cours" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}
            onEdit={() => setForm({ ...p, _editing: p.id })}
            onDelete={() => remove(p.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Équipe ─── */
function EquipeSection() {
  const { items, add, update, remove, loading } = useCrud("equipe", equipeStatic);
  const [form, setForm] = useState(null);
  const empty = { nom: "", role: "", profession: "", email: "", tel: "", photo: "", linkedin: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function doSave() {
    if (!form.nom || !form.role) { toast.error("Nom et rôle obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Équipe / Bureau exécutif" count={items.length} onAdd={() => setForm({ ...empty })} />
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
          <ItemRow key={m.id} img={m.photo} title={m.nom} subtitle={`${m.role} · ${m.profession?.slice(0, 60)}${m.profession?.length > 60 ? "..." : ""}`}
            onEdit={() => setForm({ ...m, _editing: m.id })}
            onDelete={() => remove(m.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Sponsors ─── */
function SponsorsSection() {
  const { items, add, update, remove, loading } = useCrud("sponsors", sponsorsStatic);
  const [form, setForm] = useState(null);
  const empty = { nom: "", logo: "", url: "", niveau: "Partenaire Bronze", description: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
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
      <CrudHeader title="Sponsors & Partenaires" count={items.length} onAdd={() => setForm({ ...empty })} />
      {form && (
        <FormPanel title={form._editing ? "Modifier le sponsor" : "Nouveau sponsor"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom du sponsor" required><input className={inp} value={form.nom} onChange={f("nom")} /></Field>
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
          <p className="text-sm">Aucun sponsor. Cliquez sur <strong>+ Ajouter</strong> pour en créer un.</p>
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
function CommuniquesSection() {
  const { items, add, update, remove, loading } = useCrud("communiques", communiquesStatic);
  const [form, setForm] = useState(null);
  const empty = { titre: "", date: "", type: "Communiqué", resume: "", url: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const TYPES = ["Communiqué", "Communiqué de presse", "Invitation", "Rapport AG", "Déclaration", "Autre"];

  async function doSave() {
    if (!form.titre || !form.date || !form.resume) { toast.error("Titre, date et résumé obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Communiqués" count={items.length} onAdd={() => setForm({ ...empty })} />
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
function MediathequeSection() {
  const { items: videos, add: addV, update: updateV, remove: removeV, loading: loadingV } = useCrud("media_videos", videosStatic);
  const { items: photos, add: addP, update: updateP, remove: removeP, loading: loadingP } = useCrud("media_photos", photosStatic);
  const [sub, setSub] = useState("videos");
  const [form, setForm] = useState(null);
  const emptyV = { titre: "", videoId: "", duree: "", date: "", type: "Webinaire" };
  const emptyP = { src: "", alt: "", date: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
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
              {form.videoId && <img src={`https://i.ytimg.com/vi/${form.videoId}/sddefault.jpg`} alt="" className="h-24 rounded-lg mt-2 object-cover" onError={e => e.target.style.display="none"} />}
            </FormPanel>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {videos.length === 0 && <p className="text-center py-12 text-muted-foreground text-sm">Aucune vidéo.</p>}
            {videos.map(v => (
              <ItemRow key={v.id} img={`https://i.ytimg.com/vi/${v.videoId}/sddefault.jpg`} title={v.titre} subtitle={`${v.date} · ${v.duree} · ${v.type}`}
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
function DocumentsSection() {
  const { items, add, update, remove, loading } = useCrud("documents", documentsStatic);
  const [form, setForm] = useState(null);
  const empty = { titre: "", type: "PDF", taille: "", date: "", categorie: "Gouvernance", acces: "public", desc: "", url: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Gouvernance", "Stratégie", "Rapport", "Finance", "Autre"];
  const TYPES = ["PDF", "Word", "Excel", "PowerPoint", "Autre"];

  async function doSave() {
    if (!form.titre || !form.categorie) { toast.error("Titre obligatoire"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  const ACC_COLORS = { public: "bg-green-100 text-green-700", members: "bg-amber-100 text-amber-700" };

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Documents" count={items.length} onAdd={() => setForm({ ...empty })} />
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
            <div className="md:col-span-2"><Field label="URL de téléchargement"><input className={inp} type="url" placeholder="Lien Google Drive, Dropbox..." value={form.url} onChange={f("url")} /></Field></div>
            <div className="md:col-span-2"><Field label="Description"><textarea className={ta} rows={2} value={form.desc} onChange={f("desc")} /></Field></div>
          </div>
        </FormPanel>
      )}
      {items.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">Aucun document.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(d => (
          <ItemRow key={d.id} title={d.titre} subtitle={`${d.categorie} · ${d.type}${d.taille ? " · " + d.taille : ""}${d.date ? " · " + d.date : ""}`}
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
function RessourcesSection() {
  const { items, add, update, remove, loading } = useCrud("ressources", ressourcesStatic);
  const [form, setForm] = useState(null);
  const empty = { titre: "", description: "", categorie: "Guide pratique", domaine: "Général", file_url: "", file_type: "PDF", file_size: "", acces: "membres", date: "" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const CATS = ["Modèle de contrat", "Fiche de synthèse", "Guide pratique", "Jurisprudence", "Législation", "Formulaire", "Autre"];
  const DOMS = ["Droit des affaires", "Droit public", "Droit pénal", "Droit international", "Droit social", "Fiscalité", "Notariat", "Magistrature", "Général", "Autre"];
  const TYPES = ["PDF", "DOCX", "DOC", "XLSX", "PPTX"];

  async function doSave() {
    if (!form.titre || !form.file_url) { toast.error("Titre et URL obligatoires"); return; }
    if (form._editing) await update(form._editing, { ...form, _editing: undefined });
    else await add({ ...form });
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Ressources Juridiques" count={items.length} onAdd={() => setForm({ ...empty })} />
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
            badge={r.acces === "public" ? "Public" : "Membres"} badgeColor={r.acces === "public" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
            extraLink={r.file_url || undefined}
            onEdit={() => setForm({ ...r, _editing: r.id })}
            onDelete={() => remove(r.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Messages (formulaire Contact) ─── */
const EMAILJS_REPLY_TEMPLATE = "template_stj5ekf";

function MessagesSection() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [replyMsg, setReplyMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [senderName,  setSenderName]  = useState("");
  const [senderPoste, setSenderPoste] = useState("");
  const [compose, setCompose] = useState(false);
  const [sendStatus, setSendStatus] = useState("idle"); // idle | sending | sent | error

  const expediteurs = equipeStatic.map(m => ({ nom: m.nom, poste: m.role }));

  useEffect(() => {
    sbGet("mbp_contact_messages")
      .then(data => { if (data) setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function persist(data) {
    setMessages(data);
    try { await sbSet("mbp_contact_messages", data); } catch {}
  }

  function markRead(id) { persist(messages.map(m => m.id === id ? { ...m, read: true } : m)); }
  function deleteMsg(id) { if (confirm("Supprimer ce message ?")) persist(messages.filter(m => m.id !== id)); }

  function openReply(msg) {
    markRead(msg.id);
    setReplyMsg(msg);
    setReplyText(`Nous avons bien reçu votre message${msg.sujet ? ` concernant "${msg.sujet}"` : ""} et nous vous en remercions.\n\n`);
    setSenderName("");
    setSenderPoste("");
    setSendStatus("idle");
  }

  async function sendReply() {
    if (!replyText.trim()) { toast.error("Le message est vide."); return; }
    setSendStatus("sending");
    try {
      await emailjs.send(
        "service_lytdtan",
        EMAILJS_REPLY_TEMPLATE,
        {
          to_name:       replyMsg.name,
          to_email:      replyMsg.email,
          sujet:         "Réponse — " + (replyMsg.sujet || "Votre message"),
          reply_message: replyText.replace(/\n/g, "<br>"),
          date:          new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          sender_name:   senderName  || "Le Bureau Exécutif",
          sender_poste:  senderPoste || "",
        },
        { publicKey: "8AzpuYIvN_xHmA--I" }
      );
      setSendStatus("sent");
      setTimeout(() => { setReplyMsg(null); setSendStatus("idle"); }, 2000);
    } catch (err) {
      console.error("EmailJS reply error:", err);
      setSendStatus("error");
    }
  }

  const unread = messages.filter(m => !m.read).length;

  if (loading) return <SectionLoader />;

  return (
    <div>
      {compose && <ComposeModal onClose={() => setCompose(false)} />}

      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Messages reçus</h2>
        {unread > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{unread} non lu{unread > 1 ? "s" : ""}</span>}
        <span className="text-sm text-muted-foreground ml-auto">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setCompose(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
          <PenSquare className="w-3.5 h-3.5" /> Nouveau message
        </button>
      </div>

      {/* Modal Répondre */}
      {replyMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReplyMsg(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-foreground">Répondre à {replyMsg.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{replyMsg.email}</p>
              </div>
              <button onClick={() => setReplyMsg(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Aperçu message original */}
              <div className="bg-muted/30 rounded-xl p-3 border border-border text-xs text-muted-foreground">
                <p className="font-semibold mb-1 text-foreground">Message original :</p>
                <p className="line-clamp-3">{replyMsg.message}</p>
              </div>

              {/* Expéditeur */}
              <div className="bg-muted/30 rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signataire</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Nom</label>
                    <select
                      value={senderName}
                      onChange={e => {
                        const m = expediteurs.find(x => x.nom === e.target.value);
                        setSenderName(e.target.value);
                        setSenderPoste(m ? m.poste : "");
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50">
                      <option value="">— Le Bureau Exécutif —</option>
                      {expediteurs.map(ex => <option key={ex.nom} value={ex.nom}>{ex.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Fonction</label>
                    <input
                      value={senderPoste}
                      onChange={e => setSenderPoste(e.target.value)}
                      placeholder="ex: Présidente"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Zone de réponse */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Corps du message <span className="text-muted-foreground font-normal">(papier en-tête MBP)</span>
                </label>
                <textarea
                  rows={8}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                />
              </div>

              {/* Statut */}
              {sendStatus === "error" && (
                <p className="text-xs text-red-500 font-medium">Échec de l'envoi — vérifiez votre connexion et réessayez.</p>
              )}

              {/* Boutons */}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setReplyMsg(null)}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button onClick={sendReply} disabled={sendStatus === "sending" || sendStatus === "sent"}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    sendStatus === "sent"
                      ? "bg-green-500 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  } disabled:opacity-60`}>
                  {sendStatus === "sending" && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {sendStatus === "sent"     && <Check className="w-4 h-4" />}
                  {sendStatus === "idle"     && <Send className="w-4 h-4" />}
                  {sendStatus === "error"    && <Send className="w-4 h-4" />}
                  {sendStatus === "sending" ? "Envoi…" : sendStatus === "sent" ? "Envoyé !" : "Envoyer"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-background border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-primary/30" />
          </div>
          <p className="font-semibold text-foreground">Aucun message reçu</p>
          <p className="text-sm mt-1">Les messages du formulaire de contact apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_3fr_1fr_auto_auto] gap-4 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expéditeur</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Sujet & aperçu</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Date</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
            <span></span>
          </div>

          <div className="divide-y divide-border/60">
            {messages.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`group grid grid-cols-[2fr_3fr_1fr_auto_auto] gap-4 items-center px-5 py-4 transition-all relative ${!m.read ? "bg-primary/[0.03]" : "hover:bg-muted/30"}`}>

                {/* Indicateur non lu */}
                {!m.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}

                {/* Expéditeur */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!m.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                  </div>
                </div>

                {/* Sujet */}
                <div className="hidden md:block min-w-0">
                  <p className={`text-sm truncate ${!m.read ? "font-semibold text-foreground" : "text-foreground"}`}>{m.sujet || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                </div>

                {/* Date */}
                <div className="hidden lg:block">
                  <p className="text-xs font-medium text-foreground">{new Date(m.receivedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.receivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>

                {/* Statut */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  m.read ? "bg-muted text-muted-foreground" : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.read ? "bg-muted-foreground/40" : "bg-blue-500"}`} />
                  {m.read ? "Lu" : "Non lu"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!m.read && (
                    <button onClick={() => markRead(m.id)} title="Marquer comme lu"
                      className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => { markRead(m.id); setReplyMsg(m); }} title="Répondre"
                    className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMsg(m.id)} title="Supprimer"
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Composer un message ─── */
const EMAILJS_SERVICE  = "service_lytdtan";
const EMAILJS_TEMPLATE = "template_tznyr0b";
const EMAILJS_KEY      = "8AzpuYIvN_xHmA--I";

function ComposeModal({ onClose }) {
  const [recipients, setRecipients] = useState([{ email: "", nom: "" }]);
  const [form, setForm]     = useState({ sujet: "", corps: "", expNom: "", expPoste: "" });
  const [files, setFiles]   = useState([]);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [sentCount, setSentCount] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const expediteurs = equipeStatic.map(m => ({ nom: m.nom, poste: m.role }));

  function updateRecipient(i, field, value) {
    setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }
  function addRecipient() { setRecipients(prev => [...prev, { email: "", nom: "" }]); }
  function removeRecipient(i) { setRecipients(prev => prev.filter((_, idx) => idx !== i)); }

  const validRecipients = recipients.filter(r => r.email.trim());

  async function handleSend() {
    if (!validRecipients.length || !form.sujet || !form.corps) {
      toast.error("Au moins un email destinataire, l'objet et le corps sont obligatoires.");
      return;
    }
    setStatus("sending");
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    try {
      for (const dest of validRecipients) {
        await emailjs.send(
          EMAILJS_SERVICE,
          EMAILJS_REPLY_TEMPLATE,
          {
            to_email:      dest.email,
            to_name:       dest.nom || dest.email,
            sujet:         form.sujet,
            reply_message: form.corps.replace(/\n/g, "<br>"),
            date,
            sender_name:   form.expNom   || "Le Bureau Exécutif",
            sender_poste:  form.expPoste || "",
          },
          { publicKey: EMAILJS_KEY }
        );
      }
      setSentCount(validRecipients.length);
      setStatus("sent");
      setTimeout(() => { onClose(); }, 2500);
    } catch (err) {
      console.error("EmailJS error:", err);
      setErrMsg(err?.text || err?.message || JSON.stringify(err) || "Erreur inconnue");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={status === "sending" ? undefined : onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* En-tête */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
            alt="MBP" className="w-9 h-9 rounded-full ring-2 ring-primary/20" />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-foreground">Nouveau message</h3>
            <p className="text-xs text-muted-foreground">De : <span className="font-medium text-primary">mabellepromo@gmail.com</span></p>
          </div>
          <button onClick={onClose} disabled={status === "sending"} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0 disabled:opacity-40"><X className="w-4 h-4" /></button>
        </div>

        {/* Succès */}
        {status === "sent" && (
          <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 flex items-center gap-2">
            <Check className="w-4 h-4" /> {sentCount} message{sentCount > 1 ? "s envoyés" : " envoyé"} avec succès !
          </div>
        )}

        {/* Erreur */}
        {status === "error" && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold"><X className="w-4 h-4" /> Échec de l'envoi</div>
            {errMsg && <p className="text-xs font-mono text-red-700 break-all">{errMsg}</p>}
          </div>
        )}

        {/* Corps du formulaire */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Destinataires */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Destinataires *</label>
              <button onClick={addRecipient} disabled={status === "sending"}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input className={inp} type="email" placeholder="email@exemple.com" value={r.email}
                    onChange={e => updateRecipient(i, "email", e.target.value)} disabled={status === "sending"} />
                  <input className={inp} placeholder="Nom (optionnel)" value={r.nom}
                    onChange={e => updateRecipient(i, "nom", e.target.value)} disabled={status === "sending"} />
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(i)} disabled={status === "sending"}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {validRecipients.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1.5">{validRecipients.length} destinataires — un email individuel sera envoyé à chacun.</p>
            )}
          </div>

          <Field label="Objet" required>
            <input className={inp} placeholder="Objet du message" value={form.sujet} onChange={f("sujet")} disabled={status === "sending"} />
          </Field>

          {/* Aperçu en-tête email */}
          <div className="bg-gradient-to-r from-primary/8 to-transparent border border-primary/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
              <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png" alt="" className="w-5 h-5 rounded-full" />
              <span className="text-xs font-bold text-foreground">Ma Belle Promo</span>
              <span className="text-xs text-muted-foreground">· mabellepromo@gmail.com</span>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Bonjour <span className="text-foreground font-medium">{form.nomDest || "[Destinataire]"}</span>,
            </p>
          </div>

          {/* Corps */}
          <Field label="Corps du message" required>
            <textarea className={ta} rows={9} placeholder="Rédigez votre message ici..." value={form.corps} onChange={f("corps")} disabled={status === "sending"} />
          </Field>

          {/* Expéditeur */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signature — Expéditeur</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom de l'expéditeur">
                <select className={sel} value={form.expNom} disabled={status === "sending"}
                  onChange={e => {
                    const m = expediteurs.find(x => x.nom === e.target.value);
                    setForm(p => ({ ...p, expNom: e.target.value, expPoste: m ? m.poste : p.expPoste }));
                  }}>
                  <option value="">— Choisir un membre du bureau —</option>
                  {expediteurs.map(ex => <option key={ex.nom} value={ex.nom}>{ex.nom}</option>)}
                </select>
              </Field>
              <Field label="Poste / Fonction">
                <input className={inp} placeholder="ex: Présidente" value={form.expPoste} onChange={f("expPoste")} disabled={status === "sending"} />
              </Field>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border/50 pt-3">
              <p className="font-semibold text-foreground">{form.expNom || "Votre nom"}</p>
              {form.expPoste && <p>{form.expPoste}</p>}
              <p className="font-medium text-primary/80">Ma Belle Promo — FDD Lomé · 1994–2000</p>
              <p>mabellepromo@gmail.com</p>
            </div>
          </div>

          {/* Pièces jointes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pièces jointes</p>
            <label className="flex items-center gap-3 p-3 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
              <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {files.length > 0 ? files.map(fi => fi.name).join(", ") : "Cliquer pour sélectionner des fichiers…"}
              </span>
              <input type="file" multiple className="hidden" onChange={e => setFiles(e.target.files ? Array.from(e.target.files) : [])} />
            </label>
            {files.length > 0 && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""} — les pièces jointes nécessitent le plan EmailJS payant
              </p>
            )}
          </div>
        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-muted/20 rounded-b-2xl">
          <button onClick={onClose} disabled={status === "sending"} className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-40">Annuler</button>
          <button onClick={handleSend} disabled={status === "sending" || status === "sent"}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
            {status === "sending"
              ? <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Envoi…</>
              : status === "sent"
              ? <><Check className="w-4 h-4" /> Envoyé</>
              : <><Send className="w-4 h-4" /> Envoyer</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Galeries ─── */
function GaleriesSection() {
  const { items, add, update, remove, loading } = useCrud("galeries", galeriesStatic);
  const [form, setForm] = useState(null);
  const empty = { id: "", titre: "", date: "", lieu: "", description: "", cover: "", photos: [], access: "membres" };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function doSave() {
    if (!form.titre || !form.date) { toast.error("Titre et date obligatoires"); return; }
    const id = form.id || slugify(form.titre) + "-" + Date.now();
    if (form._editing) await update(form._editing, { ...form, id, _editing: undefined });
    else await add({ ...form, id });
    setForm(null);
  }

  const ACCESS_COLORS = {
    "membres": "bg-amber-100 text-amber-700",
    "public":  "bg-green-100 text-green-700",
  };

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Galeries photos" count={items.length} onAdd={() => setForm({ ...empty })} />
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
          <ItemRow
            key={g.id}
            img={g.cover}
            title={g.titre}
            subtitle={`${g.date}${g.lieu ? " · " + g.lieu : ""} · ${(g.photos || []).length} photo${(g.photos || []).length !== 1 ? "s" : ""}`}
            badge={g.access === "public" ? "Public" : "Membres"}
            badgeColor={ACCESS_COLORS[g.access]}
            extraLink={`/galeries/${g.id}`}
            onEdit={() => setForm({ ...g, _editing: g.id })}
            onDelete={() => remove(g.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { session, logout } = useLocalAuth();
  const navigate = useNavigate();

  const {
    allMembers, pendingMembers, validatedMembers,
    updateMember, validateMember, rejectMember, deleteMember, addValidated,
  } = useMemberStore();

  const [tab,     setTab]    = useState("overview");
  const [search,  setSearch] = useState("");
  const [compose, setCompose] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember,  setAddingMember]  = useState(null);
  const csvInputRef = useRef(null);

  const msgCount = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || "[]").length; } catch { return 0; } })();
  const unreadMsgCount = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || "[]").filter(m => !m.read).length; } catch { return 0; } })();

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMembers.filter(m => {
      const hay = [m.nom, m.profession, m.ville, m.pays].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !search || hay.includes(q);
    });
  }, [allMembers, search]);

  async function handleSaveEditMember() {
    if (!editingMember) return;
    await updateMember(editingMember, editingMember);
    toast.success("Membre mis à jour !");
    setEditingMember(null);
  }

  async function handleSaveNewMember() {
    if (!addingMember?.nom?.trim()) { toast.error("Le nom est obligatoire."); return; }
    await addValidated(addingMember);
    toast.success("Membre ajouté !");
    setAddingMember(null);
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(l => l.trim());
      const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";").map(c => c.trim().replace(/^"|"$/g, ""));
        if (!cols[0]) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
        addValidated({
          nom: row["nom"] || row["name"] || "",
          profession: row["profession"] || row["metier"] || "",
          ville: row["ville"] || row["city"] || "",
          pays: row["pays"] || row["country"] || "",
          email: row["email"] || "",
          telephone: row["telephone"] || row["tel"] || row["phone"] || "",
          linkedin: row["linkedin"] || "",
          anneeObtention: row["anneeObtention"] || row["promo"] || row["annee"] || "",
        });
        count++;
      }
      toast.success(`${count} membre(s) importé(s) avec succès.`);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }

  if (!session || session.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-red-500" /></div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-6">Tableau de bord réservé aux administrateurs.</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm">Se connecter</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "overview",    label: "Vue d'ensemble",  icon: LayoutDashboard },
    { key: "membres",     label: `Membres (${allMembers.length})`, icon: Users },
    { key: "pending",     label: `En attente${pendingMembers.length > 0 ? ` (${pendingMembers.length})` : ""}`, icon: Clock, alert: pendingMembers.length > 0 },
    { key: "messages",    label: `Messages${unreadMsgCount > 0 ? ` (${unreadMsgCount})` : ""}`, icon: MessageSquare, alert: unreadMsgCount > 0 },
    { key: "articles",    label: "Articles",    icon: FileText },
    { key: "evenements",  label: "Événements",  icon: Calendar },
    { key: "projets",     label: "Projets",     icon: Star },
    { key: "programmes",  label: "Programmes",  icon: Tag },
    { key: "equipe",      label: "Équipe",      icon: UserCheck },
    { key: "sponsors",    label: "Sponsors",    icon: Globe },
    { key: "communiques", label: "Communiqués", icon: Mail },
    { key: "mediatheque", label: "Médiathèque", icon: Image },
    { key: "documents",   label: "Documents",   icon: Download },
    { key: "galeries",   label: "Galeries",    icon: Images },
  ];

  const stats = [
    { label: "Membres", value: allMembers.length, icon: Users, color: "bg-blue-50 text-blue-600", sub: `${allMembers.filter(m => m.bureau).length} au bureau`, onClick: () => setTab("membres") },
    { label: "En attente", value: pendingMembers.length, icon: Clock, color: "bg-amber-50 text-amber-600", sub: "à valider", alert: pendingMembers.length > 0, onClick: () => setTab("pending") },
    { label: "Messages", value: msgCount, icon: MessageSquare, color: "bg-indigo-50 text-indigo-600", sub: `${unreadMsgCount} non lu${unreadMsgCount !== 1 ? "s" : ""}`, alert: unreadMsgCount > 0, onClick: () => setTab("messages") },
    { label: "Articles", value: (localStore.getOrDefault("articles", articlesStatic)).length, icon: FileText, color: "bg-green-50 text-green-600", sub: "publications", onClick: () => setTab("articles") },
  ];

  const PROTECTED_PAGES = [
    { label: "Adhérents", href: "/annuaire", icon: Users },
    { label: "Médiathèque", href: "/informations/mediatheque", icon: Image },
    { label: "Documents", href: "/informations/documents", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">

      {compose && <ComposeModal onClose={() => setCompose(false)} />}

      {/* Header premium */}
      <div className="sticky top-0 z-40 flex-shrink-0" style={{ background: "hsl(150,30%,10%)" }}>
        <div className="h-20 px-6 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo + titre */}
          <div className="flex items-center gap-4">
            <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              alt="MBP" className="w-12 h-12 rounded-full ring-2 ring-white/25" />
            <div>
              <p className="font-heading font-bold text-white text-base leading-tight">Ma Belle Promo</p>
              <p className="text-white/50 text-[10px] tracking-widest uppercase leading-tight mt-0.5">Tableau de bord</p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setCompose(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
              <PenSquare className="w-3.5 h-3.5" /> Composer
            </button>
            <Link to="/" target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs text-white/60 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Globe className="w-3.5 h-3.5" /> Site
            </Link>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Body : sidebar + contenu */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-background border-r border-border border-l-2 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto flex flex-col" style={{ borderLeftColor: "hsl(150,45%,35%)" }}>
          {/* Profil admin */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">Administrateur</p>
                <p className="text-[10px] text-muted-foreground truncate">{session?.email || "mabellepromo@gmail.com"}</p>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="p-3 space-y-0.5 flex-1">
            {TABS.map(({ key, label, icon: Icon, alert }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative ${
                  tab === key
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {alert && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tab === key ? "bg-primary" : "bg-amber-500"}`} />}
              </button>
            ))}
          </nav>
          {/* Footer sidebar */}
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">FDD · Université de Lomé</p>
            <p className="text-[10px] text-muted-foreground text-center">Promotion 1994–2000</p>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 p-6 md:p-8 min-w-0">

        {/* ── VUE D'ENSEMBLE ── */}
        {tab === "overview" && (
          <div className="space-y-8">

            {/* Bannière de bienvenue */}
            <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{ background: "hsl(150,30%,10%)" }}>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
              <div className="relative flex items-center gap-5">
                <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
                  alt="MBP" className="w-14 h-14 rounded-full ring-2 ring-white/20 flex-shrink-0 hidden sm:block" />
                <div>
                  <p className="text-white/60 text-xs tracking-widest uppercase mb-1">Bienvenue</p>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight">Tableau de bord</h1>
                  <p className="text-white/60 text-sm mt-1">FDD — Ma Belle Promo · Lomé, Togo · Promotion 1994–2000</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color, sub, alert, onClick }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={onClick}
                  className={`relative overflow-hidden bg-background border rounded-2xl p-5 group ${alert ? "border-amber-200" : "border-border"} ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200" : ""}`}>
                  {/* Fond décoratif */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 bg-primary group-hover:opacity-10 transition-opacity" />
                  {alert && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}><Icon className="w-5 h-5" /></div>
                  <div className="font-heading text-4xl font-black text-foreground tracking-tight">{value}</div>
                  <div className="text-sm font-bold text-foreground mt-1">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                </motion.div>
              ))}
            </div>

            {pendingMembers.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">{pendingMembers.length} demande{pendingMembers.length > 1 ? "s" : ""} en attente</h3>
                  <button onClick={() => setTab("pending")} className="ml-auto text-sm text-amber-700 font-semibold hover:underline">Voir tout →</button>
                </div>
                {pendingMembers.slice(0, 2).map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100 mb-2">
                    <div><p className="font-semibold text-sm">{m.nom}</p><p className="text-xs text-muted-foreground">{m.profession} · {m.ville}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => rejectMember(m.id)} className="w-7 h-7 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100"><X className="w-3.5 h-3.5" /></button>
                      <button onClick={() => validateMember(m)} className="w-7 h-7 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-100"><Check className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Pages privées</h3>
                {PROTECTED_PAGES.map(({ label, href, icon: Icon }) => (
                  <Link key={href} to={href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors group mb-1">
                    <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-primary" /></div><span className="text-sm font-medium">{label}</span></div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Comptes d'accès</h3>
                {[
                  { email: "mabellepromo@gmail.com", role: "Admin", color: "bg-primary/10 text-primary" },
                  { email: "fasenaya@gmail.com",      role: "Membre", color: "bg-blue-50 text-blue-700" },
                  { email: "invite@mabellepromo.tg", role: "Invité",  color: "bg-muted text-muted-foreground" },
                ].map(r => (
                  <div key={r.email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="font-mono text-xs text-foreground">{r.email}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.role}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-3">Pour ajouter un compte : créer un utilisateur dans le dashboard Supabase avec <code className="text-primary font-mono">role</code> dans les métadonnées.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBRES ── */}
        {tab === "membres" && (
          <div className="space-y-5">
            {/* Barre de recherche + actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..."
                  className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-xl border border-primary/15">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-primary">{filteredMembers.length}</span>
                <span className="text-xs text-primary/70">membre{filteredMembers.length !== 1 ? "s" : ""}</span>
              </div>
              <button onClick={() => setAddingMember({ nom: "", profession: "", ville: "", pays: "", email: "", telephone: "", linkedin: "", anneeObtention: "", photo: "" })}
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Ajouter
              </button>
              <button onClick={() => csvInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <Upload className="w-4 h-4" /> Importer CSV
              </button>
              <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
            </div>

            {addingMember && (
              <FormPanel title="Nouveau membre" onClose={() => setAddingMember(null)} onSave={handleSaveNewMember}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Nom complet" required><input className={inp} value={addingMember.nom} onChange={e => setAddingMember(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom NOM" /></Field>
                  <Field label="Profession"><input className={inp} value={addingMember.profession} onChange={e => setAddingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
                  <Field label="Ville"><input className={inp} value={addingMember.ville} onChange={e => setAddingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
                  <Field label="Pays"><input className={inp} value={addingMember.pays} onChange={e => setAddingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
                  <Field label="Email"><input className={inp} type="email" value={addingMember.email} onChange={e => setAddingMember(p => ({ ...p, email: e.target.value }))} /></Field>
                  <Field label="Téléphone"><input className={inp} value={addingMember.telephone} onChange={e => setAddingMember(p => ({ ...p, telephone: e.target.value }))} /></Field>
                  <Field label="Année d'obtention du diplôme"><input className={inp} value={addingMember.anneeObtention} onChange={e => setAddingMember(p => ({ ...p, anneeObtention: e.target.value }))} placeholder="ex: 2005" /></Field>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={addingMember.linkedin} onChange={e => setAddingMember(p => ({ ...p, linkedin: e.target.value }))} />
                    </div>
                  </div>
                  <div className="md:col-span-2"><ImgField label="Photo" value={addingMember.photo} onChange={v => setAddingMember(p => ({ ...p, photo: v }))} /></div>
                </div>
              </FormPanel>
            )}

            {editingMember && (
              <FormPanel title={`Modifier — ${editingMember.nom}`} onClose={() => setEditingMember(null)} onSave={handleSaveEditMember}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Nom complet"><input className={inp} value={editingMember.nom || ""} onChange={e => setEditingMember(p => ({ ...p, nom: e.target.value }))} /></Field>
                  <Field label="Profession"><input className={inp} value={editingMember.profession || ""} onChange={e => setEditingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
                  <Field label="Ville"><input className={inp} value={editingMember.ville || ""} onChange={e => setEditingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
                  <Field label="Pays"><input className={inp} value={editingMember.pays || ""} onChange={e => setEditingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
                  <Field label="Email"><input className={inp} type="email" value={editingMember.email || ""} onChange={e => setEditingMember(p => ({ ...p, email: e.target.value }))} /></Field>
                  <Field label="Téléphone"><input className={inp} value={editingMember.telephone || editingMember.tel || ""} onChange={e => setEditingMember(p => ({ ...p, telephone: e.target.value, tel: e.target.value }))} /></Field>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={editingMember.linkedin || ""} onChange={e => setEditingMember(p => ({ ...p, linkedin: e.target.value }))} />
                    </div>
                  </div>
                  <div className="md:col-span-2"><ImgField label="Photo" value={editingMember.photo} onChange={v => setEditingMember(p => ({ ...p, photo: v }))} /></div>
                </div>
              </FormPanel>
            )}

            {/* Tableau membres redesigné */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* En-tête tableau */}
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membre</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Profession</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Localisation</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
                <span></span>
              </div>

              {/* Lignes */}
              <div className="divide-y divide-border/60">
                {filteredMembers.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="group grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-primary/[0.03] transition-all relative">
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r scale-y-0 group-hover:scale-y-100 transition-transform" />

                    {/* Avatar + nom */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
                        <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`}
                          alt={m.nom} className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }}
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{m.nom}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.email || "—"}</p>
                      </div>
                    </div>

                    {/* Profession */}
                    <p className="text-sm text-muted-foreground line-clamp-1 hidden md:block">{m.profession || "—"}</p>

                    {/* Localisation */}
                    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{m.ville}{m.pays ? `, ${m.pays}` : ""}</span>
                    </div>

                    {/* Statut */}
                    <div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        m.bureau ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        m.status === "validated" ? "bg-green-100 text-green-700 border border-green-200" :
                        "bg-primary/8 text-primary border border-primary/15"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.bureau ? "bg-amber-500" : m.status === "validated" ? "bg-green-500" : "bg-primary"}`} />
                        {m.bureau ? "Bureau" : m.status === "validated" ? "Validé" : "Actif"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingMember({ ...m })} className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (confirm(`Supprimer ${m.nom} ?`)) deleteMember(m.id); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EN ATTENTE ── */}
        {tab === "pending" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-heading text-xl font-bold text-foreground">{pendingMembers.length} demande{pendingMembers.length !== 1 ? "s" : ""} en attente</h2>
            {pendingMembers.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-background border border-border rounded-2xl">
                <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" /><p className="font-medium">Aucune demande en attente.</p>
              </div>
            )}
            {pendingMembers.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img src={m.photo} alt={m.nom} className="w-full h-full object-cover" onError={e => { e.target.onerror=null; e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=56`; }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{m.nom}</h3>
                    <p className="text-sm text-muted-foreground">{m.profession}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.ville}, {m.pays}</span>
                      {m.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>}
                      {m.anneeObtention && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />Promo {m.anneeObtention}</span>}
                    </div>
                    {m.motivations && <p className="mt-2 text-xs italic bg-muted/40 rounded-lg p-2 line-clamp-2">"{m.motivations}"</p>}
                    <p className="mt-1 text-xs text-muted-foreground/50">Soumis le {new Date(m.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 justify-end">
                  <button onClick={() => rejectMember(m.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100"><X className="w-4 h-4" /> Rejeter</button>
                  <button onClick={() => validateMember(m)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-100"><Check className="w-4 h-4" /> Valider</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "messages"    && <MessagesSection />}
        {tab === "articles"    && <ArticlesSection />}
        {tab === "evenements"  && <EvenementsSection />}
        {tab === "projets"     && <ProjetsSection />}
        {tab === "programmes"  && <ProgrammesSection />}
        {tab === "equipe"      && <EquipeSection />}
        {tab === "sponsors"    && <SponsorsSection />}
        {tab === "communiques" && <CommuniquesSection />}
        {tab === "mediatheque" && <MediathequeSection />}
        {tab === "documents"   && <DocumentsSection />}
        {tab === "galeries"    && <GaleriesSection />}

        </div>{/* fin contenu principal */}
      </div>{/* fin flex body */}
    </div>
  );
}
