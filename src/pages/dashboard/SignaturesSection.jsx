import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  PenTool, X, Trash2, Download, Send, Clock, CheckCircle2, FileSignature, Info, UserPlus,
} from "lucide-react";
import { useSignatures } from "../../hooks/useSignatures";
import { FormPanel, Field, CrudHeader, SectionLoader, inp } from "./shared.jsx";

const STATUT = {
  brouillon: { label: "Brouillon", cls: "bg-muted text-muted-foreground", icon: Clock },
  envoye:    { label: "Envoyé",    cls: "bg-amber-500/15 text-amber-400", icon: Send },
  signe:     { label: "Signé",     cls: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
};

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function SignaturesSection() {
  const { items, send, openDocument, remove, loading } = useSignatures();
  const [form, setForm] = useState(null);

  const empty = { document_titre: "", template_id: "", signataires: [{ name: "", email: "" }] };

  function setSig(i, k, v) {
    setForm(p => ({ ...p, signataires: p.signataires.map((s, j) => j === i ? { ...s, [k]: v } : s) }));
  }
  function addSig() { setForm(p => ({ ...p, signataires: [...p.signataires, { name: "", email: "" }] })); }
  function removeSig(i) { setForm(p => ({ ...p, signataires: p.signataires.filter((_, j) => j !== i) })); }

  async function doSend() {
    if (!form.document_titre.trim()) { toast.error("Titre du document requis"); return; }
    if (!form.template_id.trim()) { toast.error("ID du modèle DocuSeal requis"); return; }
    const signataires = form.signataires.filter(s => s.email.trim());
    if (signataires.length === 0) { toast.error("Au moins un signataire avec email"); return; }
    const ok = await send({ document_titre: form.document_titre, template_id: form.template_id, signataires });
    if (ok) setForm(null);
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Signature électronique" count={items.length} onAdd={() => setForm({ ...empty })} />

      <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Signature via <strong>DocuSeal</strong> (open-source, auto-hébergé). Préparez d'abord vos
          modèles (Convention, PV, statuts) dans DocuSeal en y plaçant les champs de signature, puis
          renseignez ici l'<strong>ID du modèle</strong>. Voir le guide de déploiement
          <code className="text-primary mx-1">docs/docuseal-oracle-deploiement.md</code>.
        </p>
      </div>

      {form && (
        <FormPanel title="Envoyer en signature" onClose={() => setForm(null)} onSave={doSend}>
          <Field label="Titre du document" required>
            <input className={inp} value={form.document_titre} onChange={e => setForm(p => ({ ...p, document_titre: e.target.value }))}
              placeholder="Ex : Convention de partenariat — Cabinet X" />
          </Field>
          <Field label="ID du modèle DocuSeal" required>
            <input className={inp} value={form.template_id} onChange={e => setForm(p => ({ ...p, template_id: e.target.value }))}
              placeholder="Ex : 1000001" />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">Signataires</label>
              <button type="button" onClick={addSig} className="text-xs text-primary hover:underline flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {form.signataires.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inp + " flex-1"} placeholder="Nom" value={s.name} onChange={e => setSig(i, "name", e.target.value)} />
                  <input className={inp + " flex-1"} type="email" placeholder="email@…" value={s.email} onChange={e => setSig(i, "email", e.target.value)} />
                  {form.signataires.length > 1 && (
                    <button type="button" onClick={() => removeSig(i)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FormPanel>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <FileSignature className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune demande de signature.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(s => {
          const st = STATUT[s.statut] || STATUT.brouillon;
          const StIcon = st.icon;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-background border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <PenTool className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{s.document_titre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(s.signataires || []).map(x => x.name || x.email).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé le {formatDate(s.created_at)}{s.date_signature ? ` · signé le ${formatDate(s.date_signature)}` : ""}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls} flex-shrink-0`}>
                  <StIcon className="w-3.5 h-3.5" /> {st.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/60 justify-end">
                {s.statut === "signe" && (
                  <button onClick={() => openDocument(s.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Document signé
                  </button>
                )}
                <button onClick={() => remove(s.id)}
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
