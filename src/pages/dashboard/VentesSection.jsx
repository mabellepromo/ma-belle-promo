import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { genererFactureBoutique } from "@/lib/documentGenerators";
import { TrendingUp, ShoppingBag, CreditCard, Download, RefreshCw, CheckCircle, XCircle, Loader, Trash2, Eye, FileText } from "lucide-react";

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";

const METHOD_LABELS = {
  card:   { label: "Carte bancaire", color: "#3b82f6", icon: "💳" },
  paypal: { label: "PayPal",         color: "#003087", icon: "🅿️" },
  wave:   { label: "Wave",           color: "#2563eb", icon: "〰️" },
  tmoney: { label: "T-Money",        color: "#1d4ed8", icon: "🔵" },
  flooz:  { label: "Flooz",          color: "#16a34a", icon: "🟢" },
  wire:   { label: "Virement",       color: "#34d399", icon: "🏦" },
};

const STATUT_CFG = {
  completed: { label: "Complété",   cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  pending:   { label: "En attente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  cancelled: { label: "Annulé",     cls: "bg-red-500/15 text-red-400 border-red-500/25" },
};

const PERIODS = [
  { key: "all",   label: "Tout" },
  { key: "today", label: "Auj." },
  { key: "week",  label: "7j" },
  { key: "month", label: "Ce mois" },
];

export default function VentesSection() {
  const [commandes, setCommandes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState("all");
  const [expandedId, setExpandedId]       = useState(null);
  const [updatingId, setUpdatingId]       = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function fetchCommandes() {
    setLoading(true);
    const { data } = await supabase
      .from("commandes")
      .select("*")
      .order("created_at", { ascending: false });
    setCommandes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCommandes(); }, []);

  async function deleteCommande(id) {
    setUpdatingId(id);
    const { error } = await supabase.from("commandes").delete().eq("id", id);
    if (!error) {
      setCommandes(prev => prev.filter(c => c.id !== id));
      setExpandedId(null);
    }
    setUpdatingId(null);
    setConfirmDeleteId(null);
  }

  async function updateStatut(id, statut) {
    setUpdatingId(id);
    const { error } = await supabase.from("commandes").update({ statut }).eq("id", id);
    if (!error) {
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
      setExpandedId(null);
    }
    setUpdatingId(null);
  }

  const filtered = useMemo(() => {
    const now = new Date();
    return commandes.filter(c => {
      const d = new Date(c.created_at);
      if (period === "today") return d.toDateString() === now.toDateString();
      if (period === "week")  { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [commandes, period]);

  const kpis = useMemo(() => {
    const total = filtered.reduce((s, c) => s + Number(c.total), 0);
    const count = filtered.length;
    const byMethod = {};
    filtered.forEach(c => {
      byMethod[c.methode_paiement] = (byMethod[c.methode_paiement] || 0) + Number(c.total);
    });
    return { total, count, byMethod };
  }, [filtered]);

  function exportCsv() {
    const headers = ["Référence", "Acheteur", "Email", "Méthode", "Total (FCFA)", "Statut", "Date"];
    const rows = filtered.map(c => [
      c.reference,
      c.acheteur_nom,
      c.acheteur_email,
      METHOD_LABELS[c.methode_paiement]?.label ?? c.methode_paiement,
      c.total,
      c.statut,
      new Date(c.created_at).toLocaleString("fr-FR"),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })),
      download: `ventes-mbp-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-foreground text-xl">Ventes Boutique</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} commande{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-background">
            {PERIODS.map(p => (
              <button key={p.key}
                onClick={() => setPeriod(p.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: period === p.key ? "hsl(var(--primary))" : "transparent",
                  color: period === p.key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchCommandes} title="Rafraîchir"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden col-span-2 lg:col-span-1">
          <div className="h-1 w-full bg-emerald-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Chiffre d'affaires</p>
            </div>
            <p className="font-heading text-2xl font-black text-foreground">{fmt(kpis.total)}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-blue-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Commandes</p>
            </div>
            <p className="font-heading text-2xl font-black text-foreground">{kpis.count}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-indigo-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Panier moyen</p>
            </div>
            <p className="font-heading text-2xl font-black text-foreground">
              {kpis.count > 0 ? fmt(Math.round(kpis.total / kpis.count)) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Répartition par méthode ── */}
      {Object.keys(kpis.byMethod).length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-sm font-bold text-foreground mb-4">Répartition par méthode de paiement</p>
          <div className="space-y-3">
            {Object.entries(kpis.byMethod)
              .sort((a, b) => b[1] - a[1])
              .map(([method, montant]) => {
                const cfg = METHOD_LABELS[method] ?? { label: method, color: "#888", icon: "💰" };
                const pct = kpis.total > 0 ? Math.round((montant / kpis.total) * 100) : 0;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <span>{cfg.icon}</span> {cfg.label}
                      </span>
                      <span className="text-muted-foreground">{fmt(montant)} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Table des commandes ── */}
      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3
          grid grid-cols-[1fr_2fr_1.5fr_auto] lg:grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-4 items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Réf.</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acheteur</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Méthode · Total</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Statut</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="font-semibold">Aucune vente pour cette période</p>
            <p className="text-xs mt-1 opacity-60">Les commandes apparaîtront ici dès le premier achat.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map(c => {
              const cfg    = METHOD_LABELS[c.methode_paiement] ?? { label: c.methode_paiement, color: "#888", icon: "💰" };
              const statut = STATUT_CFG[c.statut] ?? STATUT_CFG.pending;
              const lignes = Array.isArray(c.lignes) ? c.lignes : [];
              const isOpen = expandedId === c.id;
              return (
                <div key={c.id}>
                  <button
                    onClick={() => setExpandedId(id => id === c.id ? null : c.id)}
                    className="w-full text-left grid grid-cols-[1fr_2fr_1.5fr_auto] lg:grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-4
                      items-center px-5 py-3.5 hover:bg-primary/[0.03] transition-all group">
                    <span className="font-mono text-xs text-primary truncate">{c.reference}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {c.acheteur_nom}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{c.acheteur_email}</p>
                    </div>
                    <div>
                      <span className="text-xs flex items-center gap-1">
                        <span>{cfg.icon}</span>
                        <span className="text-muted-foreground">{cfg.label}</span>
                      </span>
                      <p className="text-sm font-bold text-foreground mt-0.5">{fmt(c.total)}</p>
                    </div>
                    <div className="hidden lg:block">
                      <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ${statut.cls}`}>
                        {statut.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-2 bg-muted/20 border-t border-border/40 space-y-3">
                      {lignes.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Articles commandés</p>
                          <div className="space-y-1">
                            {lignes.map((l, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-foreground">{l.emoji} {l.name} ×{l.qty}</span>
                                <span className="font-semibold text-primary">{fmt(l.price * l.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Boutons facture */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => genererFactureBoutique(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: "rgba(184,134,26,0.10)", color: "#b8861a", border: "1px solid rgba(184,134,26,0.25)" }}
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir la facture
                        </button>
                      </div>

                      {/* Actions statut + suppression */}
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {c.statut === "pending" && (
                            <button
                              onClick={() => updateStatut(c.id, "completed")}
                              disabled={updatingId === c.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
                            >
                              {updatingId === c.id
                                ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCircle className="w-3.5 h-3.5" />}
                              Valider le paiement
                            </button>
                          )}
                          {c.statut !== "cancelled" && (
                            <button
                              onClick={() => updateStatut(c.id, "cancelled")}
                              disabled={updatingId === c.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.20)" }}
                            >
                              {updatingId === c.id
                                ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                : <XCircle className="w-3.5 h-3.5" />}
                              Annuler
                            </button>
                          )}
                        </div>

                        {/* Suppression — deux clics requis */}
                        {confirmDeleteId === c.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Supprimer définitivement ?</span>
                            <button
                              onClick={() => deleteCommande(c.id)}
                              disabled={updatingId === c.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              style={{ background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.35)" }}
                            >
                              {updatingId === c.id ? <Loader className="w-3 h-3 animate-spin" /> : "Confirmer"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-red-400 hover:bg-red-500/8 transition-colors border border-transparent hover:border-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
