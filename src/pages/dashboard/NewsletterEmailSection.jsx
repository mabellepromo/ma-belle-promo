import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/lib/memberStore";
import {
  Users, Search, X, AlertTriangle, Send,
  Eye, Loader2, Mail, History, Paperclip, FileText,
  Save, Pencil, Trash2,
} from "lucide-react";

const BUCKET = "email-attachments";
const MAX_FILE_MB = 25;
const MAX_FILES = 5;
const RECIPIENTS_TYPE = "newsletter";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const INP = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50";

function countLabel(n) {
  if (n === 0) return "Aucun destinataire sélectionné";
  return `${n} destinataire${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`;
}

export default function NewsletterEmailSection() {
  const { allMembers } = useMemberStore();

  // Abonnés newsletter
  const [subscribers,  setSubscribers]  = useState([]);
  const [subsLoading,  setSubsLoading]  = useState(true);
  const [subsSearch,   setSubsSearch]   = useState("");

  // Onglets et composition
  const [activeTab,      setActiveTab]      = useState("compose");
  const [selectAll,      setSelectAll]      = useState(true);
  const [selectedIds,    setSelectedIds]    = useState(new Set());
  const [subject,        setSubject]        = useState("");
  const [body,           setBody]           = useState("");
  const [bureauMember,   setBureauMember]   = useState("");
  const [sending,        setSending]        = useState(false);
  const [previewOpen,    setPreviewOpen]    = useState(false);
  const [attachments,    setAttachments]    = useState([]);

  // Historique
  const [logs,             setLogs]             = useState([]);
  const [logsLoading,      setLogsLoading]      = useState(false);
  const [deleteLogConfirm, setDeleteLogConfirm] = useState(null);
  const [deletingLog,      setDeletingLog]      = useState(false);

  // Brouillons
  const [drafts,         setDrafts]         = useState([]);
  const [draftsLoading,  setDraftsLoading]  = useState(false);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [savingDraft,    setSavingDraft]    = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [deleting,       setDeleting]       = useState(false);

  const fileInputRef = useRef(null);

  const totalAttachmentMB = attachments.reduce((s, f) => s + f.size, 0) / (1024 * 1024);

  // Membres du bureau pour la signature
  const bureauMembers = useMemo(
    () => (allMembers || []).filter(m => m.bureau && m.email?.trim())
      .sort((a, b) => a.nom.localeCompare(b.nom)),
    [allMembers]
  );

  // Abonnés filtrés par recherche
  const filteredSubs = useMemo(() => {
    if (!subsSearch.trim()) return subscribers;
    const q = subsSearch.toLowerCase();
    return subscribers.filter(s =>
      `${s.name || ""} ${s.email}`.toLowerCase().includes(q)
    );
  }, [subscribers, subsSearch]);

  const recipients = useMemo(
    () => selectAll ? filteredSubs : filteredSubs.filter(s => selectedIds.has(s.id)),
    [selectAll, filteredSubs, selectedIds]
  );

  // ── Chargement initial des abonnés ────────────────────────────────────────

  useEffect(() => {
    supabase.from("newsletter_subscribers")
      .select("id, email, name, source")
      .eq("active", true)
      .order("subscribed_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Erreur chargement abonnés : " + error.message);
        else setSubscribers(data || []);
        setSubsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const handler = e => { if (e.key === "Escape") setPreviewOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [previewOpen]);

  // ── Chargement selon l'onglet actif ──────────────────────────────────────

  async function loadLogs() {
    setLogsLoading(true);
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);
    if (error) toast.error("Erreur historique : " + error.message);
    else setLogs(data || []);
    setLogsLoading(false);
  }

  async function loadDrafts() {
    setDraftsLoading(true);
    const { data, error } = await supabase
      .from("bulk_emails")
      .select("*")
      .eq("status", "draft")
      .eq("recipients_type", RECIPIENTS_TYPE)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) toast.error("Erreur brouillons : " + error.message);
    else setDrafts(data || []);
    setDraftsLoading(false);
  }

  useEffect(() => {
    if (activeTab === "history") loadLogs();
    if (activeTab === "drafts") loadDrafts();
  }, [activeTab]);

  // ── Pièces jointes ────────────────────────────────────────────────────────

  async function handleFilePick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = MAX_FILES - attachments.filter(f => !f.uploading).length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_FILES} pièces jointes.`); return; }

    for (const file of files.slice(0, remaining)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} dépasse la limite de ${MAX_FILE_MB} Mo.`);
        continue;
      }
      const storagePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      setAttachments(prev => [...prev, { name: file.name, size: file.size, storagePath, uploading: true }]);

      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file);
      if (error) {
        toast.error(`Erreur upload ${file.name} : ${error.message}`);
        setAttachments(prev => prev.filter(f => f.storagePath !== storagePath));
      } else {
        setAttachments(prev => prev.map(f =>
          f.storagePath === storagePath ? { ...f, uploading: false } : f
        ));
      }
    }
  }

  async function removeAttachment(storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    setAttachments(prev => prev.filter(f => f.storagePath !== storagePath));
  }

  // ── Brouillons : CRUD ─────────────────────────────────────────────────────

  function resetCompose() {
    setSubject(""); setBody(""); setBureauMember("");
    setSelectedIds(new Set()); setSelectAll(true);
    setAttachments([]); setEditingDraftId(null);
  }

  async function saveDraft() {
    if (!subject.trim() && !body.trim()) {
      toast.error("Saisissez au moins un objet ou un corps de message.");
      return;
    }
    setSavingDraft(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        subject: subject.trim(),
        body: body.trim(),
        sent_by: session?.user?.id || null,
        bureau_member_name: bureauMember || null,
        status: "draft",
        recipients_type: RECIPIENTS_TYPE,
        attachments: attachments.filter(f => !f.uploading).map(f => ({
          name: f.name, size: f.size, storagePath: f.storagePath,
        })),
      };
      if (editingDraftId) {
        const { error } = await supabase.from("bulk_emails").update(payload).eq("id", editingDraftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("bulk_emails").insert(payload).select("id").single();
        if (error) throw error;
        setEditingDraftId(data.id);
      }
      toast.success("Brouillon enregistré.");
    } catch (err) {
      toast.error("Erreur enregistrement : " + err.message);
    } finally {
      setSavingDraft(false);
    }
  }

  function openDraft(draft) {
    setSubject(draft.subject || "");
    setBody(draft.body || "");
    setBureauMember(draft.bureau_member_name || "");
    setEditingDraftId(draft.id);
    setAttachments((draft.attachments || []).map(f => ({ ...f, uploading: false })));
    setActiveTab("compose");
    toast.success("Brouillon chargé.");
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    const draft = drafts.find(d => d.id === deleteConfirm.id);
    if (draft?.attachments?.length) {
      await supabase.storage.from(BUCKET).remove(draft.attachments.map(f => f.storagePath));
    }
    const { error } = await supabase.from("bulk_emails").delete().eq("id", deleteConfirm.id);
    if (error) {
      toast.error("Erreur suppression : " + error.message);
    } else {
      toast.success("Brouillon supprimé.");
      setDrafts(prev => prev.filter(d => d.id !== deleteConfirm.id));
      if (editingDraftId === deleteConfirm.id) resetCompose();
    }
    setDeleting(false);
    setDeleteConfirm(null);
  }

  async function confirmDeleteLog() {
    if (!deleteLogConfirm) return;
    setDeletingLog(true);
    const { error } = await supabase.from("email_logs").delete().eq("id", deleteLogConfirm.id);
    if (error) {
      toast.error("Erreur suppression : " + error.message);
    } else {
      toast.success("Entrée supprimée de l'historique.");
      setLogs(prev => prev.filter(l => l.id !== deleteLogConfirm.id));
    }
    setDeletingLog(false);
    setDeleteLogConfirm(null);
  }

  // ── Envoi ─────────────────────────────────────────────────────────────────

  function validateForm() {
    if (!subject.trim()) { toast.error("L'objet est obligatoire."); return false; }
    if (!body.trim()) { toast.error("Le corps du message est vide."); return false; }
    if (recipients.length === 0) { toast.error("Aucun destinataire sélectionné."); return false; }
    return true;
  }

  async function handleSend() {
    if (!validateForm()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const signature = bureauMember ? `\n\n---\n${bureauMember}` : "";
      const htmlContent = (body.trim() + signature)
        .split("\n")
        .map(line => `<p>${line.trim() || "&nbsp;"}</p>`)
        .join("");

      const { data: result, error: fnErr } = await supabase.functions.invoke("send-bulk-email", {
        body: {
          subject: subject.trim(),
          htmlContent,
          recipients: recipients.map(s => ({ email: s.email, nom: s.name || "" })),
          sentBy: bureauMember || session?.user?.email || "admin",
          attachments: attachments.filter(f => !f.uploading).map(f => ({
            name: f.name, storagePath: f.storagePath,
          })),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (fnErr) throw new Error(fnErr.message);
      if (!result?.success) throw new Error(result?.error || "Erreur inconnue");

      if (editingDraftId) {
        await supabase.from("bulk_emails").update({ status: "sent" }).eq("id", editingDraftId);
      }

      toast.success(`Email envoyé à ${result.sent} abonné${result.sent > 1 ? "s" : ""} !`);
      resetCompose();
      setPreviewOpen(false);
    } catch (err) {
      toast.error("Erreur envoi : " + err.message);
    } finally {
      setSending(false);
    }
  }

  function toggleSub(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    const ids = filteredSubs.map(s => s.id);
    const allChecked = ids.length > 0 && ids.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allChecked) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  }

  // ── Prévisualisation ──────────────────────────────────────────────────────

  const samplePrenom = recipients[0]?.name?.split(" ")[0] || "Prénom";
  const sampleHtml = (body.trim() + (bureauMember ? `\n\n---\n${bureauMember}` : ""))
    .split("\n")
    .map(line => `<p>${(line.trim() || "&nbsp;").replace(/\{\{prenom\}\}/gi, `<strong>${samplePrenom}</strong>`)}</p>`)
    .join("");

  const TABS = [
    { key: "compose", label: "Composer",   Icon: Mail     },
    { key: "drafts",  label: "Brouillons", Icon: FileText },
    { key: "history", label: "Historique", Icon: History  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground leading-tight">Newsletter</h2>
          <div className="mt-1 h-px w-12" style={{ background: "linear-gradient(to right, #e3c46a, transparent)" }} />
        <p className="text-sm text-muted-foreground mt-0.5">
          Envoyez un email aux abonnés de la newsletter. Limite Brevo : 300 emails/jour.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Brouillons ────────────────────────────────────────────── */}
      {activeTab === "drafts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Brouillons enregistrés</p>
            <button onClick={loadDrafts} className="text-xs text-primary hover:underline">Actualiser</button>
          </div>
          {draftsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Aucun brouillon enregistré.
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map(draft => (
                <div key={draft.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {draft.subject || "(sans objet)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{draft.body || "(vide)"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(draft.updated_at).toLocaleString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                      {draft.bureau_member_name && <>&nbsp;·&nbsp;{draft.bureau_member_name}</>}
                      {draft.attachments?.length > 0 && <>&nbsp;·&nbsp;{draft.attachments.length} p.j.</>}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openDraft(draft)} title="Modifier"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ id: draft.id, subject: draft.subject || "(sans objet)" })}
                      title="Supprimer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Historique ────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Campagnes envoyées</p>
            <button onClick={loadLogs} className="text-xs text-primary hover:underline">Actualiser</button>
          </div>
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Aucune campagne envoyée pour l'instant.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    log.status === "success" ? "bg-emerald-500" : "bg-red-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{log.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(log.sent_at).toLocaleString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                      &nbsp;·&nbsp;{log.recipient_count} abonné{log.recipient_count > 1 ? "s" : ""}
                      {log.sent_by && <>&nbsp;·&nbsp;{log.sent_by}</>}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    log.status === "success"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}>{log.status === "success" ? "Envoyé" : "Erreur"}</span>
                  <button onClick={() => setDeleteLogConfirm({ id: log.id, subject: log.subject })}
                    title="Supprimer de l'historique"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Composer ──────────────────────────────────────────────── */}
      {activeTab === "compose" && (
        <div className="space-y-4">
          {editingDraftId && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Pencil className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300 flex-1">Brouillon en cours de modification.</p>
              <button onClick={resetCompose} className="text-xs text-amber-300 hover:underline flex-shrink-0">
                Nouveau message
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Colonne gauche — abonnés */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground">Abonnés newsletter</p>
                {!subsLoading && (
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg">
                    {subscribers.length} confirmé{subscribers.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">

                {/* Tous / Sélection manuelle */}
                <div className="flex gap-2">
                  <button onClick={() => setSelectAll(true)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectAll
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}>
                    Tous les abonnés
                  </button>
                  <button onClick={() => setSelectAll(false)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      !selectAll
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}>
                    Sélection manuelle
                  </button>
                </div>

                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input value={subsSearch} onChange={e => setSubsSearch(e.target.value)}
                    placeholder="Rechercher un abonné…" className={INP + " pl-8"} />
                </div>

                {/* Liste avec cases à cocher (sélection manuelle) */}
                {!selectAll && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/30 border-b border-border">
                      <input type="checkbox"
                        checked={filteredSubs.length > 0 && filteredSubs.every(s => selectedIds.has(s.id))}
                        onChange={toggleAllVisible}
                        className="w-3.5 h-3.5 accent-primary cursor-pointer" />
                      <span className="text-xs text-muted-foreground">
                        Tout cocher ({filteredSubs.length})
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-border">
                      {subsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredSubs.map(s => (
                        <label key={s.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/20 cursor-pointer">
                          <input type="checkbox" checked={selectedIds.has(s.id)}
                            onChange={() => toggleSub(s.id)}
                            className="w-3.5 h-3.5 accent-primary flex-shrink-0 cursor-pointer" />
                          <div className="min-w-0 flex-1">
                            {s.name && <p className="text-sm font-medium text-foreground truncate">{s.name}</p>}
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                          </div>
                          <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {s.source || "web"}
                          </span>
                        </label>
                      ))}
                      {!subsLoading && filteredSubs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-5">Aucun résultat.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Compteur */}
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  recipients.length > 0 ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"
                }`}>
                  <Users className="w-4 h-4 flex-shrink-0" />
                  {subsLoading ? "Chargement…" : countLabel(recipients.length)}
                </div>

                {recipients.length > 250 && (
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Attention : {recipients.length} destinataires approche la limite Brevo (300/jour).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite — message */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <p className="font-semibold text-sm text-foreground">Message</p>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg font-mono">
                    {"{{prenom}}"}
                  </span>
                </div>
                <div className="p-4 space-y-4">

                  {/* Signature */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Envoyé par (signature)
                    </label>
                    <select value={bureauMember} onChange={e => setBureauMember(e.target.value)}
                      className={INP}>
                      <option value="">— Aucune signature —</option>
                      {bureauMembers.map(m => (
                        <option key={m.id} value={m.role ? `${m.nom}, ${m.role}` : m.nom}>
                          {m.nom}{m.role ? ` – ${m.role}` : ""}
                        </option>
                      ))}
                    </select>
                    {bureauMember && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Signature :{" "}
                        <code className="text-primary font-mono text-xs">— {bureauMember}</code>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Objet *
                    </label>
                    <input value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="Objet de la newsletter…" className={INP} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Corps du message *
                    </label>
                    <textarea value={body} onChange={e => setBody(e.target.value)}
                      placeholder={"Bonjour {{prenom}},\n\nVotre message ici…"}
                      rows={10}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-y" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Tapez{" "}
                      <code className="bg-muted px-1 rounded text-primary font-mono">{"{{prenom}}"}</code>{" "}
                      pour personnaliser avec le prénom de chaque abonné.
                    </p>
                  </div>

                  {/* Pièces jointes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Pièces jointes
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {attachments.filter(f => !f.uploading).length}/{MAX_FILES}
                        &nbsp;·&nbsp;{formatSize(totalAttachmentMB * 1024 * 1024)}
                      </span>
                    </div>
                    {attachments.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {attachments.map(f => (
                          <div key={f.storagePath}
                            className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border">
                            {f.uploading
                              ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
                              : <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            }
                            <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {f.uploading ? "Upload…" : formatSize(f.size)}
                            </span>
                            {!f.uploading && (
                              <button onClick={() => removeAttachment(f.storagePath)}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors flex-shrink-0">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {attachments.length < MAX_FILES && (
                      <>
                        <input ref={fileInputRef} type="file" multiple className="hidden"
                          onChange={handleFilePick} />
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors w-full justify-center">
                          <Paperclip className="w-3.5 h-3.5" />
                          Joindre un fichier (max {MAX_FILE_MB} Mo par fichier)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-2">
                <button onClick={saveDraft} disabled={savingDraft}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors disabled:opacity-50 whitespace-nowrap">
                  {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Brouillon
                </button>
                <button onClick={() => { if (validateForm()) setPreviewOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors">
                  <Eye className="w-4 h-4" /> Prévisualiser
                </button>
                <button onClick={handleSend} disabled={sending || recipients.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {sending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                    : <><Send className="w-4 h-4" /> Envoyer</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal prévisualisation ────────────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}>
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Prévisualisation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {recipients.length} abonné{recipients.length > 1 ? "s" : ""}
                  &nbsp;·&nbsp;{"{{prenom}}"} → « {samplePrenom} »
                </p>
              </div>
              <button onClick={() => setPreviewOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="bg-muted/30 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">Objet</p>
                <p className="font-semibold text-foreground text-sm">{subject || "(aucun)"}</p>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-[#14532d] px-6 py-4 text-center">
                  <p className="text-white font-bold text-sm">Association Ma Belle Promo (MBP)</p>
                  <p className="text-white/60 text-xs mt-0.5">FDD · Université de Lomé · Promotion 1994–2000</p>
                </div>
                <div className="p-5 bg-white text-gray-800 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sampleHtml }} />
              </div>
              <div className="bg-muted/30 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2">Destinataires ({recipients.length})</p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {recipients.slice(0, 20).map(s => (
                    <span key={s.id} className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground">
                      {s.name || s.email}
                    </span>
                  ))}
                  {recipients.length > 20 && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      +{recipients.length - 20} autres
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border flex-shrink-0">
              <button onClick={() => setPreviewOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                Modifier
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                  : <><Send className="w-4 h-4" /> Envoyer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression historique ────────────────────── */}
      {deleteLogConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !deletingLog && setDeleteLogConfirm(null)}>
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-2">Supprimer de l'historique</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Supprimer{" "}
              <strong className="text-foreground">« {deleteLogConfirm.subject} »</strong>{" "}
              de l'historique ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteLogConfirm(null)} disabled={deletingLog}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button onClick={confirmDeleteLog} disabled={deletingLog}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deletingLog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression brouillon ─────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-2">Supprimer le brouillon</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Supprimer définitivement{" "}
              <strong className="text-foreground">« {deleteConfirm.subject} »</strong> ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
