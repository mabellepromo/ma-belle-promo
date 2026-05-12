import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, Link2, BarChart2, Eye, EyeOff, Loader2, X,
  ChevronUp, ChevronDown, Send, Check, Clock, UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  useSondages, getSondageResults, getInvitationStats,
  createInvitations, markInvitationsSent,
} from "../../hooks/useSondages";
import { inp, Field } from "./shared";

const COLORS = ["bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];

const Q_TYPES = [
  { value: "single",   label: "Choix unique" },
  { value: "multiple", label: "Choix multiple" },
  { value: "ouinon",   label: "Oui / Non" },
  { value: "texte",    label: "Texte libre" },
  { value: "note",     label: "Note /5" },
];

const Q_TYPE_LABELS = {
  ouinon: "Oui/Non", single: "Choix unique",
  multiple: "Choix multiple", texte: "Texte libre", note: "Note /5",
};

// ── Résultats par question (vue admin) ─────────────────────────────────────
function QuestionResults({ question, reponses, total }) {
  const qr = reponses.filter(r => r.question_id === question.id);

  if (question.type === "texte") {
    const textes = qr.map(r => r.valeur_texte).filter(Boolean);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-1">{textes.length} réponse{textes.length !== 1 ? "s" : ""}</p>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {textes.length === 0
            ? <p className="text-xs text-muted-foreground italic">Aucune réponse.</p>
            : textes.map((t, i) => (
              <div key={i} className="text-xs bg-muted/60 rounded-lg px-2.5 py-1.5 text-foreground">{t}</div>
            ))}
        </div>
      </div>
    );
  }

  if (question.type === "note") {
    const notes = qr.map(r => r.valeur_note).filter(v => v != null);
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "—";
    const counts = [1, 2, 3, 4, 5].map(n => notes.filter(v => v === n).length);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Moyenne : <strong className="text-foreground">{avg} / 5</strong> · {notes.length} réponse{notes.length !== 1 ? "s" : ""}
        </p>
        {[1, 2, 3, 4, 5].map(n => {
          const pct = notes.length ? Math.round((counts[n - 1] / notes.length) * 100) : 0;
          return (
            <div key={n} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-5 text-center text-muted-foreground">{n}★</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs w-5 text-right text-muted-foreground">{counts[n - 1]}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const options = question.type === "ouinon" ? ["Oui", "Non"] : (question.options || []);
  const counts = options.map((_, i) => qr.filter(r => r.valeur_options?.includes(i)).length);
  const qTotal = qr.length;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground mb-1">{qTotal} réponse{qTotal !== 1 ? "s" : ""}</p>
      {options.map((opt, i) => {
        const pct = qTotal > 0 ? Math.round((counts[i] / qTotal) * 100) : 0;
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="truncate flex-1 mr-2 text-foreground">{opt}</span>
              <span className="font-bold text-foreground flex-shrink-0">{pct}% ({counts[i]})</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${COLORS[i % COLORS.length]}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Constructeur de question ───────────────────────────────────────────────
function QuestionBuilder({ q, idx, total, onChange, onRemove, onMove }) {
  const needsOptions = q.type === "single" || q.type === "multiple";

  function setOptVal(i, val) {
    const opts = [...(q.options || [])]; opts[i] = val;
    onChange({ ...q, options: opts });
  }
  function addOpt() { onChange({ ...q, options: [...(q.options || []), ""] }); }
  function removeOpt(i) { onChange({ ...q, options: (q.options || []).filter((_, j) => j !== i) }); }
  function moveOpt(i, dir) {
    const opts = [...(q.options || [])];
    const j = i + dir;
    if (j < 0 || j >= opts.length) return;
    [opts[i], opts[j]] = [opts[j], opts[i]];
    onChange({ ...q, options: opts });
  }
  function changeType(newType) {
    const needsOpts = newType === "single" || newType === "multiple";
    onChange({ ...q, type: newType, options: needsOpts ? (q.options?.length >= 2 ? q.options : ["", ""]) : [] });
  }

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0 pt-1">
          <button type="button" onClick={() => onMove(idx, -1)} disabled={idx === 0}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <span className="text-xs font-bold text-muted-foreground pt-1.5 w-5 text-center">{idx + 1}</span>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex gap-1 flex-wrap">
            {Q_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => changeType(t.value)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                  q.type === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-white"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <input className={inp} value={q.libelle}
            onChange={e => onChange({ ...q, libelle: e.target.value })}
            placeholder="Libellé de la question…" />
          {needsOptions && (
            <div className="space-y-1.5 pl-1">
              {(q.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-0">
                    <button type="button" onClick={() => moveOpt(i, -1)} disabled={i === 0}
                      className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <ChevronUp className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => moveOpt(i, 1)} disabled={i === (q.options?.length || 0) - 1}
                      className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLORS[i % COLORS.length]}`} />
                  <input className={`${inp} flex-1 text-sm`} value={opt}
                    onChange={e => setOptVal(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOpt(); } }}
                  />
                  <button type="button" onClick={() => removeOpt(i)}
                    disabled={(q.options?.length || 0) <= 2}
                    className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-20">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOpt}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                <Plus className="w-3.5 h-3.5" /> Ajouter une option
              </button>
            </div>
          )}
          {q.type === "ouinon" && (
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">Oui</span>
              <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">Non</span>
            </div>
          )}
          {q.type === "texte" && (
            <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">Zone de texte libre…</div>
          )}
          {q.type === "note" && (
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map(n => <span key={n} className="text-amber-300 text-lg">★</span>)}
              <span className="text-xs text-muted-foreground ml-1">de 1 à 5</span>
            </div>
          )}
        </div>
        <button type="button" onClick={onRemove} disabled={total <= 1}
          className="w-7 h-7 mt-0.5 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-20 flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="pl-12">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={q.obligatoire}
            onChange={e => onChange({ ...q, obligatoire: e.target.checked })}
            className="w-3.5 h-3.5 rounded accent-primary" />
          <span className="text-xs text-muted-foreground">Obligatoire</span>
        </label>
      </div>
    </div>
  );
}

// ── Modal d'invitation ─────────────────────────────────────────────────────
function InviteModal({ sondage, onClose, origin }) {
  const [members, setMembers] = useState(null); // null = pas encore chargé
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [extraEmails, setExtraEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newNom, setNewNom] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("membres"); // membres | externes

  // Charger les membres au montage
  useState(() => {
    supabase.from("members").select("id, prenom, nom, email, photo_url").order("nom").then(({ data }) => {
      setMembers(data || []);
      setLoadingMembers(false);
    });
  });

  const filtered = (members || []).filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return `${m.prenom} ${m.nom} ${m.email}`.toLowerCase().includes(s);
  });

  function toggleMember(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addExtraEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email invalide."); return;
    }
    if (extraEmails.some(e => e.email === email)) {
      toast.error("Cet email est déjà dans la liste."); return;
    }
    setExtraEmails(p => [...p, { email, nom: newNom.trim() || null }]);
    setNewEmail(""); setNewNom("");
  }

  const totalCount = selectedIds.size + extraEmails.length;

  async function handleSend() {
    if (!totalCount) { toast.error("Aucun destinataire sélectionné."); return; }

    const recipients = [
      ...Array.from(selectedIds).map(id => {
        const m = members.find(m => m.id === id);
        return { email: m.email, nom: `${m.prenom} ${m.nom}`.trim() };
      }).filter(r => r.email),
      ...extraEmails,
    ];

    setSending(true);

    // 1. Créer les invitations dans Supabase (admin JWT)
    const { data: invitations, error } = await createInvitations(sondage.id, recipients);
    if (error) {
      toast.error("Erreur : " + error.message);
      setSending(false);
      return;
    }

    // 2. Envoyer les emails via Brevo
    const payload = {
      type: "sondage_invitation",
      sondageTitre: sondage.titre,
      sondageDescription: sondage.description || null,
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        nom: inv.nom,
        lien: `${origin}/sondage/${sondage.id}?token=${inv.token}`,
      })),
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      // 3. Marquer les invitations envoyées
      if (result.sentIds?.length) {
        await markInvitationsSent(result.sentIds);
      }

      if (result.errors?.length) {
        toast.warning(`${result.sent} envoyée${result.sent !== 1 ? "s" : ""}, ${result.errors.length} échec(s).`);
      } else {
        toast.success(`${result.sent} invitation${result.sent !== 1 ? "s" : ""} envoyée${result.sent !== 1 ? "s" : ""} !`);
      }
    } catch (e) {
      toast.error("Erreur d'envoi : " + e.message);
    }

    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <p className="font-semibold text-foreground text-sm">Envoyer les invitations</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">« {sondage.titre} »</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-border flex-shrink-0">
          {[
            { key: "membres", label: "Membres MBP" },
            { key: "externes", label: "Emails libres" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          {tab === "membres" && (
            <div className="p-4 space-y-3">
              <input className={inp} placeholder="Rechercher un membre…" value={search}
                onChange={e => setSearch(e.target.value)} />
              {loadingMembers ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{filtered.length} membre{filtered.length !== 1 ? "s" : ""}</span>
                    <button onClick={() => {
                      const allIds = new Set(filtered.map(m => m.id));
                      const allSelected = filtered.every(m => selectedIds.has(m.id));
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        filtered.forEach(m => allSelected ? next.delete(m.id) : next.add(m.id));
                        return next;
                      });
                    }} className="text-primary hover:underline">
                      {filtered.every(m => selectedIds.has(m.id)) ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {filtered.map(m => {
                      const selected = selectedIds.has(m.id);
                      const hasEmail = !!m.email;
                      return (
                        <button key={m.id} onClick={() => hasEmail && toggleMember(m.id)}
                          disabled={!hasEmail}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                            selected ? "bg-primary/8 border border-primary/20" : "hover:bg-muted/60 border border-transparent"
                          } ${!hasEmail ? "opacity-40 cursor-not-allowed" : ""}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected ? "border-primary bg-primary" : "border-border"
                          }`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{m.prenom} {m.nom}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email || "Pas d'email"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "externes" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Email *">
                    <input className={inp} type="email" value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="ex@email.com"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExtraEmail(); } }}
                    />
                  </Field>
                  <Field label="Nom (optionnel)">
                    <input className={inp} value={newNom}
                      onChange={e => setNewNom(e.target.value)}
                      placeholder="Prénom Nom"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExtraEmail(); } }}
                    />
                  </Field>
                </div>
                <button onClick={addExtraEmail}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium">
                  <UserPlus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              {extraEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun email externe ajouté.</p>
              ) : (
                <div className="space-y-1.5">
                  {extraEmails.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        {e.nom && <p className="text-sm font-medium text-foreground truncate">{e.nom}</p>}
                        <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                      </div>
                      <button onClick={() => setExtraEmails(p => p.filter((_, j) => j !== i))}
                        className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/30 flex-shrink-0">
          <span className="text-sm text-muted-foreground">
            {totalCount} destinataire{totalCount !== 1 ? "s" : ""} sélectionné{totalCount !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">
              Annuler
            </button>
            <button onClick={handleSend} disabled={sending || totalCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Envoyer {totalCount > 0 ? `(${totalCount})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
const emptyQ = () => ({
  _id: Date.now() + Math.random(),
  type: "single", libelle: "", options: ["", ""], obligatoire: true,
});
const emptyForm = { titre: "", description: "", actif: true, expires_at: "" };

export default function SondagesSection() {
  const { sondages, loading, createSondage, updateSondage, deleteSondage } = useSondages({ adminMode: true });
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([emptyQ()]);
  const [expanded, setExpanded] = useState({});
  const [results, setResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [inviteModal, setInviteModal] = useState(null);

  const origin = window.location.origin;

  function openForm() { setForm({ ...emptyForm }); setQuestions([emptyQ()]); }
  function updateQ(i, q) { setQuestions(qs => qs.map((x, j) => j === i ? q : x)); }
  function addQ() { setQuestions(qs => [...qs, emptyQ()]); }
  function removeQ(i) { if (questions.length <= 1) return; setQuestions(qs => qs.filter((_, j) => j !== i)); }
  function moveQ(i, dir) {
    setQuestions(qs => {
      const arr = [...qs]; const j = i + dir;
      if (j < 0 || j >= arr.length) return qs;
      [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
    });
  }

  async function handleSubmit() {
    if (!form.titre?.trim()) { toast.error("Le titre est obligatoire."); return; }
    const validQ = questions.filter(q => q.libelle.trim());
    if (!validQ.length) { toast.error("Au moins une question requise."); return; }
    for (const q of validQ) {
      if (q.type === "single" || q.type === "multiple") {
        if ((q.options || []).filter(o => o.trim()).length < 2) {
          toast.error(`"${q.libelle}" : au moins 2 options requises.`); return;
        }
      }
    }
    setSaving(true);
    const error = await createSondage({
      titre: form.titre.trim(), description: form.description?.trim() || null,
      actif: form.actif, expires_at: form.expires_at || null, questions: validQ,
    });
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Sondage créé !");
    setForm(null);
  }

  async function loadResults(sondageId) {
    const [data, invStats] = await Promise.all([
      getSondageResults(sondageId),
      getInvitationStats(sondageId),
    ]);
    setResults(p => ({ ...p, [sondageId]: { ...data, invitations: invStats } }));
    setExpanded(p => ({ ...p, [sondageId]: true }));
  }

  function toggleResults(sondageId) {
    if (expanded[sondageId]) { setExpanded(p => ({ ...p, [sondageId]: false })); }
    else { loadResults(sondageId); }
  }

  function copyLink(id) {
    navigator.clipboard.writeText(`${origin}/sondage/${id}`)
      .then(() => toast.success("Lien copié !"))
      .catch(() => toast.error("Copie impossible."));
  }

  async function toggleActif(s) {
    await updateSondage(s.id, { actif: !s.actif });
    toast.success(s.actif ? "Sondage désactivé." : "Sondage activé.");
  }

  async function handleDelete(s) {
    if (!window.confirm(`Supprimer « ${s.titre} » et toutes ses réponses ?`)) return;
    await deleteSondage(s.id);
    toast.success("Sondage supprimé.");
  }

  return (
    <div className="space-y-5">

      {inviteModal && (
        <InviteModal
          sondage={inviteModal}
          origin={origin}
          onClose={() => setInviteModal(null)}
        />
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Sondages & formulaires</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Créez des questionnaires multi-questions et envoyez-les à vos membres ou à n'importe qui.</p>
        </div>
        <button onClick={openForm}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nouveau sondage
        </button>
      </div>

      {/* Formulaire de création */}
      {form && (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Nouveau sondage / formulaire</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Titre *">
                  <input className={inp} value={form.titre}
                    onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                    placeholder="Ex : Satisfaction AG 2025, Vote du thème soirée…" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description (optionnelle)">
                  <textarea className={inp} rows={2} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Instructions pour les répondants…" />
                </Field>
              </div>
              <Field label="Date de clôture (optionnelle)">
                <input type="date" className={inp} value={form.expires_at}
                  onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} />
              </Field>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.actif}
                    onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground">Publier immédiatement</span>
                </label>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Questions ({questions.length})
              </p>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionBuilder key={q._id} q={q} idx={i} total={questions.length}
                    onChange={updated => updateQ(i, updated)}
                    onRemove={() => removeQ(i)}
                    onMove={(_, dir) => moveQ(i, dir)} />
                ))}
              </div>
              <button type="button" onClick={addQ}
                className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium">
                <Plus className="w-4 h-4" /> Ajouter une question
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Créer le sondage
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      ) : sondages.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl text-muted-foreground">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucun sondage pour l'instant.</p>
          <p className="text-sm mt-1">Créez votre premier formulaire pour consulter vos membres.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sondages.map(s => {
            const isExpired = s.expires_at && new Date(s.expires_at) < new Date();
            const res = results[s.id];
            return (
              <div key={s.id} className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className={`h-1 w-full ${s.actif && !isExpired ? "bg-emerald-500" : "bg-slate-300"}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.actif && !isExpired ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {isExpired ? "Clôturé" : s.actif ? "En cours" : "Désactivé"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.questions?.length || 0} question{(s.questions?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        {s.expires_at && (
                          <span className="text-xs text-muted-foreground">
                            · Expire le {new Date(s.expires_at).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground leading-tight">{s.titre}</h3>
                      {s.description && <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>}
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {(s.questions || []).map((q, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                            {Q_TYPE_LABELS[q.type]} · {q.libelle.length > 28 ? q.libelle.slice(0, 28) + "…" : q.libelle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setInviteModal(s)} title="Envoyer des invitations"
                        className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copyLink(s.id)} title="Copier le lien public"
                        className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleResults(s.id)} title="Résultats"
                        className="w-8 h-8 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-muted-foreground hover:text-indigo-600 transition-colors">
                        {expanded[s.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => toggleActif(s)} title={s.actif ? "Désactiver" : "Activer"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${s.actif ? "hover:bg-amber-50 text-amber-500 hover:text-amber-700" : "hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600"}`}>
                        {s.actif ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => handleDelete(s)} title="Supprimer"
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Résultats */}
                  {expanded[s.id] && (
                    <div className="mt-4 pt-4 border-t border-border/60 space-y-4">
                      {!res ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" /> Chargement…
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 flex-wrap">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {res.total} réponse{res.total !== 1 ? "s" : ""} complète{res.total !== 1 ? "s" : ""}
                            </p>
                            {res.invitations?.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {res.invitations.filter(i => i.a_repondu).length}/{res.invitations.length} invités ont répondu
                              </p>
                            )}
                          </div>

                          {/* Suivi des invités */}
                          {res.invitations?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {res.invitations.map(inv => (
                                <span key={inv.id}
                                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    inv.a_repondu
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}>
                                  {inv.a_repondu
                                    ? <Check className="w-2.5 h-2.5" />
                                    : <Clock className="w-2.5 h-2.5" />}
                                  {inv.nom || inv.email}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Résultats par question */}
                          {(s.questions || []).map((q, i) => (
                            <div key={q.id} className="bg-muted/30 rounded-xl p-3">
                              <p className="text-xs font-semibold text-foreground mb-2">{i + 1}. {q.libelle}</p>
                              <QuestionResults question={q} reponses={res.reponses} total={res.total} />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground font-mono break-all select-all">
                      {origin}/sondage/{s.id}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
