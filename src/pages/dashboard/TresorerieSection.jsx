import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet,
  X, Loader2, RefreshCw, Lock, FileText, Target, BarChart2
} from "lucide-react";
import { inp, Field } from "./shared";
import { genererRapportTresorerie } from "@/lib/documentGenerators";

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
    if (!window.confirm("Supprimer cette transaction ?")) return;
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

// ── Composant principal ──────────────────────────────────────────────────────
export default function TresorerieSection() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState("transactions");

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const TABS = [
    { key: "transactions", label: "Transactions", icon: Wallet },
    { key: "budget", label: "Budget", icon: Target },
    { key: "rapport", label: "Rapport PDF", icon: FileText },
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
      {activeTab === "transactions" && <TransactionsTab year={year} />}
      {activeTab === "budget"       && <BudgetTab year={year} />}
      {activeTab === "rapport"      && <RapportTab year={year} />}
    </div>
  );
}
