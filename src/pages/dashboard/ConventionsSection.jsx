import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Handshake, Calendar, Mail, Phone, Edit2, Trash2, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useConventions } from "../../hooks/useConventions";
import { FormPanel, Field, CrudHeader, SectionLoader, inp, ta, sel } from "./shared.jsx";

const STATUTS = [
  { value: "active",       label: "Active" },
  { value: "a_renouveler", label: "À renouveler" },
  { value: "expiree",      label: "Expirée" },
];

// Calcule l'urgence visuelle d'une convention selon son échéance et son statut
function urgence(conv) {
  if (conv.statut === "expiree") {
    return { key: "expiree", label: "Expirée", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
  }
  if (!conv.date_echeance) {
    return { key: "sans", label: "Sans échéance", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ech   = new Date(conv.date_echeance);
  const jours = Math.ceil((ech - today) / 86400000);

  if (jours < 0)  return { key: "expiree", label: `Expirée depuis ${-jours} j`, cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
  if (jours <= 7) return { key: "j7",  label: `J-${jours} · urgent`, cls: "bg-red-500/15 text-red-400 border border-red-500/25", dot: "bg-red-500" };
  if (jours <= 30) return { key: "j30", label: `J-${jours}`, cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25", dot: "bg-amber-500" };
  return { key: "ok", label: `J-${jours}`, cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "bg-emerald-500" };
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

export default function ConventionsSection() {
  const { items, add, update, remove, loading } = useConventions();
  const [form, setForm] = useState(null);

  const empty = {
    partenaire_nom: "", objet: "", date_debut: "", date_echeance: "",
    statut: "active", contact_email: "", contact_whatsapp: "", montant: "", notes: "",
  };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // Conventions à renouveler en priorité (J-30 / J-7 / expirée hors statut déjà « expiree »)
  const aRenouveler = useMemo(
    () => items.filter(c => {
      const u = urgence(c);
      return u.key === "j7" || u.key === "j30" || u.key === "expiree";
    }).length,
    [items]
  );

  async function doSave() {
    if (!form.partenaire_nom) { toast.error("Nom du partenaire obligatoire"); return; }
    const payload = {
      ...form,
      // Postgres refuse "" pour date/numeric : on convertit en null
      date_debut:    form.date_debut    || null,
      date_echeance: form.date_echeance || null,
      montant:       form.montant === "" ? null : Number(form.montant),
    };
    if (form._editing) await update(form._editing, { ...payload, _editing: undefined });
    else await add(payload);
    setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader
        title="Conventions & partenariats"
        count={items.length}
        onAdd={() => setForm({ ...empty })}
      />

      {aRenouveler > 0 && (
        <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{aRenouveler}</span> convention{aRenouveler > 1 ? "s" : ""} à surveiller (échéance proche ou dépassée).
          </p>
        </div>
      )}

      {form && (
        <FormPanel
          title={form._editing ? "Modifier la convention" : "Nouvelle convention"}
          onClose={() => setForm(null)}
          onSave={doSave}
        >
          <Field label="Partenaire" required>
            <input className={inp} value={form.partenaire_nom} onChange={f("partenaire_nom")} placeholder="Nom de l'organisation" />
          </Field>
          <Field label="Objet de la convention">
            <input className={inp} value={form.objet} onChange={f("objet")} placeholder="Ex : mécénat, mise à disposition de locaux…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de début">
              <input type="date" className={inp} value={form.date_debut || ""} onChange={f("date_debut")} />
            </Field>
            <Field label="Date d'échéance">
              <input type="date" className={inp} value={form.date_echeance || ""} onChange={f("date_echeance")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Statut">
              <select className={sel} value={form.statut} onChange={f("statut")}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Montant (FCFA)">
              <input type="number" className={inp} value={form.montant} onChange={f("montant")} placeholder="Optionnel" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email du contact">
              <input type="email" className={inp} value={form.contact_email} onChange={f("contact_email")} placeholder="contact@partenaire.org" />
            </Field>
            <Field label="WhatsApp du contact">
              <input className={inp} value={form.contact_whatsapp} onChange={f("contact_whatsapp")} placeholder="+228 …" />
            </Field>
          </div>
          <Field label="Notes internes">
            <textarea className={ta} rows={3} value={form.notes} onChange={f("notes")} placeholder="Historique, conditions, interlocuteurs…" />
          </Field>
        </FormPanel>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <Handshake className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune convention enregistrée.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(c => {
          const u = urgence(c);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-background border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{c.partenaire_nom}</p>
                    {c.objet && <p className="text-sm text-muted-foreground truncate">{c.objet}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(c.date_debut)} → {formatDate(c.date_echeance)}
                      </span>
                      {c.contact_email && (
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.contact_email}</span>
                      )}
                      {c.contact_whatsapp && (
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.contact_whatsapp}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${u.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`} />
                    {u.label}
                  </span>
                  {u.key === "ok" && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> À jour</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/60 justify-end">
                <button onClick={() => setForm({ ...c, _editing: c.id, montant: c.montant ?? "" })}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>
                <button onClick={() => remove(c.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/15 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
