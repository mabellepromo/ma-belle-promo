import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp, TrendingDown, Scale, Download, FileText, RefreshCw,
  Banknote, Receipt, AlertTriangle, Landmark, ShoppingBag, Loader2,
} from "lucide-react";
import { genererBilanComptable } from "@/lib/documentGenerators";

// Formatage monétaire FCFA (cohérent avec les autres modules finance)
const fmt = n => new Intl.NumberFormat("fr-FR").format(Math.round(Math.abs(Number(n) || 0))) + " FCFA";

// Regroupe une liste de transactions par catégorie, triée par montant décroissant
function byCategorie(list) {
  const map = {};
  list.forEach(t => { map[t.categorie || "Autres"] = (map[t.categorie || "Autres"] || 0) + Number(t.montant || 0); });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Petite ligne « indicateur complémentaire »
function IndicRow({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <p className="text-sm font-bold text-foreground whitespace-nowrap">{value}</p>
    </div>
  );
}

export default function VueComptableSection() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    transactions: [], cotisations: [], factures: [],
    subventions: [], ventes: [], membersCount: 0,
  });

  // Choix d'années : année courante et 4 précédentes (modifiable si besoin)
  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => cur - i);
  }, []);

  useEffect(() => { load(); }, [year]);

  async function load() {
    setLoading(true);
    try {
      const [tx, cotis, fact, sub, ventes, members] = await Promise.all([
        supabase.from("tresorerie_transactions").select("*").eq("annee", year),
        supabase.from("cotisations").select("*").eq("annee", year),
        supabase.from("factures").select("*"),
        supabase.from("tresorerie_subventions").select("*").eq("annee", year),
        supabase.from("commandes").select("*"),
        supabase.from("members").select("id", { count: "exact", head: true }),
      ]);

      // Factures et ventes n'ont pas de colonne « annee » : on filtre sur la date
      const inYear = (d) => d && new Date(d).getFullYear() === year;
      const facturesYear = (fact.data || []).filter(f => inYear(f.date_emission));
      const ventesYear = (ventes.data || []).filter(v => inYear(v.created_at));

      setData({
        transactions: tx.data || [],
        cotisations: cotis.data || [],
        factures: facturesYear,
        subventions: sub.data || [],
        ventes: ventesYear,
        membersCount: members.count || 0,
      });
    } catch (e) {
      toast.error("Erreur de chargement : " + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  // Calculs dérivés
  const calc = useMemo(() => {
    const recettes = data.transactions.filter(t => t.type === "recette");
    const depenses = data.transactions.filter(t => t.type === "depense");
    const totalRec = recettes.reduce((s, t) => s + Number(t.montant || 0), 0);
    const totalDep = depenses.reduce((s, t) => s + Number(t.montant || 0), 0);
    const solde = totalRec - totalDep;

    const cotisPayees = data.cotisations.filter(c => c.statut === "payé" || c.statut === "paye");
    const totalCotis = cotisPayees.reduce((s, c) => s + Number(c.montant || 0), 0);

    const factPayees = data.factures.filter(f => f.statut === "payée" || f.statut === "payee");
    const factAttente = data.factures.filter(f => f.statut === "émise" || f.statut === "emise");
    const totalFactPayees = factPayees.reduce((s, f) => s + Number(f.montant_ttc || 0), 0);
    const totalCreances = factAttente.reduce((s, f) => s + Number(f.montant_ttc || 0), 0);

    const totalSubAccord = data.subventions.reduce((s, x) => s + Number(x.montant_accorde || 0), 0);
    const totalSubRecu = data.subventions.reduce((s, x) => s + Number(x.montant_recu || 0), 0);

    const ventesPayees = data.ventes.filter(v => v.statut === "payée" || v.statut === "payee" || v.statut === "validée");
    const totalVentes = ventesPayees.reduce((s, v) => s + Number(v.total || 0), 0);

    return {
      recettes, depenses, totalRec, totalDep, solde,
      cotisPayees, totalCotis, factPayees, factAttente, totalFactPayees, totalCreances,
      totalSubAccord, totalSubRecu, ventesPayees, totalVentes,
    };
  }, [data]);

  function exportPDF() {
    genererBilanComptable(year, data);
  }

  function exportCSV() {
    const rows = [
      ["Bilan financier", String(year)],
      [],
      ["RÉSULTAT DE L'EXERCICE (trésorerie)"],
      ["Total recettes", calc.totalRec],
      ["Total dépenses", calc.totalDep],
      ["Résultat", calc.solde],
      [],
      ["RECETTES PAR CATÉGORIE"],
      ...byCategorie(calc.recettes).map(([c, m]) => [c, m]),
      [],
      ["DÉPENSES PAR CATÉGORIE"],
      ...byCategorie(calc.depenses).map(([c, m]) => [c, m]),
      [],
      ["INDICATEURS COMPLÉMENTAIRES (non additionnés au résultat)"],
      ["Cotisations encaissées", calc.totalCotis],
      ["Factures réglées", calc.totalFactPayees],
      ["Créances (factures émises non payées)", calc.totalCreances],
      ["Subventions reçues", calc.totalSubRecu],
      ["Subventions accordées", calc.totalSubAccord],
      ["Ventes / boutique", calc.totalVentes],
    ];
    const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = rows.map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bilan-financier-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const recettesCat = byCategorie(calc.recettes);
  const depensesCat = byCategorie(calc.depenses);

  return (
    <div className="space-y-5">
      {/* Bandeau explicatif */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300">
        <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Vue de synthèse : le résultat de l'exercice provient de la <strong>Trésorerie</strong> (source de vérité).
          Cotisations, factures, subventions et ventes sont des <strong>indicateurs complémentaires</strong>,
          non additionnés au résultat pour éviter tout double comptage.
        </span>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary/50">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={load} title="Rafraîchir"
            className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <FileText className="w-4 h-4" /> Bilan PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : (
        <>
          {/* KPI résultat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total recettes" value={fmt(calc.totalRec)} icon={TrendingUp}
              color="bg-emerald-500/15 text-emerald-400" sub={`${calc.recettes.length} opération(s)`} />
            <KpiCard label="Total dépenses" value={fmt(calc.totalDep)} icon={TrendingDown}
              color="bg-red-500/15 text-red-400" sub={`${calc.depenses.length} opération(s)`} />
            <KpiCard label={calc.solde >= 0 ? "Résultat (excédent)" : "Résultat (déficit)"}
              value={`${calc.solde >= 0 ? "+" : "−"}${fmt(calc.solde)}`} icon={Scale}
              color={calc.solde >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}
              sub={`Exercice ${year}`} />
          </div>

          {/* Détail par catégorie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">Recettes par catégorie</h3>
              </div>
              {recettesCat.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground text-center">Aucune recette en {year}.</p>
              ) : recettesCat.map(([cat, montant]) => (
                <div key={cat} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-sm font-semibold text-emerald-400">{fmt(montant)}</span>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-foreground">Dépenses par catégorie</h3>
              </div>
              {depensesCat.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground text-center">Aucune dépense en {year}.</p>
              ) : depensesCat.map(([cat, montant]) => (
                <div key={cat} className="flex items-center justify-between px-5 py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-sm font-semibold text-red-400">{fmt(montant)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indicateurs complémentaires */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Indicateurs complémentaires</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recouvrement et créances — non additionnés au résultat ci-dessus.</p>
            </div>
            <IndicRow icon={Banknote} color="bg-emerald-500/15 text-emerald-400"
              label="Cotisations encaissées" value={fmt(calc.totalCotis)}
              sub={`${calc.cotisPayees.length}${data.membersCount ? " / " + data.membersCount + " membres" : " paiement(s)"}`} />
            <IndicRow icon={Receipt} color="bg-blue-500/15 text-blue-400"
              label="Factures réglées" value={fmt(calc.totalFactPayees)}
              sub={`${calc.factPayees.length} facture(s)`} />
            <IndicRow icon={AlertTriangle} color="bg-amber-500/15 text-amber-400"
              label="Créances — factures émises non payées" value={fmt(calc.totalCreances)}
              sub={`${calc.factAttente.length} en attente`} />
            <IndicRow icon={Landmark} color="bg-indigo-500/15 text-indigo-400"
              label="Subventions reçues" value={fmt(calc.totalSubRecu)}
              sub={`sur ${fmt(calc.totalSubAccord)} accordé(s)`} />
            <IndicRow icon={ShoppingBag} color="bg-violet-500/15 text-violet-400"
              label="Ventes / boutique" value={fmt(calc.totalVentes)}
              sub={`${calc.ventesPayees.length} commande(s)`} />
          </div>
        </>
      )}
    </div>
  );
}
