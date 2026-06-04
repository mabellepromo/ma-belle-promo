import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocalAuth } from "../lib/LocalAuth";
import { supabase } from "../lib/supabase";
import {
  Briefcase, MapPin, Calendar, Search, X, Plus, Send, ExternalLink, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHero from "../components/PageHero";

const TYPES = [
  { value: "stage",         label: "Stage" },
  { value: "emploi",        label: "Emploi" },
  { value: "collaboration", label: "Collaboration" },
  { value: "mission",       label: "Mission" },
];
const TYPE_BADGE = {
  stage:         "bg-blue-100 text-blue-700",
  emploi:        "bg-emerald-100 text-emerald-700",
  collaboration: "bg-violet-100 text-violet-700",
  mission:       "bg-amber-100 text-amber-700",
};

function isExpired(o) {
  if (!o.date_limite) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(o.date_limite) < today;
}
function formatDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return iso; }
}

export default function Opportunites() {
  const { session } = useLocalAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [type,    setType]    = useState("Tous");
  const [ville,   setVille]   = useState("Toutes");
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const emptyForm = { titre: "", type: "emploi", structure: "", ville: "", pays: "", specialite: "", description: "", date_limite: "", contact: "" };
  const [form, setForm] = useState(emptyForm);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("opportunites")
      .select("*")
      .eq("statut", "publiee")
      .order("created_at", { ascending: false });
    // On masque les offres dont la date limite est dépassée
    setItems((data ?? []).filter(o => !isExpired(o)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const villes = useMemo(
    () => ["Toutes", ...Array.from(new Set(items.map(o => o.ville).filter(Boolean)))],
    [items]
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(o => {
      const matchSearch = !search
        || [o.titre, o.structure, o.specialite, o.description].join(" ").toLowerCase().includes(s);
      const matchType  = type === "Tous" || o.type === type;
      const matchVille = ville === "Toutes" || o.ville === ville;
      return matchSearch && matchType && matchVille;
    });
  }, [items, search, type, ville]);

  const hasFilters = search || type !== "Tous" || ville !== "Toutes";
  const resetFilters = () => { setSearch(""); setType("Tous"); setVille("Toutes"); };

  async function submitOffer() {
    if (!form.titre.trim()) { toast.error("Le titre est obligatoire."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("opportunites").insert({
        ...form,
        date_limite: form.date_limite || null,
        statut: "en_attente",
        poste_par: session?.nom || session?.email,
        poste_par_email: session?.email,
      });
      if (error) { toast.error("Erreur : " + error.message); return; }
      toast.success("Merci ! Votre offre sera publiée après validation par le bureau.");
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHero title="Opportunités juridiques" subtitle="Stages, emplois, collaborations & missions du réseau" />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Barre d'action + filtres */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm text-muted-foreground">
            {filtered.length} offre{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
          </p>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "#2a6040" }}>
            <Plus className="w-4 h-4" /> Poster une offre
          </button>
        </div>

        {/* Formulaire de soumission (modéré) */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-foreground">Proposer une opportunité</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm sm:col-span-2" placeholder="Titre de l'offre *" value={form.titre} onChange={f("titre")} />
              <select className="h-9 px-3 rounded-lg border border-border bg-background text-sm" value={form.type} onChange={f("type")}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="Spécialité (droit OHADA…)" value={form.specialite} onChange={f("specialite")} />
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="Structure (cabinet, entreprise…)" value={form.structure} onChange={f("structure")} />
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="Contact (email ou lien)" value={form.contact} onChange={f("contact")} />
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="Ville" value={form.ville} onChange={f("ville")} />
              <input className="h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="Pays" value={form.pays} onChange={f("pays")} />
              <textarea className="px-3 py-2 rounded-lg border border-border bg-background text-sm sm:col-span-2 resize-none" rows={3} placeholder="Description" value={form.description} onChange={f("description")} />
              <label className="text-xs text-muted-foreground sm:col-span-2 flex items-center gap-2">
                Date limite de candidature :
                <input type="date" className="h-9 px-3 rounded-lg border border-border bg-background text-sm" value={form.date_limite} onChange={f("date_limite")} />
              </label>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Soumise à validation du bureau avant publication.
              </p>
              <button onClick={submitOffer} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-60"
                style={{ background: "#2a6040" }}>
                <Send className="w-4 h-4" /> {saving ? "Envoi…" : "Soumettre"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Filtres */}
        <div className="bg-muted/40 border border-border rounded-2xl p-4 mb-8">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-background" />
            </div>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Tous">Tous les types</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="flex gap-2">
              <select className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm" value={ville} onChange={(e) => setVille(e.target.value)}>
                {villes.map(v => <option key={v}>{v}</option>)}
              </select>
              {hasFilters && (
                <button onClick={resetFilters} className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* États */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Briefcase className="w-14 h-14 mx-auto mb-5 opacity-20" />
            <p className="font-heading text-2xl font-bold text-foreground/40 mb-2">Aucune offre</p>
            <p className="text-sm max-w-sm mx-auto">
              {hasFilters ? "Aucune offre ne correspond à vos critères." : "Aucune opportunité publiée pour l'instant. Soyez le premier à en proposer une !"}
            </p>
            {hasFilters && <button onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline">Réinitialiser les filtres</button>}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((o, i) => {
              const contactIsLink = o.contact && /^https?:\/\//.test(o.contact);
              const contactHref = o.contact ? (contactIsLink ? o.contact : `mailto:${o.contact}`) : null;
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[o.type] || "bg-gray-100 text-gray-700"}`}>
                      {TYPES.find(t => t.value === o.type)?.label || o.type}
                    </span>
                    {o.specialite && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{o.specialite}</span>}
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{o.titre}</h3>
                  <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                    {o.structure && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {o.structure}</span>}
                    {(o.ville || o.pays) && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {[o.ville, o.pays].filter(Boolean).join(", ")}</span>}
                    {o.date_limite && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Limite : {formatDate(o.date_limite)}</span>}
                  </div>
                  {o.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-3">{o.description}</p>}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    {o.poste_par && <span className="text-xs text-muted-foreground truncate">par {o.poste_par}</span>}
                    {contactHref && (
                      <a href={contactHref} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline flex-shrink-0">
                        Postuler <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
