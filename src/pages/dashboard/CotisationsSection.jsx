import { useState, useMemo, Fragment } from "react";
import { toast } from "sonner";
import {
  Check, Clock, X, Download, Search, Banknote, Users, ShieldOff,
  Mail, Send, AlertTriangle, Plus, CreditCard, FileText,
} from "lucide-react";
import { useCotisations } from "../../hooks/useCotisations";
import { inp, sel } from "./shared";
import { genererRecu } from "../../lib/documentGenerators";

const STATUT_CONFIG = {
  "payé":       { label: "Payé",       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "partiel":    { label: "Partiel",    color: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"    },
  "en_attente": { label: "En attente", color: "bg-amber-100 text-amber-700",     dot: "bg-amber-500"   },
  "exempté":    { label: "Exempté",    color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"   },
};

const MODES = ["virement", "mobile money", "Orange Money", "espèces", "autre"];

function recalcFromVersements(versements, montantAttendu) {
  const total = versements.reduce((s, v) => s + Number(v.montant || 0), 0);
  const statut = total <= 0 ? "en_attente" : total >= montantAttendu ? "payé" : "partiel";
  const last = versements[versements.length - 1];
  return { montant: total, statut, date_paiement: last?.date ?? null, mode_paiement: last?.mode ?? null };
}

export default function CotisationsSection({ members }) {
  const currentYear = new Date().getFullYear();
  const [annee,          setAnnee]          = useState(currentYear);
  const [filtre,         setFiltre]         = useState("tous");
  const [search,         setSearch]         = useState("");
  const [montantDefaut,  setMontantDefaut]  = useState(30000);
  const [editingId,      setEditingId]      = useState(null);
  const [editData,       setEditData]       = useState({});
  const [versementForm,  setVersementForm]  = useState({ date: "", montant: "", mode: "virement" });
  const [showRelance,    setShowRelance]    = useState(null); // null | "all" | { id, email, nom }
  const [relanceMsg,     setRelanceMsg]     = useState("");
  const [sendingRelance, setSendingRelance] = useState(false);

  const { cotisations, loading, saving, marquerPaye, marquerEnAttente, marquerExempte, mettreAJour } =
    useCotisations(annee);

  const years = Array.from({ length: 8 }, (_, i) => currentYear + 2 - i);

  const rows = useMemo(() => (members ?? []).map(m => {
    const cot = cotisations.find(c => String(c.member_id) === String(m.id));
    return { ...m, cotisation: cot ?? null, statut: cot?.statut ?? "en_attente" };
  }), [members, cotisations]);

  const filtered = useMemo(() => {
    let r = rows;
    if (filtre !== "tous") r = r.filter(m => m.statut === filtre);
    if (search) {
      const q = search.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      r = r.filter(m => m.nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q));
    }
    return r;
  }, [rows, filtre, search]);

  const stats = useMemo(() => {
    const payes    = rows.filter(m => m.statut === "payé");
    const partiels = rows.filter(m => m.statut === "partiel");
    const enAttente = rows.filter(m => m.statut === "en_attente");
    const exemptes  = rows.filter(m => m.statut === "exempté");
    const total     = [...payes, ...partiels].reduce((s, m) => s + (m.cotisation?.montant || 0), 0);
    return { payes: payes.length, partiels: partiels.length, enAttente: enAttente.length, exemptes: exemptes.length, total, total_membres: rows.length };
  }, [rows]);

  // Pour la relance : en_attente ET partiel sont relançables
  const relancables          = rows.filter(m => ["en_attente", "partiel"].includes(m.statut) && m.email);
  const relancablesSansEmail = rows.filter(m => ["en_attente", "partiel"].includes(m.statut) && !m.email);

  const membresARelancer = showRelance === "all" ? relancables
    : showRelance ? [showRelance].filter(m => m.email)
    : [];
  const membresIgnores = showRelance === "all" ? relancablesSansEmail : [];

  function startEdit(m) {
    setEditingId(m.id);
    setEditData({
      montant:       m.cotisation?.montant       ?? 0,
      date_paiement: m.cotisation?.date_paiement ?? new Date().toISOString().split("T")[0],
      mode_paiement: m.cotisation?.mode_paiement ?? "virement",
      notes:         m.cotisation?.notes         ?? "",
      statut:        m.statut,
      versements:    m.cotisation?.versements    ?? [],
    });
    setVersementForm({ date: new Date().toISOString().split("T")[0], montant: "", mode: "virement" });
  }

  async function saveEdit(memberId) {
    await mettreAJour(memberId, editData);
    setEditingId(null);
  }

  function addVersement() {
    const montant = Number(versementForm.montant);
    if (!montant || montant <= 0) return;
    const v = { date: versementForm.date, montant, mode: versementForm.mode };
    const updated = [...(editData.versements ?? []), v];
    const calc = recalcFromVersements(updated, montantDefaut);
    setEditData(p => ({ ...p, versements: updated, ...calc }));
    setVersementForm(p => ({ ...p, montant: "" }));
  }

  function removeVersement(i) {
    const updated = (editData.versements ?? []).filter((_, idx) => idx !== i);
    if (updated.length === 0) {
      setEditData(p => ({ ...p, versements: [], montant: 0, statut: "en_attente", date_paiement: null, mode_paiement: null }));
    } else {
      const calc = recalcFromVersements(updated, montantDefaut);
      setEditData(p => ({ ...p, versements: updated, ...calc }));
    }
  }

  async function envoyerRelance() {
    if (membresARelancer.length === 0) return;
    setSendingRelance(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "relance_cotisation",
          membres: membresARelancer.map(m => ({ email: m.email, nom: m.nom })),
          annee,
          message: relanceMsg.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.sent} relance${data.sent > 1 ? "s" : ""} envoyée${data.sent > 1 ? "s" : ""} !`);
        if (data.errors?.length > 0) toast.warning(`${data.errors.length} envoi(s) échoué(s).`);
        setShowRelance(null);
        setRelanceMsg("");
      } else {
        toast.error(data.error || "Erreur lors de l'envoi.");
      }
    } catch (err) {
      toast.error("Erreur réseau : " + err.message);
    } finally {
      setSendingRelance(false);
    }
  }

  function exportCSV() {
    const lines = [
      ["Nom", "Bureau", "Statut", "Versé (FCFA)", "Attendu (FCFA)", "Reste (FCFA)", "Dernier paiement", "Mode", "Notes"].join(";"),
      ...rows.map(m => {
        const verse = m.cotisation?.montant || 0;
        const exempte = m.statut === "exempté";
        const reste = exempte ? 0 : Math.max(0, montantDefaut - verse);
        return [
          m.nom, m.bureau ? "Oui" : "Non", m.statut,
          verse, exempte ? 0 : montantDefaut, reste,
          m.cotisation?.date_paiement || "", m.cotisation?.mode_paiement || "", m.cotisation?.notes || "",
        ].join(";");
      }),
    ].join("\n");
    const blob = new Blob(["﻿" + lines], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `cotisations_${annee}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const STAT_CARDS = [
    { label: "Payés (complet)", value: `${stats.payes} / ${stats.total_membres}`, icon: Check,       bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
    { label: "Paiement partiel",  value: stats.partiels,                           icon: CreditCard,  bg: "bg-blue-50",    text: "text-blue-600",    bar: "bg-blue-500"    },
    { label: "En attente",         value: stats.enAttente,                          icon: Clock,       bg: "bg-amber-50",   text: "text-amber-600",   bar: "bg-amber-500"   },
    { label: "Total collecté", value: `${stats.total.toLocaleString("fr-FR")} FCFA`, icon: Banknote, bg: "bg-violet-50", text: "text-violet-600", bar: "bg-violet-500" },
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
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1.5 h-9 px-3 bg-background border border-border rounded-xl text-sm">
            <span className="text-muted-foreground text-xs whitespace-nowrap">Montant attendu :</span>
            <input type="number" value={montantDefaut}
              onChange={e => setMontantDefaut(Number(e.target.value))}
              className="w-20 text-sm font-semibold text-foreground focus:outline-none bg-transparent" />
            <span className="text-xs text-muted-foreground">FCFA</span>
          </div>
          {relancables.length > 0 && (
            <button onClick={() => setShowRelance("all")}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-amber-200 bg-amber-50 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
              <Mail className="w-3.5 h-3.5" /> Relancer tous ({relancables.length})
            </button>
          )}
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* ── Modale relance ── */}
      {showRelance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              {showRelance === "all"
                ? `Relance groupée — cotisations ${annee}`
                : `Relancer ${membresARelancer[0]?.nom ?? ""}`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {membresARelancer.length > 0
                ? `${membresARelancer.length} email${membresARelancer.length > 1 ? "s" : ""} seront envoyés.`
                : "Ce membre n'a pas d'adresse email enregistrée."}
            </p>

            {membresIgnores.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>{membresIgnores.length} membre{membresIgnores.length > 1 ? "s" : ""}</strong> sans email seront ignoré{membresIgnores.length > 1 ? "s" : ""} : {membresIgnores.map(m => m.nom).join(", ")}.
                </p>
              </div>
            )}

            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Message personnalisé <span className="font-normal">(optionnel — laissez vide pour le message par défaut)</span>
            </label>
            <textarea value={relanceMsg} onChange={e => setRelanceMsg(e.target.value)}
              placeholder="Laissez vide pour le message par défaut…"
              rows={4}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none mb-4" />

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowRelance(null); setRelanceMsg(""); }} disabled={sendingRelance}
                className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button onClick={envoyerRelance}
                disabled={sendingRelance || membresARelancer.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
                {sendingRelance
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
                  : <><Send className="w-3.5 h-3.5" /> Envoyer {membresARelancer.length > 1 ? `${membresARelancer.length} relances` : "la relance"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIB */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
          <Banknote className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Coordonnées bancaires — ECOBANK Togo</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border text-xs">
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Titulaire</p>
            <p className="font-semibold text-foreground">ASSOCIATION MA BELLE PROMO MBP</p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">IBAN</p>
            <p className="font-mono font-semibold text-foreground tracking-wide">TG53TG0550171014176638800153</p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Swift / BIC</p>
            <p className="font-mono font-semibold text-foreground">ECOCTGTGXXX</p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">N° de compte</p>
            <p className="font-mono font-semibold text-foreground">141766388001</p>
          </div>
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
          { key: "partiel",    label: `Partiel (${stats.partiels})` },
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Versé / Attendu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Reste à payer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Dernier versement</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => {
                const cfg       = STATUT_CONFIG[m.statut] ?? STATUT_CONFIG["en_attente"];
                const isEditing = editingId === m.id;
                const verse     = m.cotisation?.montant || 0;
                const exempte   = m.statut === "exempté";
                const reste     = exempte ? 0 : Math.max(0, montantDefaut - verse);
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
                            {m.bureau && <span className="text-[10px] text-primary font-bold uppercase tracking-wide">Bureau</span>}
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

                      {/* Versé / Attendu */}
                      <td className="px-4 py-3">
                        {exempte ? (
                          <span className="text-xs text-muted-foreground italic">Exempté</span>
                        ) : verse > 0 ? (
                          <div>
                            <span className="text-sm font-semibold text-foreground">{verse.toLocaleString("fr-FR")}</span>
                            <span className="text-xs text-muted-foreground"> / {montantDefaut.toLocaleString("fr-FR")} FCFA</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">— / {montantDefaut.toLocaleString("fr-FR")} FCFA</span>
                        )}
                      </td>

                      {/* Reste à payer */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {exempte ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : reste > 0 ? (
                          <span className="text-sm font-semibold text-amber-600">{reste.toLocaleString("fr-FR")} FCFA</span>
                        ) : verse > 0 ? (
                          <span className="text-xs font-semibold text-emerald-600">Complet ✓</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{montantDefaut.toLocaleString("fr-FR")} FCFA</span>
                        )}
                      </td>

                      {/* Dernier versement */}
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden lg:table-cell">
                        {m.cotisation?.date_paiement
                          ? `${m.cotisation.date_paiement}${m.cotisation.mode_paiement ? ` · ${m.cotisation.mode_paiement}` : ""}`
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end flex-wrap">
                          {m.statut !== "payé" && m.statut !== "exempté" && (
                            <button onClick={() => marquerPaye(m.id, montantDefaut, "virement")} disabled={saving}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50">
                              <Check className="w-3 h-3" /> Payé
                            </button>
                          )}
                          {(m.statut === "en_attente" || m.statut === "partiel") && (
                            <button onClick={() => marquerExempte(m.id)} disabled={saving}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50">
                              Exempter
                            </button>
                          )}
                          {(m.statut === "en_attente" || m.statut === "partiel") && m.email && (
                            <button onClick={() => setShowRelance({ id: m.id, email: m.email, nom: m.nom })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
                              <Mail className="w-3 h-3" /> Relancer
                            </button>
                          )}
                          {(m.statut === "payé" || m.statut === "partiel") && (
                            <button
                              onClick={() => genererRecu(m, annee, m.cotisation?.montant || montantDefaut, m.cotisation?.date_paiement, m.cotisation?.mode_paiement)}
                              title="Générer le reçu de cotisation"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
                              <FileText className="w-3 h-3" /> Reçu
                            </button>
                          )}
                          {(m.statut === "payé" || m.statut === "exempté" || m.statut === "partiel") && (
                            <button onClick={() => marquerEnAttente(m.id)} disabled={saving}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                              <X className="w-3 h-3" /> Annuler
                            </button>
                          )}
                          <button onClick={() => isEditing ? setEditingId(null) : startEdit(m)}
                            className="px-2.5 py-1 rounded-lg bg-background border border-border text-muted-foreground text-xs font-semibold hover:bg-muted transition-colors">
                            {isEditing ? "Fermer" : "Détails"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Panneau de détails inline ── */}
                    {isEditing && (
                      <tr>
                        <td colSpan={6} className="px-4 pb-4 bg-muted/20 border-b border-border">
                          <div className="pt-3 space-y-4">

                            {/* Versements */}
                            <div>
                              {/* Résumé financier */}
                              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Versements</label>
                                <div className="flex items-center gap-3 text-xs bg-muted/40 rounded-lg px-3 py-1.5">
                                  <span className="text-muted-foreground">Versé :</span>
                                  <span className="font-bold text-foreground">{(editData.montant ?? 0).toLocaleString("fr-FR")} FCFA</span>
                                  {editData.statut !== "exempté" && (
                                    <>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-muted-foreground">Attendu :</span>
                                      <span className="font-semibold text-foreground">{montantDefaut.toLocaleString("fr-FR")} FCFA</span>
                                      <span className="text-muted-foreground">·</span>
                                      {Math.max(0, montantDefaut - (editData.montant ?? 0)) > 0 ? (
                                        <>
                                          <span className="text-muted-foreground">Reste :</span>
                                          <span className="font-bold text-amber-600">
                                            {Math.max(0, montantDefaut - (editData.montant ?? 0)).toLocaleString("fr-FR")} FCFA
                                          </span>
                                        </>
                                      ) : (
                                        <span className="font-bold text-emerald-600">Complet ✓</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Liste des versements existants */}
                              {(editData.versements ?? []).length > 0 && (
                                <div className="space-y-1.5 mb-3">
                                  {(editData.versements ?? []).map((v, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 text-xs">
                                      <span className="font-bold text-foreground">{Number(v.montant).toLocaleString("fr-FR")} FCFA</span>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-muted-foreground">{v.date}</span>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-muted-foreground capitalize">{v.mode}</span>
                                      <button onClick={() => removeVersement(i)}
                                        className="ml-auto w-5 h-5 rounded-md bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Formulaire ajout versement */}
                              <div className="flex items-end gap-2 flex-wrap">
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Date</label>
                                  <input type="date" value={versementForm.date}
                                    onChange={e => setVersementForm(p => ({ ...p, date: e.target.value }))}
                                    className={inp + " w-36"} />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Montant (FCFA)</label>
                                  <input type="number" value={versementForm.montant}
                                    onChange={e => setVersementForm(p => ({ ...p, montant: e.target.value }))}
                                    placeholder={`ex: ${montantDefaut}`}
                                    className={inp + " w-36"} />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Mode</label>
                                  <select value={versementForm.mode}
                                    onChange={e => setVersementForm(p => ({ ...p, mode: e.target.value }))}
                                    className={sel}>
                                    {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                  </select>
                                </div>
                                <button onClick={addVersement}
                                  disabled={!versementForm.montant || Number(versementForm.montant) <= 0}
                                  className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
                                  <Plus className="w-3.5 h-3.5" /> Ajouter
                                </button>
                              </div>
                            </div>

                            {/* Statut + Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut</label>
                                <select value={editData.statut}
                                  onChange={e => setEditData(p => ({ ...p, statut: e.target.value }))}
                                  className={sel}>
                                  <option value="payé">Payé</option>
                                  <option value="partiel">Partiel</option>
                                  <option value="en_attente">En attente</option>
                                  <option value="exempté">Exempté</option>
                                </select>
                              </div>
                              <div className="md:col-span-3">
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
                                <input value={editData.notes || ""}
                                  onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))}
                                  placeholder="Notes optionnelles…"
                                  className={inp} />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(m.id)} disabled={saving}
                                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                {saving ? "Enregistrement…" : "Enregistrer"}
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                                Fermer
                              </button>
                            </div>
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
