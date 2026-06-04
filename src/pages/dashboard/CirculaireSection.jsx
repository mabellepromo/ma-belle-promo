import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/lib/memberStore";
import {
  Send, Users, Clock, CheckCircle, X, Loader2, Mail,
  CalendarDays, Newspaper, Megaphone, Paperclip,
} from "lucide-react";
import { inp, Field } from "./shared";

const POSTES_EXPED = ["Le Bureau Exécutif", "La Présidente", "Le Secrétaire Général", "Le Trésorier"];

const STATUT_CFG = {
  publie:    { label: "Publié",    color: "bg-emerald-500/15 text-emerald-400" },
  brouillon: { label: "Brouillon", color: "bg-amber-500/15 text-amber-500" },
};

const MOIS_MAP = {
  jan: 0, fév: 1, fev: 1, feb: 1, mar: 2, avr: 3, apr: 3, mai: 4,
  juin: 5, jun: 5, juil: 6, jul: 6, août: 7, aout: 7, aug: 7,
  sep: 8, oct: 9, nov: 10, déc: 11, dec: 11,
};

const MOIS_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

function parseDateStr(s) {
  if (!s) return null;
  const p = s.trim().split(/\s+/);
  if (p.length < 3) return null;
  const key = p[1].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").substring(0, 4);
  const m = MOIS_MAP[p[1].toLowerCase()] ?? MOIS_MAP[key];
  if (m === undefined) return null;
  const d = new Date(parseInt(p[2]), m, parseInt(p[0]));
  return isNaN(d.getTime()) ? null : d;
}

function toMonthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return `${MOIS_LABELS[m - 1]} ${y}`;
}

function Badge({ label, color = "bg-muted text-muted-foreground", onRemove }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
      {onRemove && <button onClick={onRemove} className="hover:opacity-70"><X className="w-3 h-3" /></button>}
    </span>
  );
}

// ── Onglet Calendrier éditorial ──────────────────────────────────────────────
function CalendrierTab() {
  const [articles, setArticles]   = useState([]);
  const [comms, setComms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);

  useEffect(() => {
    Promise.all([
      supabase
        .from("articles")
        .select("id, titre, statut, date_iso, created_at")
        .order("date_iso", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("communiques")
        .select("id, titre, date, type")
        .order("created_at", { ascending: false }),
    ]).then(([{ data: arts }, { data: coms }]) => {
      setArticles(arts || []);
      setComms(coms || []);
      setLoading(false);
    });
  }, []);

  async function toggleStatut(art) {
    const next = art.statut === "publie" ? "brouillon" : "publie";
    setUpdating(art.id);
    const { error } = await supabase
      .from("articles")
      .update({ statut: next, updated_at: new Date().toISOString() })
      .eq("id", art.id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      setArticles(prev => prev.map(a => a.id === art.id ? { ...a, statut: next } : a));
      toast.success(next === "publie" ? `"${art.titre}" → Publié` : `"${art.titre}" → Brouillon`);
    }
    setUpdating(null);
  }

  const groups = useMemo(() => {
    const items = [
      ...articles.map(a => ({
        type: "article",
        id: a.id,
        titre: a.titre,
        statut: a.statut,
        date: a.date_iso
          ? new Date(a.date_iso + "T00:00:00")
          : (a.created_at ? new Date(a.created_at) : null),
        _raw: a,
      })),
      ...comms.map(c => ({
        type: "communique",
        id: c.id,
        titre: c.titre,
        statut: "publie",
        date: parseDateStr(c.date),
        subtype: c.type,
        _raw: c,
      })),
    ].filter(item => item.date);

    items.sort((a, b) => b.date - a.date);

    const map = {};
    items.forEach(item => {
      const k = toMonthKey(item.date);
      if (!map[k]) map[k] = [];
      map[k].push(item);
    });

    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [articles, comms]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground p-8">Aucune publication trouvée.</p>;
  }

  return (
    <div className="space-y-7">
      {groups.map(([key, items]) => (
        <div key={key}>
          {/* En-tête du mois */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-foreground">{monthLabel(key)}</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {items.length} publication{items.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Publications du mois */}
          <div className="space-y-2">
            {items.map(item => {
              const cfg = STATUT_CFG[item.statut] ?? { label: item.statut, color: "bg-muted text-muted-foreground" };
              const isArticle = item.type === "article";
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  {/* Icône type */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    isArticle
                      ? "bg-primary/10 text-primary"
                      : "bg-violet-500/10 text-violet-400"
                  }`}>
                    {isArticle
                      ? <Newspaper className="w-3.5 h-3.5" />
                      : <Megaphone className="w-3.5 h-3.5" />}
                  </div>

                  {/* Titre + sous-type */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">{item.titre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isArticle ? "Article" : `Communiqué${item.subtype ? " — " + item.subtype : ""}`}
                      {" · "}
                      {item.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Badge statut + bouton basculer (articles seulement) */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {isArticle && (
                      <button
                        onClick={() => toggleStatut(item._raw)}
                        disabled={updating === item.id}
                        className="text-xs px-2 py-0.5 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
                      >
                        {updating === item.id
                          ? <Loader2 className="w-3 h-3 animate-spin inline" />
                          : item.statut === "publie" ? "→ Brouillon" : "→ Publier"
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section principale ───────────────────────────────────────────────────────
export default function CirculaireSection() {
  const { allMembers } = useMemberStore({ realtime: false });
  const [activeTab, setActiveTab]   = useState("circulaire");
  const [form, setForm]             = useState({ sujet: "", corps: "", expediteur: "Le Bureau Exécutif" });
  const [attachments, setAttachments] = useState([]);
  const [filtre, setFiltre]         = useState("tous");
  const [paysFiltre, setPaysFiltre] = useState("");
  const [selected, setSelected]     = useState(null);
  const [sending, setSending]       = useState(false);
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [step, setStep]             = useState("compose");

  useEffect(() => {
    supabase.from("circulaires").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data, error }) => {
        if (error) toast.error("Impossible de charger l'historique : " + error.message);
        setHistory(data || []);
        setHistLoading(false);
      });
  }, []);

  const allPays = useMemo(() =>
    [...new Set((allMembers || []).map(m => m.pays).filter(Boolean))].sort(),
    [allMembers]
  );

  const autoDestinataires = useMemo(() => {
    if (!allMembers) return [];
    let members = allMembers.filter(m => m.email);
    if (filtre === "actifs") members = members.filter(m => m.statut === "actif");
    if (filtre === "pays" && paysFiltre) members = members.filter(m => m.pays === paysFiltre);
    return members.map(m => ({ email: m.email, nom: m.nom }));
  }, [allMembers, filtre, paysFiltre]);

  const destinataires = selected !== null
    ? [...selected].map(email => {
        const m = allMembers?.find(mb => mb.email === email);
        return { email, nom: m?.nom || email };
      })
    : autoDestinataires;

  function toggleMember(email) {
    setSelected(prev => {
      const s = prev === null
        ? new Set(autoDestinataires.map(d => d.email))
        : new Set(prev);
      if (s.has(email)) s.delete(email); else s.add(email);
      return s;
    });
  }

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, content: btoa(reader.result) });
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  async function handleFileInput(e) {
    const picked = Array.from(e.target.files || []);
    const converted = await Promise.all(picked.map(fileToBase64));
    setAttachments(prev => [...prev, ...converted].slice(0, 5));
    e.target.value = "";
  }

  function removeAttachment(i) {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSend() {
    if (!form.sujet.trim() || !form.corps.trim()) { toast.error("Sujet et corps obligatoires."); return; }
    if (!destinataires.length) { toast.error("Aucun destinataire sélectionné."); return; }
    setSending(true);
    try {
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "circulaire",
          sujet: form.sujet,
          corps: form.corps,
          expediteur: form.expediteur,
          destinataires,
          attachments: attachments.length ? attachments : undefined,
        }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Erreur envoi");

      await supabase.from("circulaires").insert({
        sujet: form.sujet,
        corps: form.corps,
        expediteur: form.expediteur,
        nb_envoyes: result.sent,
        nb_erreurs: result.errors?.length || 0,
      });

      toast.success(`${result.sent} email${result.sent > 1 ? "s" : ""} envoyé${result.sent > 1 ? "s" : ""} !`);
      if (result.errors?.length) toast.warning(`${result.errors.length} échec(s) — vérifiez les adresses.`);
      setStep("done");
      const { data } = await supabase.from("circulaires").select("*").order("created_at", { ascending: false }).limit(20);
      setHistory(data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setForm({ sujet: "", corps: "", expediteur: "Le Bureau Exécutif" });
    setAttachments([]);
    setFiltre("tous"); setPaysFiltre(""); setSelected(null); setStep("compose");
  }

  return (
    <div className="space-y-6">

      {/* En-tête + onglets */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">Circulaire &amp; Publications</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Email groupé aux membres et calendrier éditorial</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          { key: "circulaire",  label: "Email groupé",          icon: Mail },
          { key: "calendrier",  label: "Calendrier éditorial",  icon: CalendarDays },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Circulaire ── */}
      {activeTab === "circulaire" && (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Colonne gauche : composition + historique */}
          <div className="space-y-5">

            {step === "done" ? (
              <div className="bg-emerald-500/15 border border-emerald-500/25 rounded-2xl p-8 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <div>
                  <p className="font-bold text-emerald-400 text-lg">Circulaire envoyée !</p>
                  <p className="text-sm text-emerald-400 mt-1">Consultez l'historique ci-dessous pour les détails.</p>
                </div>
                <button onClick={reset} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                  Nouvelle circulaire
                </button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">
                    {step === "compose" ? "Composer la circulaire" : "Prévisualisation"}
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <Field label="Expéditeur affiché">
                    <select
                      className={inp}
                      value={form.expediteur}
                      onChange={e => setForm(p => ({ ...p, expediteur: e.target.value }))}
                    >
                      {POSTES_EXPED.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Sujet *">
                    <input
                      className={inp}
                      value={form.sujet}
                      onChange={e => setForm(p => ({ ...p, sujet: e.target.value }))}
                      placeholder="Ex : Rappel Assemblée Générale 2026"
                    />
                  </Field>
                  <Field label="Corps du message *">
                    <textarea
                      className={inp}
                      rows={8}
                      value={form.corps}
                      onChange={e => setForm(p => ({ ...p, corps: e.target.value }))}
                      placeholder={"Chers membres,\n\nVotre message ici…\n\nBien cordialement,"}
                    />
                  </Field>

                  {/* Pièces jointes */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Pièces jointes {attachments.length > 0 && <span className="text-primary">({attachments.length}/5)</span>}
                    </p>
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {attachments.map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/8 border border-primary/20 rounded-lg text-xs font-medium text-primary max-w-[220px]">
                            <Paperclip className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{a.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)}
                              className="ml-1 text-primary/60 hover:text-red-500 transition-colors flex-shrink-0">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {attachments.length < 5 && (
                      <label className="flex items-center gap-3 p-3 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                        <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">Ajouter un fichier… (max 5, joint à chaque email)</span>
                        <input type="file" multiple className="hidden" onChange={handleFileInput} />
                      </label>
                    )}
                  </div>

                  {step === "preview" && (
                    <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-1">
                      <p><strong className="text-foreground">Destinataires :</strong> {destinataires.length} membre{destinataires.length > 1 ? "s" : ""}</p>
                      <p><strong className="text-foreground">Expéditeur :</strong> {form.expediteur}</p>
                      <p><strong className="text-foreground">Sujet :</strong> {form.sujet}</p>
                      {attachments.length > 0 && (
                        <p><strong className="text-foreground">Pièces jointes :</strong> {attachments.map(a => a.name).join(", ")}</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    {step === "preview" && (
                      <button
                        onClick={() => setStep("compose")}
                        className="px-4 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted"
                      >
                        ← Modifier
                      </button>
                    )}
                    {step === "compose" ? (
                      <button
                        onClick={() => {
                          if (!form.sujet || !form.corps) { toast.error("Sujet et corps obligatoires."); return; }
                          setStep("preview");
                        }}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90"
                      >
                        Prévisualiser →
                      </button>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Envoyer à {destinataires.length} membre{destinataires.length > 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Historique */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-sm text-foreground">Historique des envois</p>
              </div>
              {histLoading ? (
                <div className="flex items-center gap-2 p-5 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                </div>
              ) : history.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">Aucune circulaire envoyée.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {history.map(h => (
                    <div key={h.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{h.sujet}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {h.expediteur} · {new Date(h.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 font-semibold">{h.nb_envoyes} envoyés</span>
                          {h.nb_erreurs > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400">{h.nb_erreurs} erreurs</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : destinataires */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-sm text-foreground">Destinataires ({destinataires.length})</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {[
                  { key: "tous",   label: `Tous les membres (${(allMembers || []).filter(m => m.email).length})` },
                  { key: "actifs", label: `Membres actifs (${(allMembers || []).filter(m => m.email && m.statut === "actif").length})` },
                  { key: "pays",   label: "Filtrer par pays" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filtre"
                      value={key}
                      checked={filtre === key}
                      onChange={() => { setFiltre(key); setSelected(null); }}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
                {filtre === "pays" && (
                  <select
                    className={inp + " mt-1"}
                    value={paysFiltre}
                    onChange={e => { setPaysFiltre(e.target.value); setSelected(null); }}
                  >
                    <option value="">— Choisir un pays —</option>
                    {allPays.map(p => <option key={p}>{p}</option>)}
                  </select>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Liste</p>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {(allMembers || []).filter(m => m.email).map(m => {
                    const inAuto = autoDestinataires.some(d => d.email === m.email);
                    const isChecked = selected === null ? inAuto : selected.has(m.email);
                    return (
                      <label key={m.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(m.email)}
                          className="accent-primary w-3.5 h-3.5"
                        />
                        <span className={`text-xs truncate ${isChecked ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {m.nom}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet Calendrier éditorial ── */}
      {activeTab === "calendrier" && <CalendrierTab />}
    </div>
  );
}
