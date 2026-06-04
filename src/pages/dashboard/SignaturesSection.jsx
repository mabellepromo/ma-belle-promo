import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLocalAuth } from "../../lib/LocalAuth";
import {
  PenTool, X, Trash2, ExternalLink, Send, Clock, CheckCircle2, FileSignature, Info, UserPlus, Edit2,
} from "lucide-react";
import { useSignatures } from "../../hooks/useSignatures";
import { FormPanel, Field, CrudHeader, SectionLoader, inp, sel } from "./shared.jsx";

const STATUT = {
  brouillon: { label: "Brouillon", cls: "bg-muted text-muted-foreground", icon: Clock },
  envoye:    { label: "Envoyé",    cls: "bg-amber-500/15 text-amber-400", icon: Send },
  signe:     { label: "Signé",     cls: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
};

// Types de documents que l'association fait signer
const TYPES = [
  "Convention / Partenariat",
  "PV d'Assemblée",
  "Statuts / Règlement intérieur",
  "Attestation / Contrat",
  "Courrier",
  "Bulletin d'adhésion",
  "Demande de subvention",
  "Convention de bénévolat",
  "Facture",
  "Autre",
];

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function SignaturesSection() {
  const { session } = useLocalAuth();
  const { items, add, update, remove, loading } = useSignatures();
  const [form, setForm] = useState(null);
  const [filtreType, setFiltreType] = useState("Tous");

  const empty = {
    document_titre: "", type: "Convention / Partenariat", signataires: [{ name: "", email: "" }],
    statut: "envoye", date_signature: "", source_url: "", signed_url: "",
  };

  const filtered = filtreType === "Tous" ? items : items.filter(s => s.type === filtreType);

  function setSig(i, k, v) {
    setForm(p => ({ ...p, signataires: p.signataires.map((s, j) => j === i ? { ...s, [k]: v } : s) }));
  }
  function addSig() { setForm(p => ({ ...p, signataires: [...p.signataires, { name: "", email: "" }] })); }
  function removeSig(i) { setForm(p => ({ ...p, signataires: p.signataires.filter((_, j) => j !== i) })); }

  async function doSave() {
    if (!form.document_titre.trim()) { toast.error("Titre du document requis"); return; }
    const signataires = form.signataires.filter(s => s.name.trim() || s.email.trim());
    const payload = {
      document_titre: form.document_titre.trim(),
      type: form.type || null,
      signataires,
      statut: form.statut,
      date_signature: form.statut === "signe" ? (form.date_signature || new Date().toISOString().slice(0, 10)) : null,
      source_url: form.source_url.trim() || null,
      signed_url: form.signed_url.trim() || null,
    };
    if (form._editing) await update(form._editing, payload);
    else await add({ ...payload, created_by: session?.email || null });
    setForm(null);
  }

  function openEdit(s) {
    setForm({
      _editing: s.id,
      document_titre: s.document_titre || "",
      type: s.type || "Convention / Partenariat",
      signataires: (s.signataires?.length ? s.signataires : [{ name: "", email: "" }]),
      statut: s.statut || "envoye",
      date_signature: s.date_signature ? s.date_signature.slice(0, 10) : "",
      source_url: s.source_url || "",
      signed_url: s.signed_url || "",
    });
  }

  if (loading) return <SectionLoader />;

  return (
    <div>
      <CrudHeader title="Signature électronique" count={items.length} onAdd={() => setForm({ ...empty })} />

      <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="mb-1">
            <strong>Comment ça marche</strong> — la signature se fait sur <strong>DocuSeal Cloud</strong> (gratuit,
            jusqu'à 10 documents/mois, aucune installation) ; ce registre garde la trace centralisée.
          </p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Créez et envoyez le document à signer sur
              <a href="https://docuseal.com" target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline mx-1 inline-flex items-center gap-0.5">DocuSeal Cloud <ExternalLink className="w-3 h-3" /></a>
            </li>
            <li>Une fois signé, téléchargez le PDF (ou copiez son lien de partage).</li>
            <li>Enregistrez ici le suivi : document, signataires, statut, et le lien du PDF signé.</li>
          </ol>
        </div>
      </div>

      {form && (
        <FormPanel title={form._editing ? "Modifier le suivi" : "Nouveau suivi de signature"} onClose={() => setForm(null)} onSave={doSave}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Titre du document" required>
              <input className={inp} value={form.document_titre} onChange={e => setForm(p => ({ ...p, document_titre: e.target.value }))}
                placeholder="Ex : Convention — Cabinet X" />
            </Field>
            <Field label="Type de document">
              <select className={sel} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Document à signer (lien vers l'original)">
            <input className={inp} type="url" value={form.source_url} onChange={e => setForm(p => ({ ...p, source_url: e.target.value }))}
              placeholder="https://… (PDF vierge à faire signer)" />
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
                  <input className={inp + " flex-1"} placeholder="email (optionnel)" value={s.email} onChange={e => setSig(i, "email", e.target.value)} />
                  {form.signataires.length > 1 && (
                    <button type="button" onClick={() => removeSig(i)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Statut">
              <select className={sel} value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
                <option value="brouillon">Brouillon</option>
                <option value="envoye">Envoyé en signature</option>
                <option value="signe">Signé</option>
              </select>
            </Field>
            {form.statut === "signe" && (
              <Field label="Date de signature">
                <input type="date" className={inp} value={form.date_signature} onChange={e => setForm(p => ({ ...p, date_signature: e.target.value }))} />
              </Field>
            )}
          </div>
          <Field label="Lien du document signé (PDF)">
            <input className={inp} type="url" value={form.signed_url} onChange={e => setForm(p => ({ ...p, signed_url: e.target.value }))}
              placeholder="https://… (lien DocuSeal ou PDF téléversé)" />
          </Field>
        </FormPanel>
      )}

      {items.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Filtrer :</span>
          <select className={sel + " max-w-[220px] h-8"} value={filtreType} onChange={e => setFiltreType(e.target.value)}>
            <option value="Tous">Tous les types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <FileSignature className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun document suivi. Cliquez sur « Ajouter » après avoir signé un document sur DocuSeal Cloud.</p>
        </div>
      )}

      {items.length > 0 && filtered.length === 0 && (
        <p className="text-center py-10 text-sm text-muted-foreground">Aucun document de ce type.</p>
      )}

      <div className="space-y-3">
        {filtered.map(s => {
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{s.document_titre}</p>
                      {s.type && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/8 text-primary">{s.type}</span>}
                    </div>
                    {s.signataires?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.signataires.map(x => x.name || x.email).filter(Boolean).join(", ")}</p>
                    )}
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
                {s.source_url && (
                  <a href={s.source_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> À signer
                  </a>
                )}
                {s.signed_url && (
                  <a href={s.signed_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Document signé
                  </a>
                )}
                <button onClick={() => openEdit(s)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>
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
