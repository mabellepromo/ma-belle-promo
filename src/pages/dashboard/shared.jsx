import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { sbGet, sbSet, uploadImage, uploadVideo } from "../../lib/supabase";
import { motion } from "framer-motion";
import { X, Plus, Save, Upload, Edit2, Trash2, Eye } from "lucide-react";

/* ─── Constantes de style ─── */
export const inp = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50";
export const ta  = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none";
export const sel = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50";

export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function ImgField({ label, value, onChange }) {
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
        <input
          className={inp} type="url"
          placeholder="URL de l'image (https://...)"
          value={value?.startsWith("data:") ? "" : (value || "")}
          onChange={e => onChange(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
            {uploading
              ? <><Upload className="w-3.5 h-3.5 animate-pulse" /> Upload…</>
              : <><Upload className="w-3.5 h-3.5" /> Uploader</>}
          </button>
          <span className="text-xs text-muted-foreground">ou coller une URL ci-dessus</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && (
          <img src={value} alt="" className="h-24 rounded-lg object-cover border border-border"
            onError={e => e.target.style.display = "none"} />
        )}
      </div>
    </div>
  );
}

export function GalerieField({ photos = [], onChange }) {
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
          <div key={i} draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className="relative group cursor-grab active:cursor-grabbing">
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

export function VideoField({ videos = [], onChange }) {
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
      <label className="block text-xs font-semibold text-foreground mb-2">
        Vidéos (YouTube, Vimeo ou fichier local)
      </label>
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
      <div className="flex gap-2 mb-2">
        <input className={inp + " flex-1"} type="url" placeholder="https://youtube.com/watch?v=..."
          value={newUrl} onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())} />
        <button type="button" onClick={addUrl}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
        {uploading
          ? <><Upload className="w-3.5 h-3.5 animate-pulse" /> Upload en cours…</>
          : <><Upload className="w-3.5 h-3.5" /> Uploader un fichier vidéo</>}
      </button>
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      Chargement…
    </div>
  );
}

export function CrudHeader({ title, count, onAdd, seedBtn }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count} élément{count !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {seedBtn && (
          <button onClick={seedBtn.onClick} disabled={seedBtn.loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-60">
            {seedBtn.loading
              ? <><div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Migration…</>
              : <>☁️ Migrer les données initiales</>}
          </button>
        )}
        <button onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
    </div>
  );
}

export function FormPanel({ title, onClose, onSave, children }) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try { await onSave(); }
    finally { setSaving(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-primary/20 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-foreground">{title}</h3>
        <button onClick={onClose} disabled={saving}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center disabled:opacity-50">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="flex gap-3 mt-6 justify-end">
        <button type="button" onClick={onClose} disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" /> Enregistrement…</>
            : <><Save className="w-4 h-4" /> Enregistrer</>}
        </button>
      </div>
    </motion.div>
  );
}

export function ItemRow({ img, title, subtitle, badge, badgeColor, onEdit, onDelete, extraLink }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {img !== undefined && (
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
            {img && !img.startsWith("data:")
              ? <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
              : <div className="w-full h-full flex items-center justify-center text-primary/30 text-xs">📷</div>}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">{title}</p>
          {subtitle && <p className="text-base text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{subtitle}</p>}
          {badge && (
            <span className={`mt-2.5 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor || "bg-muted text-muted-foreground"}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
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

export function mergeWithStatic(stored, staticData) {
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
  const staticIds = new Set(staticData.map(s => String(s.id)));
  stored.filter(s => !staticIds.has(String(s.id))).forEach(s => result.push(s));
  return result;
}

export function useCrud(storeKey, staticData) {
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

export const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};
