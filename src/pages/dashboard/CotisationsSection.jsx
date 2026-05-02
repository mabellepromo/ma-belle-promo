import { useState, useMemo, Fragment } from "react";
import { Check, Clock, X, Download, Search, Banknote, Users, ShieldOff } from "lucide-react";
import { useCotisations } from "../../hooks/useCotisations";
import { inp, sel } from "./shared";

const STATUT_CONFIG = {
  "payé":       { label: "Payé",       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "en_attente": { label: "En attente", color: "bg-amber-100 text-amber-700",     dot: "bg-amber-500"   },
  "exempté":    { label: "Exempté",    color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"   },
};

const MODES = ["virement", "mobile money", "Orange Money", "espèces", "autre"];

export default function CotisationsSection({ members }) {
  const currentYear = new Date().getFullYear();
  const [annee,         setAnnee]         = useState(currentYear);
  const [filtre,        setFiltre]        = useState("tous");
  const [search,        setSearch]        = useState("");
  const [montantDefaut, setMontantDefaut] = useState(10000);
  const [editingId,     setEditingId]     = useState(null);
  const [editData,      setEditData]      = useState({});

  const { cotisations, loading, saving, marquerPaye, marquerEnAttente, marquerExempte, mettreAJour } =
    useCotisations(annee);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fusion membres + cotisations
  const rows = useMemo(() => (members ?? []).map(m => {
    const cot = cotisations.find(c => String(c.member_id) === String(m.id));
    return { ...m, cotisation: cot ?? null, statut: cot?.statut ?? "en_attente" };
  }), [members, cotisations]);

  // Filtrage
  const filtered = useMemo(() => {
    let r = rows;
    if (filtre !== "tous") r = r.filter(m => m.statut === filtre);
    if (search) {
      const q = search.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      r = r.filter(m => m.nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q));
    }
    return r;
  }, [rows, filtre, search]);

  // Stats
  const stats = useMemo(() => {
    const payes     = rows.filter(m => m.statut === "payé");
    const enAttente = rows.filter(m => m.statut === "en_attente");
    const exemptes  = rows.filter(m => m.statut === "exempté");
    const total     = payes.reduce((s, m) => s + (m.cotisation?.montant || 0), 0);
    return { payes: payes.length, enAttente: enAttente.length, exemptes: exemptes.length, total, total_membres: rows.length };
  }, [rows]);

  function startEdit(m) {
    setEditingId(m.id);
    setEditData({
      montant:       m.cotisation?.montant       ?? montantDefaut,
      date_paiement: m.cotisation?.date_paiement ?? new Date().toISOString().split("T")[0],
      mode_paiement: m.cotisation?.mode_paiement ?? "virement",
      notes:         m.cotisation?.notes         ?? "",
      statut:        m.statut,
    });
  }

  async function saveEdit(memberId) {
    await mettreAJour(memberId, editData);
    setEditingId(null);
  }

  function exportCSV() {
    const lines = [
      ["Nom", "Bureau", "Statut", "Montant (FCFA)", "Date paiement", "Mode", "Notes"].join(";"),
      ...rows.map(m => [
        m.nom,
        m.bureau ? "Oui" : "Non",
        m.statut,
        m.cotisation?.montant || 0,
        m.cotisation?.date_paiement || "",
        m.cotisation?.mode_paiement || "",
        m.cotisation?.notes || "",
      ].join(";")),
    ].join("\n");
    const blob = new Blob(["﻿" + lines], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `cotisations_${annee}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const STAT_CARDS = [
    { label: "Ont payé", value: `${stats.payes} / ${stats.total_membres}`, icon: Check,     bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
    { label: "En attente", value: stats.enAttente,                          icon: Clock,     bg: "bg-amber-50",   text: "text-amber-600",   bar: "bg-amber-500"   },
    { label: "Exemptés",   value: stats.exemptes,                           icon: ShieldOff, bg: "bg-slate-50",   text: "text-slate-500",   bar: "bg-slate-400"   },
    { label: "Total collecté", value: `${stats.total.toLocaleString("fr-FR")} FCFA`, icon: Banknote, bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  ];

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Cotisations {annee}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Suivi des cotisations annuelles des membres</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))} className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1.5 h-9 px-3 bg-background border border-border rounded-xl text-sm">
            <span className="text-muted-foreground text-xs whitespace-nowrap">Montant défaut :</span>
            <input
              type="number" value={montantDefaut}
              onChange={e => setMontantDefaut(Number(e.target.value))}
              className="w-20 text-sm font-semibold text-foreground focus:outline-none bg-transparent"
            />
            <span className="text-xs text-muted-foreground">FCFA</span>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, bg, text, bar }) => (
          <div key={label} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border">
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

      {/* Filtres + recherche */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre…"
            className="pl-9 pr-3 h-9 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 w-52" />
        </div>
        {[
          { key: "tous",       label: `Tous (${stats.total_membres})` },
          { key: "payé",       label: `Payés (${stats.payes})` },
          { key: "en_attente", label: `En attente (${stats.enAttente})` },
          { key: "exempté",    label: `Exemptés (${stats.exemptes})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 h-9 rounded-xl text-xs font-semibold transition-colors ${
              filtre === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border text-muted-foreground hover:bg-muted"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Aucun membre trouvé.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Membre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Mode</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => {
                const cfg       = STATUT_CONFIG[m.statut] ?? STATUT_CONFIG["en_attente"];
                const isEditing = editingId === m.id;
                return (
                  <Fragment key={m.id}>
                    <tr className="hover:bg-muted/20 transition-colors">
                      {/* Membre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {m.photo ? (
                            <img src={m.photo} alt={m.nom}
                              className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0 border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Users className="w-3.5 h-3.5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-tight truncate">{m.nom}</p>
                            {m.bureau && (
                              <span className="text-[10px] text-primary font-bold uppercase tracking-wide">Bureau</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {m.cotisation?.montant
                          ? `${Number(m.cotisation.montant).toLocaleString("fr-FR")} FCFA`
                          : <span className="text-muted-foreground">—</span>}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {m.cotisation?.date_paiement ?? "—"}
                      </td>

                      {/* Mode */}
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden lg:table-cell">
                        {m.cotisation?.mode_paiement || "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end flex-wrap">
                          {m.statut !== "payé" && (
                            <button
                              onClick={() => marquerPaye(m.id, montantDefaut, "virement")}
                              disabled={saving}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50">
                              <Check className="w-3 h-3" /> Payé
                            </button>
                          )}
                          {m.statut === "en_attente" && (
                            <button
                              onClick={() => marquerExempte(m.id)}
                              disabled={saving}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50">
                              Exempter
                            </button>
                          )}
                          {m.statut !== "en_attente" && (
                            <button
                              onClick={() => marquerEnAttente(m.id)}
                              disabled={saving}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50">
                              <X className="w-3 h-3" /> Annuler
                            </button>
                          )}
                          <button
                            onClick={() => isEditing ? setEditingId(null) : startEdit(m)}
                            className="px-2.5 py-1 rounded-lg bg-background border border-border text-muted-foreground text-xs font-semibold hover:bg-muted transition-colors">
                            {isEditing ? "Fermer" : "Détails"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Panneau de détails inline */}
                    {isEditing && (
                      <tr>
                        <td colSpan={6} className="px-4 pb-4 bg-muted/20 border-b border-border">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut</label>
                              <select value={editData.statut}
                                onChange={e => setEditData(p => ({ ...p, statut: e.target.value }))}
                                className={sel}>
                                <option value="payé">Payé</option>
                                <option value="en_attente">En attente</option>
                                <option value="exempté">Exempté</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Montant (FCFA)</label>
                              <input type="number" value={editData.montant}
                                onChange={e => setEditData(p => ({ ...p, montant: Number(e.target.value) }))}
                                className={inp} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date paiement</label>
                              <input type="date" value={editData.date_paiement || ""}
                                onChange={e => setEditData(p => ({ ...p, date_paiement: e.target.value }))}
                                className={inp} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mode</label>
                              <select value={editData.mode_paiement}
                                onChange={e => setEditData(p => ({ ...p, mode_paiement: e.target.value }))}
                                className={sel}>
                                {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                              </select>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
                              <input value={editData.notes || ""}
                                onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))}
                                placeholder="Notes optionnelles…"
                                className={inp} />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => saveEdit(m.id)} disabled={saving}
                              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                              {saving ? "Enregistrement…" : "Enregistrer"}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                              Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
