import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/lib/memberStore";
import { Send, Users, Filter, Clock, CheckCircle, X, Loader2, Mail, ChevronDown } from "lucide-react";
import { inp, ta, Field } from "./shared";

const POSTES_EXPED = ["Le Bureau Exécutif", "La Présidente", "Le Secrétaire Général", "Le Trésorier"];

function Badge({ label, color = "bg-muted text-muted-foreground", onRemove }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
      {onRemove && <button onClick={onRemove} className="hover:opacity-70"><X className="w-3 h-3" /></button>}
    </span>
  );
}

export default function CirculaireSection() {
  const { allMembers } = useMemberStore({ realtime: false });
  const [form, setForm] = useState({ sujet: "", corps: "", expediteur: "Le Bureau Exécutif" });
  const [filtre, setFiltre] = useState("tous"); // tous | actifs | pays
  const [paysFiltre, setPaysFiltre] = useState("");
  const [selected, setSelected] = useState(null); // null = auto selon filtre, Set sinon
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [step, setStep] = useState("compose"); // compose | preview | done

  useEffect(() => {
    supabase.from("circulaires").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setHistory(data || []); setHistLoading(false); });
  }, []);

  const allPays = useMemo(() => [...new Set((allMembers || []).map(m => m.pays).filter(Boolean))].sort(), [allMembers]);

  const autoDestinataires = useMemo(() => {
    if (!allMembers) return [];
    let members = allMembers.filter(m => m.email);
    if (filtre === "actifs") members = members.filter(m => m.statut === "actif");
    if (filtre === "pays" && paysFiltre) members = members.filter(m => m.pays === paysFiltre);
    return members.map(m => ({ email: m.email, nom: m.nom }));
  }, [allMembers, filtre, paysFiltre]);

  const destinataires = selected !== null ? [...selected].map(email => {
    const m = allMembers?.find(mb => mb.email === email);
    return { email, nom: m?.nom || email };
  }) : autoDestinataires;

  function toggleMember(email) {
    setSelected(prev => {
      const s = prev === null ? new Set(autoDestinataires.map(d => d.email)) : new Set(prev);
      if (s.has(email)) s.delete(email); else s.add(email);
      return s;
    });
  }

  async function handleSend() {
    if (!form.sujet.trim() || !form.corps.trim()) { toast.error("Sujet et corps obligatoires."); return; }
    if (!destinataires.length) { toast.error("Aucun destinataire sélectionné."); return; }
    setSending(true);
    try {
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "circulaire", sujet: form.sujet, corps: form.corps, expediteur: form.expediteur, destinataires }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Erreur envoi");

      await supabase.from("circulaires").insert({
        sujet: form.sujet, corps: form.corps, expediteur: form.expediteur,
        nb_envoyes: result.sent, nb_erreurs: result.errors?.length || 0,
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
    setFiltre("tous"); setPaysFiltre(""); setSelected(null); setStep("compose");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">Email groupé — Circulaire</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Envoyez un message à tout ou partie des membres via Brevo</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">

        {/* ── Colonne gauche : composition ── */}
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
                  <select className={inp} value={form.expediteur} onChange={e => setForm(p => ({ ...p, expediteur: e.target.value }))}>
                    {POSTES_EXPED.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Sujet *">
                  <input className={inp} value={form.sujet} onChange={e => setForm(p => ({ ...p, sujet: e.target.value }))}
                    placeholder="Ex : Rappel Assemblée Générale 2026" />
                </Field>
                <Field label="Corps du message *">
                  <textarea className={inp} rows={8} value={form.corps}
                    onChange={e => setForm(p => ({ ...p, corps: e.target.value }))}
                    placeholder={"Chers membres,\n\nVotre message ici…\n\nBien cordialement,"} />
                </Field>

                {step === "preview" && (
                  <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Destinataires :</strong> {destinataires.length} membre{destinataires.length > 1 ? "s" : ""}</p>
                    <p><strong className="text-foreground">Expéditeur :</strong> {form.expediteur}</p>
                    <p><strong className="text-foreground">Sujet :</strong> {form.sujet}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  {step === "preview" && (
                    <button onClick={() => setStep("compose")} className="px-4 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted">
                      ← Modifier
                    </button>
                  )}
                  {step === "compose" ? (
                    <button onClick={() => { if (!form.sujet || !form.corps) { toast.error("Sujet et corps obligatoires."); return; } setStep("preview"); }}
                      className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90">
                      Prévisualiser →
                    </button>
                  ) : (
                    <button onClick={handleSend} disabled={sending}
                      className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
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
              <div className="flex items-center gap-2 p-5 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
            ) : history.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aucune circulaire envoyée.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {history.map(h => (
                  <div key={h.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{h.sujet}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{h.expediteur} · {new Date(h.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</p>
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

        {/* ── Colonne droite : destinataires ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="font-semibold text-sm text-foreground">Destinataires ({destinataires.length})</p>
          </div>
          <div className="p-4 space-y-3">
            {/* Filtres rapides */}
            <div className="space-y-2">
              {[
                { key: "tous", label: `Tous les membres (${(allMembers || []).filter(m => m.email).length})` },
                { key: "actifs", label: `Membres actifs (${(allMembers || []).filter(m => m.email && m.statut === "actif").length})` },
                { key: "pays", label: "Filtrer par pays" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="filtre" value={key} checked={filtre === key}
                    onChange={() => { setFiltre(key); setSelected(null); }}
                    className="accent-primary" />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
              {filtre === "pays" && (
                <select className={inp + " mt-1"} value={paysFiltre} onChange={e => { setPaysFiltre(e.target.value); setSelected(null); }}>
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
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer py-0.5 group">
                      <input type="checkbox" checked={isChecked}
                        onChange={() => toggleMember(m.email)}
                        className="accent-primary w-3.5 h-3.5" />
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
    </div>
  );
}
