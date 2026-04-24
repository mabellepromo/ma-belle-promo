import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import { equipe as equipeStatic } from "../../data/equipe.js";
import {
  X, Check, Eye, Trash2, Reply, Send, PenSquare,
  MessageSquare, Plus, Paperclip
} from "lucide-react";
import { SectionLoader, inp, ta, sel, Field } from "./shared.jsx";


export function ComposeModal({ onClose }) {
  const [recipients, setRecipients] = useState([{ email: "", nom: "" }]);
  const [form, setForm]   = useState({ sujet: "", corps: "", expNom: "", expPoste: "" });
  const [files, setFiles] = useState([]);
  const [status, setStatus]     = useState("idle");
  const [sentCount, setSentCount] = useState(0);
  const [errMsg, setErrMsg]     = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const expediteurs = equipeStatic.map(m => ({ nom: m.nom, poste: m.role }));

  function updateRecipient(i, field, value) {
    setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }
  function addRecipient() { setRecipients(prev => [...prev, { email: "", nom: "" }]); }
  function removeRecipient(i) { setRecipients(prev => prev.filter((_, idx) => idx !== i)); }

  const validRecipients = recipients.filter(r => r.email.trim());

  async function handleSend() {
    if (!validRecipients.length || !form.sujet || !form.corps) {
      toast.error("Au moins un email destinataire, l'objet et le corps sont obligatoires.");
      return;
    }
    setStatus("sending");
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    try {
      for (const dest of validRecipients) {
        const resp = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type:          "reply",
            to_email:      dest.email,
            to_name:       dest.nom || dest.email,
            sujet:         form.sujet,
            reply_message: form.corps,
            date,
            sender_name:   form.expNom   || "Le Bureau Exécutif",
            sender_poste:  form.expPoste || "",
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      }
      setSentCount(validRecipients.length);
      setStatus("sent");
      setTimeout(() => { onClose(); }, 2500);
    } catch (err) {
      console.error("Brevo send error:", err);
      setErrMsg(err?.message || JSON.stringify(err) || "Erreur inconnue");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={status === "sending" ? undefined : onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
            alt="MBP" className="w-9 h-9 rounded-full ring-2 ring-primary/20" />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-foreground">Nouveau message</h3>
            <p className="text-xs text-muted-foreground">De : <span className="font-medium text-primary">contact@mabellepromo.org</span></p>
          </div>
          <button onClick={onClose} disabled={status === "sending"}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0 disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === "sent" && (
          <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 flex items-center gap-2">
            <Check className="w-4 h-4" /> {sentCount} message{sentCount > 1 ? "s envoyés" : " envoyé"} avec succès !
          </div>
        )}
        {status === "error" && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold"><X className="w-4 h-4" /> Échec de l'envoi</div>
            {errMsg && <p className="text-xs font-mono text-red-700 break-all">{errMsg}</p>}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Destinataires *</label>
              <button onClick={addRecipient} disabled={status === "sending"}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input className={inp} type="email" placeholder="email@exemple.com" value={r.email}
                    onChange={e => updateRecipient(i, "email", e.target.value)} disabled={status === "sending"} />
                  <input className={inp} placeholder="Nom (optionnel)" value={r.nom}
                    onChange={e => updateRecipient(i, "nom", e.target.value)} disabled={status === "sending"} />
                  {recipients.length > 1 && (
                    <button onClick={() => removeRecipient(i)} disabled={status === "sending"}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {validRecipients.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {validRecipients.length} destinataires — un email individuel sera envoyé à chacun.
              </p>
            )}
          </div>

          <Field label="Objet" required>
            <input className={inp} placeholder="Objet du message" value={form.sujet}
              onChange={f("sujet")} disabled={status === "sending"} />
          </Field>

          <div className="bg-gradient-to-r from-primary/8 to-transparent border border-primary/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
              <img src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
                alt="" className="w-5 h-5 rounded-full" />
              <span className="text-xs font-bold text-foreground">Ma Belle Promo</span>
              <span className="text-xs text-muted-foreground">· contact@mabellepromo.org</span>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Bonjour <span className="text-foreground font-medium">{form.nomDest || "[Destinataire]"}</span>,
            </p>
          </div>

          <Field label="Corps du message" required>
            <textarea className={ta} rows={9} placeholder="Rédigez votre message ici..."
              value={form.corps} onChange={f("corps")} disabled={status === "sending"} />
          </Field>

          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signature — Expéditeur</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom de l'expéditeur">
                <select className={sel} value={form.expNom} disabled={status === "sending"}
                  onChange={e => {
                    const m = expediteurs.find(x => x.nom === e.target.value);
                    setForm(p => ({ ...p, expNom: e.target.value, expPoste: m ? m.poste : p.expPoste }));
                  }}>
                  <option value="">— Choisir un membre du bureau —</option>
                  {expediteurs.map(ex => <option key={ex.nom} value={ex.nom}>{ex.nom}</option>)}
                </select>
              </Field>
              <Field label="Poste / Fonction">
                <input className={inp} placeholder="ex: Présidente" value={form.expPoste}
                  onChange={f("expPoste")} disabled={status === "sending"} />
              </Field>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border/50 pt-3">
              <p className="font-semibold text-foreground">{form.expNom || "Votre nom"}</p>
              {form.expPoste && <p>{form.expPoste}</p>}
              <p className="font-medium text-primary/80">Ma Belle Promo — FDD Lomé · 1994–2000</p>
              <p>contact@mabellepromo.org</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pièces jointes</p>
            <label className="flex items-center gap-3 p-3 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
              <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {files.length > 0 ? files.map(fi => fi.name).join(", ") : "Cliquer pour sélectionner des fichiers…"}
              </span>
              <input type="file" multiple className="hidden" onChange={e => setFiles(e.target.files ? Array.from(e.target.files) : [])} />
            </label>
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""} — les pièces jointes ne sont pas encore prises en charge
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-muted/20 rounded-b-2xl">
          <button onClick={onClose} disabled={status === "sending"}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-40">
            Annuler
          </button>
          <button onClick={handleSend} disabled={status === "sending" || status === "sent"}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
            {status === "sending"
              ? <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Envoi…</>
              : status === "sent"
              ? <><Check className="w-4 h-4" /> Envoyé</>
              : <><Send className="w-4 h-4" /> Envoyer</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function MessagesSection() {
  const [messages, setMessages] = useState(/** @type {any[]} */([]));
  const [loading, setLoading]   = useState(true);
  const [replyMsg, setReplyMsg] = useState(null);
  const [replyText, setReplyText]     = useState("");
  const [senderName, setSenderName]   = useState("");
  const [senderPoste, setSenderPoste] = useState("");
  const [compose, setCompose]     = useState(false);
  const [viewMsg, setViewMsg]     = useState(null);
  const [sendStatus, setSendStatus] = useState("idle");

  const expediteurs = equipeStatic.map(m => ({ nom: m.nom, poste: m.role }));

  useEffect(() => {
    supabase.from("messages")
      .select("*")
      .order("received_at", { ascending: false })
      .then(({ data }) => { if (data) setMessages(data.map(m => ({ ...m, receivedAt: m.received_at }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function markRead(id) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    await supabase.from("messages").update({ read: true }).eq("id", id);
  }

  async function deleteMsg(id) {
    if (!confirm("Supprimer ce message ?")) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    await supabase.from("messages").delete().eq("id", id);
  }

  function openReply(msg) {
    markRead(msg.id);
    setReplyMsg(msg);
    setReplyText(`Nous avons bien reçu votre message${msg.sujet ? ` concernant "${msg.sujet}"` : ""} et nous vous en remercions.\n\n`);
    setSenderName("");
    setSenderPoste("");
    setSendStatus("idle");
  }

  async function sendReply() {
    if (!replyText.trim()) { toast.error("Le message est vide."); return; }
    setSendStatus("sending");
    try {
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:          "reply",
          to_email:      replyMsg.email,
          to_name:       replyMsg.name,
          sujet:         "Réponse — " + (replyMsg.sujet || "Votre message"),
          reply_message: replyText,
          date:          new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          sender_name:   senderName  || "Le Bureau Exécutif",
          sender_poste:  senderPoste || "",
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setSendStatus("sent");
      setTimeout(() => { setReplyMsg(null); setSendStatus("idle"); }, 2000);
    } catch (err) {
      console.error("Brevo reply error:", err);
      setSendStatus("error");
    }
  }

  const unread = messages.filter(m => !m.read).length;

  if (loading) return <SectionLoader />;

  return (
    <div>
      {compose && <ComposeModal onClose={() => setCompose(false)} />}

      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Messages reçus</h2>
        {unread > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            {unread} non lu{unread > 1 ? "s" : ""}
          </span>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
        <button onClick={() => setCompose(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
          <PenSquare className="w-3.5 h-3.5" /> Nouveau message
        </button>
      </div>

      {replyMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setReplyMsg(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl shadow-2xl w-full max-w-xl"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-foreground">Répondre à {replyMsg.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{replyMsg.email}</p>
              </div>
              <button onClick={() => setReplyMsg(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/30 rounded-xl p-3 border border-border text-xs text-muted-foreground">
                <p className="font-semibold mb-1 text-foreground">Message original :</p>
                <p className="line-clamp-3">{replyMsg.message}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signataire</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Nom</label>
                    <select value={senderName}
                      onChange={e => {
                        const m = expediteurs.find(x => x.nom === e.target.value);
                        setSenderName(e.target.value);
                        setSenderPoste(m ? m.poste : "");
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50">
                      <option value="">— Le Bureau Exécutif —</option>
                      {expediteurs.map(ex => <option key={ex.nom} value={ex.nom}>{ex.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Fonction</label>
                    <input value={senderPoste} onChange={e => setSenderPoste(e.target.value)}
                      placeholder="ex: Présidente"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Corps du message <span className="text-muted-foreground font-normal">(papier en-tête MBP)</span>
                </label>
                <textarea rows={8} value={replyText} onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 resize-none leading-relaxed" />
              </div>
              {sendStatus === "error" && (
                <p className="text-xs text-red-500 font-medium">Échec de l'envoi — vérifiez votre connexion et réessayez.</p>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setReplyMsg(null)}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button onClick={sendReply} disabled={sendStatus === "sending" || sendStatus === "sent"}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    sendStatus === "sent" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90"
                  } disabled:opacity-60`}>
                  {sendStatus === "sending" && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {sendStatus === "sent"    && <Check className="w-4 h-4" />}
                  {(sendStatus === "idle" || sendStatus === "error") && <Send className="w-4 h-4" />}
                  {sendStatus === "sending" ? "Envoi…" : sendStatus === "sent" ? "Envoyé !" : "Envoyer"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {viewMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewMsg(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-sm font-bold">{viewMsg.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{viewMsg.name}</p>
                  <a href={`mailto:${viewMsg.email}`} className="text-xs text-primary hover:underline truncate block">{viewMsg.email}</a>
                </div>
              </div>
              <button onClick={() => setViewMsg(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0 ml-3">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Sujet</p>
                  <p className="text-sm font-semibold text-foreground">{viewMsg.sujet || "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">{new Date(viewMsg.receivedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(viewMsg.receivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{viewMsg.message}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0 bg-muted/20 rounded-b-2xl">
              <button onClick={() => setViewMsg(null)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors">
                Fermer
              </button>
              <button onClick={() => { setViewMsg(null); openReply(viewMsg); }}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                <Reply className="w-4 h-4" /> Répondre
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-background border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-primary/30" />
          </div>
          <p className="font-semibold text-foreground">Aucun message reçu</p>
          <p className="text-sm mt-1">Les messages du formulaire de contact apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_3fr_1fr_auto_auto] gap-4 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expéditeur</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Sujet & aperçu</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Date</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
            <span></span>
          </div>
          <div className="divide-y divide-border/60">
            {messages.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => { setViewMsg({ ...m }); markRead(m.id); }}
                className={`group grid grid-cols-[2fr_3fr_1fr_auto_auto] gap-4 items-center px-5 py-4 transition-all relative cursor-pointer ${!m.read ? "bg-primary/[0.03]" : "hover:bg-muted/30"}`}>
                {!m.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{m.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!m.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block min-w-0">
                  <p className={`text-sm truncate ${!m.read ? "font-semibold text-foreground" : "text-foreground"}`}>{m.sujet || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-medium text-foreground">{new Date(m.receivedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.receivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  m.read ? "bg-muted text-muted-foreground" : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.read ? "bg-muted-foreground/40" : "bg-blue-500"}`} />
                  {m.read ? "Lu" : "Non lu"}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  {!m.read && (
                    <button onClick={() => markRead(m.id)} title="Marquer comme lu"
                      className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => openReply(m)} title="Répondre"
                    className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMsg(m.id)} title="Supprimer"
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
