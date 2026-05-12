import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet, X, Loader2 } from "lucide-react";
import { inp, Field } from "./shared";

const CATEGORIES_RECETTES = ["Cotisations", "Dons", "Subventions", "Sponsoring", "Événements", "Autres"];
const CATEGORIES_DEPENSES = ["Événements", "Administration", "Communication", "Matériel", "Transport", "Restauration", "Autres"];

const CAT_COLORS = {
  Cotisations: "bg-emerald-100 text-emerald-700",
  Dons: "bg-blue-100 text-blue-700",
  Subventions: "bg-indigo-100 text-indigo-700",
  Sponsoring: "bg-violet-100 text-violet-700",
  Événements: "bg-amber-100 text-amber-700",
  Administration: "bg-slate-100 text-slate-700",
  Communication: "bg-cyan-100 text-cyan-700",
  Matériel: "bg-orange-100 text-orange-700",
  Transport: "bg-rose-100 text-rose-700",
  Restauration: "bg-pink-100 text-pink-700",
  Autres: "bg-gray-100 text-gray-600",
};

const fmt = n => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n) + " FCFA";

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
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

const emptyForm = { type: "recette", categorie: "", libelle: "", montant: "", date: new Date().toISOString().slice(0, 10), description: "", piece_url: "" };

export default function TresorerieSection() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all | recette | depense
  const [catFilter, setCatFilter] = useState("");

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

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

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter !== "all" && t.type !== filter) return false;
      if (catFilter && t.categorie !== catFilter) return false;
      return true;
    });
  }, [transactions, filter, catFilter]);

  const categories = filter === "recette" ? CATEGORIES_RECETTES
    : filter === "depense" ? CATEGORIES_DEPENSES
    : [...CATEGORIES_RECETTES, ...CATEGORIES_DEPENSES.filter(c => !CATEGORIES_RECETTES.includes(c))];

  async function handleSave() {
    if (!form.libelle.trim()) { toast.error("Le libellé est obligatoire."); return; }
    if (!form.categorie) { toast.error("La catégorie est obligatoire."); return; }
    if (!form.montant || isNaN(Number(form.montant)) || Number(form.montant) <= 0) { toast.error("Montant invalide."); return; }
    if (!form.date) { toast.error("La date est obligatoire."); return; }

    setSaving(true);
    const { error } = await supabase.from("tresorerie_transactions").insert({
      type: form.type,
      categorie: form.categorie,
      libelle: form.libelle.trim(),
      montant: Number(form.montant),
      date: form.date,
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
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Trésorerie</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Recettes, dépenses et solde de l'association</p>
        </div>
        <div className="flex items-center gap-2">
          <select className={inp + " w-28"} value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => exportCSV()} title="Exporter CSV"
            className="w-9 h-9 rounded-xl border border-border hover:bg-emerald-50 flex items-center justify-center text-muted-foreground hover:text-emerald-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setForm({ ...emptyForm })}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Recettes" value={stats.recettes} icon={TrendingUp} color="bg-emerald-50 text-emerald-600"
          sub={`${transactions.filter(t => t.type === "recette").length} opération${transactions.filter(t => t.type === "recette").length !== 1 ? "s" : ""}`} />
        <StatCard label="Dépenses" value={stats.depenses} icon={TrendingDown} color="bg-red-50 text-red-600"
          sub={`${transactions.filter(t => t.type === "depense").length} opération${transactions.filter(t => t.type === "depense").length !== 1 ? "s" : ""}`} />
        <StatCard label="Solde" value={stats.solde} icon={Wallet}
          color={stats.solde >= 0 ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}
          sub={stats.solde >= 0 ? "Excédent" : "Déficit"} />
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Nouvelle transaction</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {["recette", "depense"].map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t, categorie: "" }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === t
                      ? t === "recette" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
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
        {[
          { key: "all", label: "Toutes" },
          { key: "recette", label: "Recettes" },
          { key: "depense", label: "Dépenses" },
        ].map(f => (
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
        <div className="text-center py-16 bg-white border border-border rounded-2xl text-muted-foreground">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucune transaction pour {year}.</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter" pour enregistrer une recette ou une dépense.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
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
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.libelle}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button onClick={() => setCatFilter(t.categorie)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-80 ${CAT_COLORS[t.categorie] || "bg-gray-100 text-gray-600"}`}>
                      {t.categorie}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    <span className={t.type === "recette" ? "text-emerald-600" : "text-red-500"}>
                      {t.type === "recette" ? "+" : "−"}{fmt(t.montant)}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <button onClick={() => handleDelete(t.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">
                  Solde {year}
                </td>
                <td className="px-4 py-3 text-right font-bold text-base whitespace-nowrap">
                  <span className={stats.solde >= 0 ? "text-emerald-600" : "text-red-500"}>
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
