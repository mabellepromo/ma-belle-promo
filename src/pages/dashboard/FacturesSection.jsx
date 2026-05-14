import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { genererFacture } from "../../lib/documentGenerators";
import { Field, inp, ta, sel } from "./shared";
import {
  Plus, Eye, Edit2, Trash2, FileText, CheckCircle2, Clock,
  X, Save, Minus, PlusCircle, Receipt,
} from "lucide-react";

const STATUT_CONFIG = {
  brouillon: { label: "Brouillon", color: "bg-muted/60 text-muted-foreground",       dot: "bg-muted-foreground/40" },
  émise:     { label: "Émise",     color: "bg-blue-500/15 text-blue-400",             dot: "bg-blue-500" },
  payée:     { label: "Payée",     color: "bg-emerald-500/15 text-emerald-400",       dot: "bg-emerald-500" },
  annulée:   { label: "Annulée",   color: "bg-red-500/15 text-red-400",               dot: "bg-red-500" },
};

const DEFAULT_FORM = {
  client_nom: "", client_adresse: "", client_email: "", client_telephone: "",
  date_emission: new Date().toISOString().slice(0, 10),
  date_echeance: "", objet: "",
  tva_active: false, tva_taux: 18,
  mode_reglement: "", notes: "",
  statut: "brouillon",
};
const DEFAULT_LIGNE = { description: "", quantite: 1, prix_unitaire: 0 };

function fmt(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " FCFA";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function FacturesSection() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ ...DEFAULT_FORM });
  const [lignes, setLignes]     = useState([{ ...DEFAULT_LIGNE }]);
  const [saving, setSaving]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("factures")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erreur chargement : " + error.message);
    else setFactures(data ?? []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const totalFacture = factures.reduce((s, f) => s + (f.montant_ttc || 0), 0);
    const emises       = factures.filter(f => f.statut === "émise").length;
    const payees       = factures.filter(f => f.statut === "payée").length;
    const totalPercu   = factures.filter(f => f.statut === "payée").reduce((s, f) => s + (f.montant_ttc || 0), 0);
    return { count: factures.length, totalFacture, emises, payees, totalPercu };
  }, [factures]);

  function nextNumero() {
    const yr = new Date().getFullYear();
    const nums = factures
      .filter(f => f.numero?.startsWith(`F-${yr}-`))
      .map(f => parseInt(f.numero.split("-")[2] || "0", 10))
      .filter(n => !isNaN(n));
    return `F-${yr}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
  }

  function calcMontants(ls, tvaActive, tvaTaux) {
    const ht  = ls.reduce((s, l) => s + ((l.quantite || 0) * (l.prix_unitaire || 0)), 0);
    const tva = tvaActive ? ht * (tvaTaux / 100) : 0;
    return { montant_ht: ht, montant_ttc: ht + tva };
  }

  function openNew() {
    setEditing(null);
    setForm({ ...DEFAULT_FORM });
    setLignes([{ ...DEFAULT_LIGNE }]);
    setShowForm(true);
  }

  function openEdit(f) {
    setEditing(f);
    setForm({
      client_nom:       f.client_nom       || "",
      client_adresse:   f.client_adresse   || "",
      client_email:     f.client_email     || "",
      client_telephone: f.client_telephone || "",
      date_emission:    f.date_emission    || "",
      date_echeance:    f.date_echeance    || "",
      objet:            f.objet            || "",
      tva_active:       f.tva_active       ?? false,
      tva_taux:         f.tva_taux         ?? 18,
      mode_reglement:   f.mode_reglement   || "",
      notes:            f.notes            || "",
      statut:           f.statut           || "brouillon",
    });
    setLignes(f.lignes?.length ? f.lignes : [{ ...DEFAULT_LIGNE }]);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.client_nom.trim()) { toast.error("Le nom du client est obligatoire."); return; }
    if (!lignes.some(l => l.description.trim())) { toast.error("Ajoutez au moins une prestation."); return; }
    setSaving(true);
    const { montant_ht, montant_ttc } = calcMontants(lignes, form.tva_active, form.tva_taux);
    const payload = { ...form, lignes, montant_ht, montant_ttc };
    if (editing) {
      const { error } = await supabase.from("factures").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erreur : " + error.message); setSaving(false); return; }
      toast.success("Facture mise à jour.");
    } else {
      const { error } = await supabase.from("factures").insert({ ...payload, numero: nextNumero() });
      if (error) { toast.error("Erreur : " + error.message); setSaving(false); return; }
      toast.success("Facture créée.");
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("factures").delete().eq("id", id);
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Facture supprimée."); load(); }
    setConfirmDel(null);
  }

  function setLigne(i, field, value) {
    setLignes(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  const totalHT   = lignes.reduce((s, l) => s + ((l.quantite || 0) * (l.prix_unitaire || 0)), 0);
  const montantTV = form.tva_active ? totalHT * (form.tva_taux / 100) : 0;
  const totalTTC  = totalHT + montantTV;

  function previewCurrent() {
    const { montant_ht, montant_ttc } = calcMontants(lignes, form.tva_active, form.tva_taux);
    genererFacture({ ...form, numero: editing?.numero ?? nextNumero(), lignes, montant_ht, montant_ttc });
  }

  // ── KPI cards config
  const KPI = [
    { icon: FileText,     bg: "bg-primary/15",      text: "text-primary",      bar: "bg-primary",      value: stats.count,                           label: "Total factures"  },
    { icon: Clock,        bg: "bg-blue-500/15",      text: "text-blue-400",     bar: "bg-blue-500",     value: stats.emises,                          label: "Émises"          },
    { icon: CheckCircle2, bg: "bg-emerald-500/15",   text: "text-emerald-400",  bar: "bg-emerald-500",  value: stats.payees,                          label: "Payées"          },
    { icon: Receipt,      bg: "bg-amber-500/15",     text: "text-amber-400",    bar: "bg-amber-500",    value: stats.totalPercu.toLocaleString("fr-FR"), label: "Perçu (FCFA)" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Factures</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Émission et suivi des prestations facturées</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Nouvelle facture
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map(({ icon: Icon, bg, text, bar, value, label }) => (
          <div key={label} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
            <div className={`h-1 w-full ${bar}`} />
            <div className="p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${text}`} />
              </div>
              <div className="font-heading text-2xl font-black text-foreground leading-tight">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-sm text-foreground">Liste des factures</p>
          <span className="text-xs text-muted-foreground">{factures.length} facture{factures.length > 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement…</div>
        ) : factures.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Aucune facture pour l'instant.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Cliquez sur « Nouvelle facture » pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">N°</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Objet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Montant</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {factures.map(f => {
                  const sc = STATUT_CONFIG[f.statut] ?? STATUT_CONFIG.brouillon;
                  return (
                    <tr key={f.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{f.numero}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{f.client_nom}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate hidden md:table-cell">{f.objet || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap hidden lg:table-cell">{fmtDate(f.date_emission)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-foreground whitespace-nowrap">{fmt(f.montant_ttc)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => genererFacture(f)} title="Aperçu PDF"
                            className="p-1.5 rounded-lg hover:bg-primary/15 text-primary transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(f)} title="Modifier"
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDel(f.id)} title="Supprimer"
                            className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Formulaire (panneau latéral) ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="w-full max-w-2xl bg-card h-full flex flex-col shadow-2xl">

            {/* Entête du panneau */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
              <div>
                <h3 className="font-heading font-bold text-foreground">
                  {editing ? "Modifier la facture" : "Nouvelle facture"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? editing.numero : `Sera enregistrée sous : ${nextNumero()}`}
                </p>
              </div>
              <button onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

              {/* Destinataire */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary mb-3">Destinataire</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="Nom / Raison sociale" required>
                      <input className={inp} value={form.client_nom}
                        onChange={e => setForm(f => ({ ...f, client_nom: e.target.value }))}
                        placeholder="ex : Ministère de la Justice, Lomé" />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="Adresse">
                      <input className={inp} value={form.client_adresse}
                        onChange={e => setForm(f => ({ ...f, client_adresse: e.target.value }))}
                        placeholder="Rue, ville, pays" />
                    </Field>
                  </div>
                  <Field label="Email">
                    <input className={inp} type="email" value={form.client_email}
                      onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                      placeholder="contact@exemple.com" />
                  </Field>
                  <Field label="Téléphone">
                    <input className={inp} value={form.client_telephone}
                      onChange={e => setForm(f => ({ ...f, client_telephone: e.target.value }))}
                      placeholder="+228 …" />
                  </Field>
                </div>
              </section>

              {/* Informations facture */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary mb-3">Informations</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date d'émission" required>
                    <input className={inp} type="date" value={form.date_emission}
                      onChange={e => setForm(f => ({ ...f, date_emission: e.target.value }))} />
                  </Field>
                  <Field label="Date d'échéance">
                    <input className={inp} type="date" value={form.date_echeance}
                      onChange={e => setForm(f => ({ ...f, date_echeance: e.target.value }))} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Objet">
                      <input className={inp} value={form.objet}
                        onChange={e => setForm(f => ({ ...f, objet: e.target.value }))}
                        placeholder="ex : Formation juridique, Organisation de conférence…" />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Lignes de prestation */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Prestations</h4>
                  <button onClick={() => setLignes(ls => [...ls, { ...DEFAULT_LIGNE }])}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_60px_84px_84px_24px] gap-2 px-1 text-[10px] font-semibold text-muted-foreground">
                    <span>Description</span>
                    <span className="text-right">Qté</span>
                    <span className="text-right">P. unitaire</span>
                    <span className="text-right">Total</span>
                    <span />
                  </div>
                  {lignes.map((l, i) => {
                    const total = (l.quantite || 0) * (l.prix_unitaire || 0);
                    return (
                      <div key={i} className="grid grid-cols-[1fr_60px_84px_84px_24px] gap-2 items-center bg-muted/20 rounded-xl p-2">
                        <input className={inp + " bg-background text-xs"}
                          placeholder="Description de la prestation"
                          value={l.description}
                          onChange={e => setLigne(i, "description", e.target.value)} />
                        <input className={inp + " bg-background text-xs text-right"}
                          type="number" min="1" step="1"
                          value={l.quantite}
                          onChange={e => setLigne(i, "quantite", parseInt(e.target.value) || 1)} />
                        <input className={inp + " bg-background text-xs text-right"}
                          type="number" min="0" step="500"
                          value={l.prix_unitaire}
                          onChange={e => setLigne(i, "prix_unitaire", parseFloat(e.target.value) || 0)} />
                        <div className="h-9 flex items-center justify-end pr-1 text-xs font-bold text-foreground whitespace-nowrap">
                          {total.toLocaleString("fr-FR")}
                        </div>
                        <button onClick={() => setLignes(ls => ls.filter((_, j) => j !== i))}
                          disabled={lignes.length === 1}
                          className="p-0.5 rounded hover:text-red-400 text-muted-foreground/40 disabled:opacity-20 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Totaux en temps réel */}
                <div className="mt-4 flex flex-col items-end gap-2">
                  <div className="flex justify-between w-56 text-xs text-muted-foreground">
                    <span>Sous-total HT</span>
                    <span className="font-semibold text-foreground">{fmt(totalHT)}</span>
                  </div>

                  <div className="flex justify-between w-56 items-center text-xs">
                    <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer select-none">
                      <input type="checkbox" checked={form.tva_active}
                        onChange={e => setForm(f => ({ ...f, tva_active: e.target.checked }))}
                        className="rounded accent-primary" />
                      TVA
                      {form.tva_active && (
                        <span className="flex items-center gap-0.5 ml-1">
                          <input type="number" min="0" max="100" step="1"
                            className="w-10 h-6 border border-border rounded bg-background text-right px-1 text-xs"
                            value={form.tva_taux}
                            onChange={e => setForm(f => ({ ...f, tva_taux: parseFloat(e.target.value) || 0 }))} />
                          <span>%</span>
                        </span>
                      )}
                    </label>
                    <span className="font-semibold text-foreground">
                      {form.tva_active ? fmt(montantTV) : <span className="text-muted-foreground/60 italic">N/A</span>}
                    </span>
                  </div>

                  <div className="flex justify-between w-56 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
                    <span className="text-xs font-bold text-foreground">{form.tva_active ? "Total TTC" : "Total HT"}</span>
                    <span className="text-sm font-black text-primary">{fmt(totalTTC)}</span>
                  </div>
                </div>
              </section>

              {/* Règlement + statut + notes */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary mb-3">Règlement & statut</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Mode de règlement">
                    <select className={sel} value={form.mode_reglement}
                      onChange={e => setForm(f => ({ ...f, mode_reglement: e.target.value }))}>
                      <option value="">— Choisir —</option>
                      <option value="Virement bancaire">Virement bancaire</option>
                      <option value="Mobile Money (Flooz / T-Money)">Mobile Money (Flooz / T-Money)</option>
                      <option value="Espèces">Espèces</option>
                      <option value="Chèque">Chèque</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </Field>
                  <Field label="Statut de la facture">
                    <select className={sel} value={form.statut}
                      onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                      <option value="brouillon">Brouillon</option>
                      <option value="émise">Émise</option>
                      <option value="payée">Payée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </Field>
                </div>
                <Field label="Notes / conditions particulières">
                  <textarea className={ta} rows={3} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="ex : Paiement à 30 jours, coordonnées bancaires, conditions spéciales…" />
                </Field>
              </section>
            </div>

            {/* Pied du panneau */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 flex-shrink-0 bg-muted/10">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                Annuler
              </button>
              <div className="flex items-center gap-2">
                <button onClick={previewCurrent}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-all">
                  <Eye className="w-4 h-4" /> Aperçu
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-[0.98]">
                  <Save className="w-4 h-4" />
                  {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="font-heading font-bold text-foreground mb-2">Supprimer cette facture ?</h4>
            <p className="text-sm text-muted-foreground mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDel(null)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDel)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
