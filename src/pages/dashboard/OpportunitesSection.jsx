import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Calendar, User, Check, X, Edit2, Trash2, AlertTriangle,
} from "lucide-react";
import { useOpportunites } from "../../hooks/useOpportunites";
import { FormPanel, Field, CrudHeader, SectionLoader, inp, ta, sel } from "./shared.jsx";

const TYPES = [
  { value: "stage",         label: "Stage" },
  { value: "emploi",        label: "Emploi" },
  { value: "collaboration", label: "Collaboration" },
  { value: "mission",       label: "Mission" },
];

const TYPE_BADGE = {
  stage:         "bg-blue-500/15 text-blue-400",
  emploi:        "bg-emerald-500/15 text-emerald-400",
  collaboration: "bg-violet-500/15 text-violet-400",
  mission:       "bg-amber-500/15 text-amber-400",
};

function isExpired(o) {
  if (!o.date_limite) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(o.date_limite) < today;
}

function statutLabel(o) {
  if (o.statut === "publiee" && isExpired(o)) return { label: "Expirée", cls: "bg-muted text-muted-foreground" };
  return {
    en_attente: { label: "En attente", cls: "bg-amber-500/15 text-amber-400" },
    publiee:    { label: "Publiée",    cls: "bg-emerald-500/15 text-emerald-400" },
    expiree:    { label: "Expirée",    cls: "bg-muted text-muted-foreground" },
    refusee:    { label: "Refusée",    cls: "bg-red-500/15 text-red-400" },
  }[o.statut] || { label: o.statut, cls: "bg-muted text-muted-foreground" };
}

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function OpportunitesSection() {
  const { items, add, update, remove, publish, refuse, loading } = useOpportunites();
  const [form, setForm] = useState(null);

  const empty = {
    titre: "", type: "emploi", structure: "", ville: "", pays: "", specialite: "",
    description: "", date_limite: "", contact: "", poste_par: "Bureau", statut: "publiee",
  };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const enAttente = useMemo(() => items.filter(o => o.statut === "en_attente"), [items]);
  const autres    = useMemo(() => items.filter(o => o.statut !== "en_attente"), [items]);

  async function doSave() {
    if (!form.titre) { toast.error("Titre obligatoire"); return; }
    const payload = { ...form, date_limite: form.date_limite || null };
    if (form._editing) await update(form._editing, { ...payload, _editing: undefined });
    else await add(payload);
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  const Card = ({ o, moderation }) => {
    const s = statutLabel(o);
    const tb = TYPE_BADGE[o.type] || "bg-muted text-muted-foreground";
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tb}`}>{TYPES.find(t => t.value === o.type)?.label || o.type}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
            </div>
            <p className="font-bold text-foreground">{o.titre}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {o.structure && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {o.structure}</span>}
              {(o.ville || o.pays) && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {[o.ville, o.pays].filter(Boolean).join(", ")}</span>}
              {o.specialite && <span>{o.specialite}</span>}
              {o.date_limite && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> limite {formatDate(o.date_limite)}</span>}
              {o.poste_par && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {o.poste_par}</span>}
            </div>
            {o.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{o.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/60 justify-end flex-wrap">
          {moderation && (
            <>
              <button onClick={() => publish(o.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-colors">
                <Check className="w-3.5 h-3.5" /> Publier
              </button>
              <button onClick={() => refuse(o.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/15 transition-colors">
                <X className="w-3.5 h-3.5" /> Refuser
              </button>
            </>
          )}
          <button onClick={() => setForm({ ...o, _editing: o.id, date_limite: o.date_limite || "" })}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
          <button onClick={() => remove(o.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/15 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      <CrudHeader title="Opportunités" count={items.length} onAdd={() => setForm({ ...empty })} />

      {form && (
        <FormPanel
          title={form._editing ? "Modifier l'opportunité" : "Nouvelle opportunité"}
          onClose={() => setForm(null)}
          onSave={doSave}
        >
          <Field label="Titre" required>
            <input className={inp} value={form.titre} onChange={f("titre")} placeholder="Ex : Stage en droit OHADA" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select className={sel} value={form.type} onChange={f("type")}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Spécialité">
              <input className={inp} value={form.specialite} onChange={f("specialite")} placeholder="Droit des affaires, public…" />
            </Field>
          </div>
          <Field label="Structure">
            <input className={inp} value={form.structure} onChange={f("structure")} placeholder="Cabinet, entreprise, juridiction…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ville">
              <input className={inp} value={form.ville} onChange={f("ville")} />
            </Field>
            <Field label="Pays">
              <input className={inp} value={form.pays} onChange={f("pays")} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={ta} rows={4} value={form.description} onChange={f("description")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date limite">
              <input type="date" className={inp} value={form.date_limite || ""} onChange={f("date_limite")} />
            </Field>
            <Field label="Contact (email ou lien)">
              <input className={inp} value={form.contact} onChange={f("contact")} placeholder="email@… ou https://…" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Posté par">
              <input className={inp} value={form.poste_par} onChange={f("poste_par")} />
            </Field>
            <Field label="Statut">
              <select className={sel} value={form.statut} onChange={f("statut")}>
                <option value="en_attente">En attente</option>
                <option value="publiee">Publiée</option>
                <option value="refusee">Refusée</option>
              </select>
            </Field>
          </div>
        </FormPanel>
      )}

      {enAttente.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">À modérer</h3>
            <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">{enAttente.length}</span>
          </div>
          <div className="space-y-3">
            {enAttente.map(o => <Card key={o.id} o={o} moderation />)}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune opportunité pour le moment.</p>
        </div>
      )}

      {autres.length > 0 && (
        <div className="space-y-3">
          {enAttente.length > 0 && <h3 className="text-sm font-bold text-foreground mb-1">Toutes les offres</h3>}
          {autres.map(o => <Card key={o.id} o={o} />)}
        </div>
      )}
    </div>
  );
}
