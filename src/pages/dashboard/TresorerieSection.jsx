import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet,
  X, Loader2, RefreshCw, Lock, FileText, Target, Receipt, Landmark
} from "lucide-react";
import { inp, Field } from "./shared";
import { genererRapportTresorerie } from "@/lib/documentGenerators";
import { useConfirm } from "@/hooks/useConfirm";

const CATEGORIES_RECETTES = ["Cotisations", "Dons", "Subventions", "Sponsoring", "Événements", "Autres"];
const CATEGORIES_DEPENSES = ["Événements", "Administration", "Communication", "Matériel", "Transport", "Restauration", "Autres"];

const CAT_COLORS = {
  Cotisations:   "bg-emerald-500/15 text-emerald-400",
  Dons:          "bg-blue-500/15 text-blue-400",
  Subventions:   "bg-indigo-500/15 text-indigo-400",
  Sponsoring:    "bg-violet-500/15 text-violet-400",
  Événements:    "bg-amber-500/15 text-amber-400",
  Administration:"bg-muted/60 text-muted-foreground",
  Communication: "bg-cyan-500/15 text-cyan-400",
  Matériel:      "bg-orange-500/15 text-orange-400",
  Transport:     "bg-rose-500/15 text-rose-400",
  Restauration:  "bg-pink-500/15 text-pink-400",
  Autres:        "bg-muted/60 text-muted-foreground",
};

const fmt = n => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(Math.abs(n)) + " FCFA";

const REMBOURS_CFG = {
  en_attente: { label: "En attente",  cls: "bg-amber-500/15 text-amber-400"     },
  approuvé:   { label: "Approuvé",    cls: "bg-blue-500/15 text-blue-400"       },
  remboursé:  { label: "Remboursé",   cls: "bg-emerald-500/15 text-emerald-400" },
  rejeté:     { label: "Rejeté",      cls: "bg-red-500/15 text-red-400"         },
};

const emptyRembForm = {
  demandeur: "", motif: "", montant: "",
  date_demande: new Date().toISOString().slice(0, 10), notes: "",
};

const SUB_STATUT_CFG = {
  en_attente:         { label: "En attente",          cls: "bg-amber-500/15 text-amber-400"     },
  "partiellement_reçu": { label: "Partiellement reçu", cls: "bg-blue-500/15 text-blue-400"       },
  reçu:               { label: "Reçu",                cls: "bg-emerald-500/15 text-emerald-400" },
  clôturé:            { label: "Clôturé",             cls: "bg-muted/60 text-muted-foreground"  },
};

const emptySubForm = {
  organisme: "", objet: "", montant_accorde: "", montant_recu: "0",
  date_accord: "", date_echeance: "", statut: "en_attente", notes: "",
};

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{fmt(value)}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  type: "recette", categorie: "", libelle: "", montant: "",
  date: new Date().toISOString().slice(0, 10), description: "", piece_url: ""
};

// ── Tab Transactions ─────────────────────────────────────────────────────────
function TransactionsTab({ year }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("");
  const { confirm, ConfirmEl } = useConfirm();

  async function loadTransactions() {
    setLoading(true);
    const { data } = await supabase
      .from("tresorerie_transactions")
      .select("*")
      .eq("annee", year)
      .order("date", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }

  useEffect(() => { loadTransactions(); }, [year]);

  const stats = useMemo(() => {
    const recettes = transactions.filter(t => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0);
    const depenses = transactions.filter(t => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);
    return { recettes, depenses, solde: recettes - depenses };
  }, [transactions]);

  const filtered = useMemo(() => transactions.filter(t => {
    if (filter !== "all" && t.type !== filter) return false;
    if (catFilter && t.categorie !== catFilter) return false;
    return true;
  }), [transactions, filter, catFilter]);

  async function handleSave() {
    if (!form.libelle.trim()) { toast.error("Le libellé est obligatoire."); return; }
    if (!form.categorie)       { toast.error("La catégorie est obligatoire."); return; }
    if (!form.montant || isNaN(Number(form.montant)) || Number(form.montant) <= 0) { toast.error("Montant invalide."); return; }
    if (!form.date)            { toast.error("La date est obligatoire."); return; }
    setSaving(true);
    const { error } = await supabase.from("tresorerie_transactions").insert({
      type: form.type, categorie: form.categorie, libelle: form.libelle.trim(),
      montant: Number(form.montant), date: form.date,
      description: form.description?.trim() || null,
      piece_url: form.piece_url?.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Transaction enregistrée.");
    setForm(null);
    loadTransactions();
  }

  async function handleDelete(id) {
    if (!await confirm("Supprimer cette transaction ?", "Cette action est irréversible.")) return;
    await supabase.from("tresorerie_transactions").delete().eq("id", id);
    toast.success("Transaction supprimée.");
    loadTransactions();
  }

  function exportCSV() {
    if (!transactions.length) { toast.info("Aucune donnée à exporter."); return; }
    const headers = ["Date", "Type", "Catégorie", "Libellé", "Montant (FCFA)", "Description"];
    const rows = transactions.map(t => [
      t.date, t.type === "recette" ? "Recette" : "Dépense",
      t.categorie, t.libelle, t.montant, t.description || "",
    ]);
    const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `tresorerie-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {ConfirmEl}
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} title="Exporter CSV"
            className="w-9 h-9 rounded-xl border border-border hover:bg-emerald-500/15 flex items-center justify-center text-muted-foreground hover:text-emerald-400 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setForm({ ...emptyForm })}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Bannière sync */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-xs text-emerald-400">
        <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
        Les cotisations validées apparaissent automatiquement ici. Pour les modifier, allez dans <strong className="mx-0.5">Cotisations</strong>.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Recettes" value={stats.recettes} icon={TrendingUp} color="bg-emerald-500/15 text-emerald-400"
          sub={`${transactions.filter(t => t.type === "recette").length} opération(s)`} />
        <StatCard label="Dépenses" value={stats.depenses} icon={TrendingDown} color="bg-red-500/15 text-red-400"
          sub={`${transactions.filter(t => t.type === "depense").length} opération(s)`} />
        <StatCard label="Solde" value={stats.solde} icon={Wallet}
          color={stats.solde >= 0 ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}
          sub={stats.solde >= 0 ? "Excédent" : "Déficit"} />
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Nouvelle transaction</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              {["recette", "depense"].map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t, categorie: "" }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === t
                      ? t === "recette" ? "border-emerald-500 bg-emerald-500/15 text-emerald-400" : "border-red-400 bg-red-500/15 text-red-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}>
                  {t === "recette" ? "⬆ Recette" : "⬇ Dépense"}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Libellé *">
                <input className={inp} value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex : Don Membre Dupont" />
              </Field>
              <Field label="Catégorie *">
                <select className={inp} value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {(form.type === "recette" ? CATEGORIES_RECETTES : CATEGORIES_DEPENSES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Montant (FCFA) *">
                <input className={inp} type="number" min="1" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="Date *">
                <input className={inp} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description (optionnelle)">
                  <textarea className={inp} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Détails…" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Pièce justificative (URL)">
                  <input className={inp} value={form.piece_url} onChange={e => setForm(p => ({ ...p, piece_url: e.target.value }))} placeholder="https://…" />
                </Field>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {[{ key: "all", label: "Toutes" }, { key: "recette", label: "Recettes" }, { key: "depense", label: "Dépenses" }].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setCatFilter(""); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
            {f.label}
          </button>
        ))}
        {catFilter && (
          <button onClick={() => setCatFilter("")} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-primary/30 bg-primary/5 text-primary">
            {catFilter} <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucune transaction pour {year}.</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter" pour enregistrer une recette ou une dépense.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Libellé</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Catégorie</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Montant</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map(t => {
                const isAuto = !!t.source_ref;
                return (
                  <tr key={t.id} className={`hover:bg-muted/20 transition-colors ${isAuto ? "bg-emerald-500/15/30" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{t.libelle}</p>
                        {isAuto && (
                          <span title="Synchronisé depuis les cotisations"
                            className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                            <RefreshCw className="w-2.5 h-2.5" /> sync
                          </span>
                        )}
                      </div>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button onClick={() => setCatFilter(t.categorie)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-80 ${CAT_COLORS[t.categorie] || "bg-muted/60 text-muted-foreground"}`}>
                        {t.categorie}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      <span className={t.type === "recette" ? "text-emerald-400" : "text-red-500"}>
                        {t.type === "recette" ? "+" : "−"}{fmt(t.montant)}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {isAuto ? (
                        <div className="w-7 h-7 flex items-center justify-center text-muted-foreground/40" title="Géré automatiquement">
                          <Lock className="w-3 h-3" />
                        </div>
                      ) : (
                        <button onClick={() => handleDelete(t.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">Solde {year}</td>
                <td className="px-4 py-3 text-right font-bold text-base whitespace-nowrap">
                  <span className={stats.solde >= 0 ? "text-emerald-400" : "text-red-500"}>
                    {stats.solde >= 0 ? "+" : "−"}{fmt(Math.abs(stats.solde))}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab Budget prévisionnel ──────────────────────────────────────────────────
function BudgetTab({ year }) {
  const [budget, setBudget] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editRow, setEditRow] = useState(null); // { type, categorie, montant_prevu, notes }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [b, t] = await Promise.all([
        supabase.from("tresorerie_budget").select("*").eq("annee", year),
        supabase.from("tresorerie_transactions").select("type, categorie, montant").eq("annee", year),
      ]);
      setBudget(b.data || []);
      setTransactions(t.data || []);
      setLoading(false);
    }
    load();
  }, [year]);

  const actualByKey = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = `${t.type}__${t.categorie}`;
      map[k] = (map[k] || 0) + Number(t.montant);
    });
    return map;
  }, [transactions]);

  const allCategories = [
    ...CATEGORIES_RECETTES.map(c => ({ type: "recette", categorie: c })),
    ...CATEGORIES_DEPENSES.map(c => ({ type: "depense", categorie: c })),
  ];

  function getBudget(type, cat) {
    return budget.find(b => b.type === type && b.categorie === cat) || null;
  }

  function getActual(type, cat) {
    return actualByKey[`${type}__${cat}`] || 0;
  }

  async function handleSave() {
    if (!editRow) return;
    const { type, categorie, montant_prevu, notes } = editRow;
    if (!montant_prevu || isNaN(Number(montant_prevu)) || Number(montant_prevu) < 0) {
      toast.error("Montant invalide."); return;
    }
    setSaving(true);
    const { error } = await supabase.from("tresorerie_budget").upsert(
      { annee: year, type, categorie, montant_prevu: Number(montant_prevu), notes: notes || null },
      { onConflict: "annee,categorie,type" }
    );
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Budget enregistré.");
    const { data } = await supabase.from("tresorerie_budget").select("*").eq("annee", year);
    setBudget(data || []);
    setEditRow(null);
  }

  if (loading) return (
    <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
  );

  return (
    <div className="space-y-5">
      <div className="bg-blue-500/15 border border-blue-500/25 rounded-xl px-4 py-3 text-sm text-blue-400">
        <strong>Budget prévisionnel {year}</strong> — Saisissez les montants cibles par catégorie pour suivre les écarts avec le réalisé.
      </div>

      {/* Formulaire inline */}
      {editRow && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-foreground">
              Budget — {editRow.categorie} ({editRow.type === "recette" ? "Recette" : "Dépense"})
            </p>
            <button onClick={() => setEditRow(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Montant prévu (FCFA)">
              <input className={inp} type="number" min="0" value={editRow.montant_prevu}
                onChange={e => setEditRow(p => ({ ...p, montant_prevu: e.target.value }))} placeholder="0" />
            </Field>
            <Field label="Notes (optionnel)">
              <input className={inp} value={editRow.notes || ""}
                onChange={e => setEditRow(p => ({ ...p, notes: e.target.value }))} placeholder="Commentaire…" />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditRow(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Recettes */}
      <BudgetTable
        title="Recettes"
        categories={CATEGORIES_RECETTES}
        type="recette"
        getBudget={getBudget}
        getActual={getActual}
        onEdit={row => setEditRow(row)}
        color="emerald"
      />

      {/* Dépenses */}
      <BudgetTable
        title="Dépenses"
        categories={CATEGORIES_DEPENSES}
        type="depense"
        getBudget={getBudget}
        getActual={getActual}
        onEdit={row => setEditRow(row)}
        color="red"
      />
    </div>
  );
}

function BudgetTable({ title, categories, type, getBudget, getActual, onEdit, color }) {
  const colorMap = {
    emerald: { header: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400", btn: "hover:bg-emerald-500/15 hover:text-emerald-400" },
    red: { header: "bg-red-400", badge: "bg-red-500/15 text-red-400", btn: "hover:bg-red-500/15 hover:text-red-400" },
  };
  const c = colorMap[color];

  let totalPrevu = 0, totalActuel = 0;
  categories.forEach(cat => {
    const b = getBudget(type, cat);
    if (b) totalPrevu += Number(b.montant_prevu);
    totalActuel += getActual(type, cat);
  });
  const totalEcart = type === "recette" ? totalActuel - totalPrevu : totalPrevu - totalActuel;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${c.header}`} />
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/10">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catégorie</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Réalisé</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prévu</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Écart</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avancement</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {categories.map(cat => {
            const b = getBudget(type, cat);
            const actuel = getActual(type, cat);
            const prevu = b ? Number(b.montant_prevu) : 0;
            const ecart = type === "recette" ? actuel - prevu : prevu - actuel;
            const pct = prevu > 0 ? Math.min(100, Math.round((actuel / prevu) * 100)) : (actuel > 0 ? 100 : 0);
            const hasData = actuel > 0 || prevu > 0;

            return (
              <tr key={cat} className={`hover:bg-muted/10 transition-colors ${!hasData ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[cat] || "bg-muted/60 text-muted-foreground"}`}>{cat}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground text-sm">
                  {actuel > 0 ? fmt(actuel) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground text-sm">
                  {prevu > 0 ? fmt(prevu) : <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">
                  {prevu > 0 ? (
                    <span className={ecart >= 0 ? "text-emerald-400 font-semibold" : "text-red-500 font-semibold"}>
                      {ecart >= 0 ? "+" : "−"}{fmt(Math.abs(ecart))}
                    </span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {prevu > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-400" : "bg-muted-foreground/30"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  ) : <span className="text-xs text-muted-foreground/40">Pas de budget</span>}
                </td>
                <td className="px-2 py-3">
                  <button onClick={() => onEdit({ type, categorie: cat, montant_prevu: b?.montant_prevu || "", notes: b?.notes || "" })}
                    className={`w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-colors ${c.btn}`}>
                    <Target className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/20">
            <td className="px-4 py-3 text-sm font-bold text-foreground">Total</td>
            <td className="px-4 py-3 text-right font-bold text-sm text-foreground">{totalActuel > 0 ? fmt(totalActuel) : "—"}</td>
            <td className="px-4 py-3 text-right font-bold text-sm text-muted-foreground">{totalPrevu > 0 ? fmt(totalPrevu) : "—"}</td>
            <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">
              {totalPrevu > 0 && (
                <span className={totalEcart >= 0 ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
                  {totalEcart >= 0 ? "+" : "−"}{fmt(Math.abs(totalEcart))}
                </span>
              )}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Tab Rapport financier ────────────────────────────────────────────────────
function RapportTab({ year }) {
  const [loading, setLoading] = useState(false);

  async function generer() {
    setLoading(true);
    const [transRes, budgetRes] = await Promise.all([
      supabase.from("tresorerie_transactions").select("*").eq("annee", year).order("date"),
      supabase.from("tresorerie_budget").select("*").eq("annee", year),
    ]);
    setLoading(false);
    if (transRes.error) { toast.error("Erreur chargement transactions."); return; }
    genererRapportTresorerie(year, transRes.data || [], budgetRes.data || []);
  }

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">Rapport de Trésorerie {year}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Génère un document A4 avec la synthèse des recettes et dépenses,
            la comparaison budget/réalisé par catégorie, et le résultat de l'exercice.
          </p>
        </div>
        <button onClick={generer} disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Générer le rapport PDF
        </button>
        <p className="text-xs text-muted-foreground">
          Le document s'ouvre dans un overlay — utilisez "Imprimer / PDF" pour l'enregistrer.
        </p>
      </div>

      <div className="bg-amber-500/15 border border-amber-500/25 rounded-xl px-4 py-3 text-sm text-amber-400">
        <strong>Conseil :</strong> Renseignez d'abord vos objectifs dans l'onglet <em>Budget</em> pour que le rapport inclue la comparaison prévu/réalisé.
      </div>
    </div>
  );
}

// ── Tab Remboursements de frais ──────────────────────────────────────────────
function RemboursementsTab({ year }) {
  const [rembs, setRembs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmEl } = useConfirm();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("tresorerie_remboursements")
      .select("*")
      .eq("annee", year)
      .order("date_demande", { ascending: false });
    setRembs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [year]);

  const stats = useMemo(() => {
    const attente   = rembs.filter(r => r.statut === "en_attente").reduce((s, r) => s + Number(r.montant), 0);
    const rembourse = rembs.filter(r => r.statut === "remboursé").reduce((s, r) => s + Number(r.montant), 0);
    return { attente, rembourse };
  }, [rembs]);

  async function handleSave() {
    if (!form.demandeur.trim()) { toast.error("Le demandeur est obligatoire."); return; }
    if (!form.motif.trim())     { toast.error("Le motif est obligatoire."); return; }
    if (!form.montant || Number(form.montant) <= 0) { toast.error("Montant invalide."); return; }
    setSaving(true);
    const { error } = await supabase.from("tresorerie_remboursements").insert({
      annee: year,
      demandeur: form.demandeur.trim(),
      motif: form.motif.trim(),
      montant: Number(form.montant),
      date_demande: form.date_demande,
      notes: form.notes?.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Demande enregistrée.");
    setForm(null);
    load();
  }

  async function advanceStatut(remb, newStatut) {
    if (newStatut === "remboursé") {
      const { data: txData, error: txErr } = await supabase
        .from("tresorerie_transactions")
        .insert({
          type: "depense",
          categorie: "Administration",
          libelle: `Remboursement — ${remb.demandeur}`,
          montant: remb.montant,
          date: new Date().toISOString().slice(0, 10),
          annee: year,
          description: remb.motif,
        })
        .select()
        .single();
      if (txErr) { toast.error("Erreur création transaction : " + txErr.message); return; }
      await supabase.from("tresorerie_remboursements").update({
        statut: "remboursé",
        date_traitement: new Date().toISOString().slice(0, 10),
        transaction_id: txData.id,
      }).eq("id", remb.id);
      toast.success("Remboursement effectué — transaction dépense créée automatiquement.");
    } else {
      await supabase.from("tresorerie_remboursements").update({
        statut: newStatut,
        date_traitement: newStatut !== "en_attente" ? new Date().toISOString().slice(0, 10) : null,
      }).eq("id", remb.id);
      toast.success(`Statut mis à jour : ${REMBOURS_CFG[newStatut].label}.`);
    }
    load();
  }

  async function handleDelete(id) {
    if (!await confirm("Supprimer cette demande ?", "Cette action est irréversible.")) return;
    await supabase.from("tresorerie_remboursements").delete().eq("id", id);
    toast.success("Demande supprimée.");
    load();
  }

  return (
    <div className="space-y-5">
      {ConfirmEl}
      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={() => setForm({ ...emptyRembForm })}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="En attente d'approbation" value={stats.attente} icon={Receipt}
          color="bg-amber-500/15 text-amber-400"
          sub={`${rembs.filter(r => r.statut === "en_attente").length} demande(s)`} />
        <StatCard label="Remboursé cette année" value={stats.rembourse} icon={RefreshCw}
          color="bg-emerald-500/15 text-emerald-400"
          sub={`${rembs.filter(r => r.statut === "remboursé").length} opération(s)`} />
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Nouvelle demande de remboursement</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <Field label="Demandeur *">
              <input className={inp} value={form.demandeur}
                onChange={e => setForm(p => ({ ...p, demandeur: e.target.value }))} placeholder="Nom du demandeur" />
            </Field>
            <Field label="Montant (FCFA) *">
              <input className={inp} type="number" min="1" value={form.montant}
                onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} placeholder="0" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Motif *">
                <input className={inp} value={form.motif}
                  onChange={e => setForm(p => ({ ...p, motif: e.target.value }))} placeholder="Objet du remboursement" />
              </Field>
            </div>
            <Field label="Date de demande">
              <input className={inp} type="date" value={form.date_demande}
                onChange={e => setForm(p => ({ ...p, date_demande: e.target.value }))} />
            </Field>
            <Field label="Notes (optionnel)">
              <input className={inp} value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Détails supplémentaires…" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
      ) : rembs.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucune demande de remboursement pour {year}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rembs.map(r => {
            const cfg = REMBOURS_CFG[r.statut] || REMBOURS_CFG.en_attente;
            return (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground text-sm">{r.demandeur}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                      {r.transaction_id && (
                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                          <RefreshCw className="w-2.5 h-2.5" /> Transaction dépense créée
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{r.motif}</p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{r.notes}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>Demandé le {new Date(r.date_demande).toLocaleDateString("fr-FR")}</span>
                      {r.date_traitement && <span>· Traité le {new Date(r.date_traitement).toLocaleDateString("fr-FR")}</span>}
                    </div>
                  </div>
                  <p className="font-bold text-foreground text-sm flex-shrink-0">{fmt(r.montant)}</p>
                </div>

                {/* Actions workflow */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  {r.statut === "en_attente" && (
                    <>
                      <button onClick={() => advanceStatut(r, "approuvé")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                        Approuver
                      </button>
                      <button onClick={() => advanceStatut(r, "rejeté")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                        Rejeter
                      </button>
                    </>
                  )}
                  {r.statut === "approuvé" && (
                    <button onClick={() => advanceStatut(r, "remboursé")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                      <RefreshCw className="w-3 h-3" /> → Marquer remboursé
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    className="ml-auto w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab Subventions ──────────────────────────────────────────────────────────
function SubventionsTab({ year }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [versement, setVersement] = useState(null); // { subId, organisme, reste, montant, date }
  const [savingVers, setSavingVers] = useState(false);
  const { confirm, ConfirmEl } = useConfirm();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("tresorerie_subventions")
      .select("*")
      .eq("annee", year)
      .order("date_accord", { ascending: false });
    setSubs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [year]);

  const stats = useMemo(() => {
    const accorde = subs.reduce((s, r) => s + Number(r.montant_accorde), 0);
    const recu    = subs.reduce((s, r) => s + Number(r.montant_recu),    0);
    return { accorde, recu, attente: accorde - recu };
  }, [subs]);

  function openForm(sub = null) {
    if (sub) {
      setEditId(sub.id);
      setForm({
        organisme:       sub.organisme,
        objet:           sub.objet,
        montant_accorde: String(sub.montant_accorde),
        date_accord:     sub.date_accord || "",
        date_echeance:   sub.date_echeance || "",
        statut:          sub.statut,
        notes:           sub.notes || "",
      });
    } else {
      setEditId(null);
      setForm({ organisme: "", objet: "", montant_accorde: "", date_accord: "", date_echeance: "", statut: "en_attente", notes: "" });
    }
  }

  async function handleSave() {
    if (!form.organisme.trim())     { toast.error("L'organisme est obligatoire."); return; }
    if (!form.objet.trim())         { toast.error("L'objet est obligatoire."); return; }
    if (!form.montant_accorde || Number(form.montant_accorde) <= 0) { toast.error("Montant accordé invalide."); return; }
    setSaving(true);
    const payload = {
      annee:           year,
      organisme:       form.organisme.trim(),
      objet:           form.objet.trim(),
      montant_accorde: Number(form.montant_accorde),
      date_accord:     form.date_accord || null,
      date_echeance:   form.date_echeance || null,
      statut:          form.statut,
      notes:           form.notes?.trim() || null,
    };
    const { error } = editId
      ? await supabase.from("tresorerie_subventions").update(payload).eq("id", editId)
      : await supabase.from("tresorerie_subventions").insert(payload);
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success(editId ? "Subvention mise à jour." : "Subvention enregistrée.");
    setForm(null); setEditId(null);
    load();
  }

  function openVersement(s) {
    const reste = Number(s.montant_accorde) - Number(s.montant_recu);
    setVersement({
      subId:     s.id,
      organisme: s.organisme,
      objet:     s.objet,
      actuelRecu: Number(s.montant_recu),
      montantAccorde: Number(s.montant_accorde),
      reste:     reste > 0 ? reste : 0,
      montant:   "",
      date:      new Date().toISOString().slice(0, 10),
    });
  }

  async function handleVersement() {
    const montant = Number(versement.montant);
    if (!montant || montant <= 0) { toast.error("Montant invalide."); return; }
    if (montant > versement.reste) { toast.error(`Maximum restant : ${fmt(versement.reste)}.`); return; }
    setSavingVers(true);

    // 1 — Créer la transaction recette dans la trésorerie
    const { error: txErr } = await supabase.from("tresorerie_transactions").insert({
      type:       "recette",
      categorie:  "Subventions",
      libelle:    `Subvention reçue — ${versement.organisme}`,
      montant,
      date:       versement.date,
      annee:      year,
      description: versement.objet,
      source_ref: `subvention:${versement.subId}`,
    });
    if (txErr) { setSavingVers(false); toast.error("Erreur transaction : " + txErr.message); return; }

    // 2 — Mettre à jour montant_recu et statut sur la subvention
    const newRecu = versement.actuelRecu + montant;
    const newStatut = newRecu >= versement.montantAccorde ? "reçu" : "partiellement_reçu";
    const { error: subErr } = await supabase.from("tresorerie_subventions").update({
      montant_recu: newRecu,
      statut:       newStatut,
    }).eq("id", versement.subId);

    setSavingVers(false);
    if (subErr) { toast.error("Erreur mise à jour subvention : " + subErr.message); return; }
    toast.success(`${fmt(montant)} encaissés → recette automatiquement créée dans la trésorerie.`);
    setVersement(null);
    load();
  }

  async function handleDelete(id) {
    if (!await confirm("Supprimer cette subvention ?", "Cette action est irréversible.")) return;
    await supabase.from("tresorerie_subventions").delete().eq("id", id);
    toast.success("Subvention supprimée.");
    load();
  }

  return (
    <div className="space-y-5">
      {ConfirmEl}
      {/* Bannière explication */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-xs text-violet-400">
        <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
        Chaque versement reçu crée automatiquement une recette dans <strong className="mx-0.5">Transactions</strong> et alimente le budget et le bilan.
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={() => openForm()}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total accordé" value={stats.accorde} icon={Landmark}
          color="bg-violet-500/15 text-violet-400"
          sub={`${subs.length} subvention(s)`} />
        <StatCard label="Déjà encaissé" value={stats.recu} icon={TrendingUp}
          color="bg-emerald-500/15 text-emerald-400"
          sub={stats.accorde > 0 ? `${Math.round((stats.recu / stats.accorde) * 100)}% du total accordé` : ""} />
        <StatCard label="Reste à encaisser" value={stats.attente} icon={TrendingDown}
          color="bg-amber-500/15 text-amber-400" />
      </div>

      {/* Formulaire création/édition */}
      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">{editId ? "Modifier la subvention" : "Nouvelle subvention"}</p>
            <button onClick={() => { setForm(null); setEditId(null); }} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <Field label="Organisme *">
              <input className={inp} value={form.organisme}
                onChange={e => setForm(p => ({ ...p, organisme: e.target.value }))} placeholder="Ex : Mairie de Lomé" />
            </Field>
            <Field label="Statut">
              <select className={inp} value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}>
                {Object.entries(SUB_STATUT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Objet *">
                <input className={inp} value={form.objet}
                  onChange={e => setForm(p => ({ ...p, objet: e.target.value }))} placeholder="Objet / programme subventionné" />
              </Field>
            </div>
            <Field label="Montant accordé (FCFA) *">
              <input className={inp} type="number" min="1" value={form.montant_accorde}
                onChange={e => setForm(p => ({ ...p, montant_accorde: e.target.value }))} placeholder="0" />
            </Field>
            <Field label="Date d'accord">
              <input className={inp} type="date" value={form.date_accord}
                onChange={e => setForm(p => ({ ...p, date_accord: e.target.value }))} />
            </Field>
            <Field label="Date d'échéance justificatifs">
              <input className={inp} type="date" value={form.date_echeance}
                onChange={e => setForm(p => ({ ...p, date_echeance: e.target.value }))} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes (optionnel)">
                <textarea className={inp} rows={2} value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Conditions, contacts, références…" />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => { setForm(null); setEditId(null); }} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Formulaire versement */}
      {versement && (
        <div className="bg-card border border-emerald-500/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-emerald-500/10">
            <div>
              <p className="font-semibold text-foreground text-sm">Enregistrer un versement reçu</p>
              <p className="text-xs text-muted-foreground mt-0.5">{versement.organisme} · Reste à encaisser : {fmt(versement.reste)}</p>
            </div>
            <button onClick={() => setVersement(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <Field label="Montant encaissé (FCFA) *">
              <input className={inp} type="number" min="1" max={versement.reste}
                value={versement.montant}
                onChange={e => setVersement(p => ({ ...p, montant: e.target.value }))}
                placeholder={`Max ${fmt(versement.reste)}`} />
            </Field>
            <Field label="Date de réception *">
              <input className={inp} type="date" value={versement.date}
                onChange={e => setVersement(p => ({ ...p, date: e.target.value }))} />
            </Field>
          </div>
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
              Une recette "Subventions" sera automatiquement créée dans l'onglet Transactions.
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setVersement(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleVersement} disabled={savingVers}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {savingVers && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirmer l'encaissement
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <Landmark className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucune subvention enregistrée pour {year}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(s => {
            const cfg = SUB_STATUT_CFG[s.statut] || SUB_STATUT_CFG.en_attente;
            const pct = s.montant_accorde > 0 ? Math.min(100, Math.round((Number(s.montant_recu) / Number(s.montant_accorde)) * 100)) : 0;
            const resteAEncaisser = Number(s.montant_accorde) - Number(s.montant_recu);
            return (
              <div key={s.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground text-sm">{s.organisme}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.objet}</p>
                    {s.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{s.notes}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      {s.date_accord   && <span>Accordé le {new Date(s.date_accord).toLocaleDateString("fr-FR")}</span>}
                      {s.date_echeance && <span>· Échéance {new Date(s.date_echeance).toLocaleDateString("fr-FR")}</span>}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-400" : "bg-muted-foreground/20"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-24 text-right">
                        {fmt(s.montant_recu)} / {fmt(s.montant_accorde)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-bold text-foreground text-sm">{fmt(s.montant_accorde)}</p>
                    <p className="text-xs text-muted-foreground">{pct}% encaissé</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  {s.statut !== "clôturé" && s.statut !== "reçu" && resteAEncaisser > 0 && (
                    <button onClick={() => openVersement(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                      <Plus className="w-3 h-3" /> Versement reçu
                    </button>
                  )}
                  <button onClick={() => openForm(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted/60 text-muted-foreground hover:bg-muted transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="ml-auto w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function TresorerieSection() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState("transactions");

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const TABS = [
    { key: "transactions",   label: "Transactions",   icon: Wallet   },
    { key: "budget",         label: "Budget",         icon: Target   },
    { key: "subventions",    label: "Subventions",    icon: Landmark },
    { key: "remboursements", label: "Remboursements", icon: Receipt  },
    { key: "rapport",        label: "Rapport PDF",    icon: FileText },
  ];

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Trésorerie</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Recettes, dépenses et suivi budgétaire</p>
        </div>
        <select className={inp + " w-28"} value={year} onChange={e => setYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === "transactions"   && <TransactionsTab year={year} />}
      {activeTab === "budget"         && <BudgetTab year={year} />}
      {activeTab === "subventions"    && <SubventionsTab year={year} />}
      {activeTab === "remboursements" && <RemboursementsTab year={year} />}
      {activeTab === "rapport"        && <RapportTab year={year} />}
    </div>
  );
}
