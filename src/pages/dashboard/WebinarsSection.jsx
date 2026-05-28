import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Download,
  Copy, Users, Check, X, Loader2, Calendar, Link2, RefreshCw,
  UserCheck, Clock, Tag, Send, Eye, QrCode, Upload, FileText, Image, User
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useWebinars, useWebinarRegistrations } from "@/hooks/useWebinars";
import { supabase, uploadImage, uploadFile } from "@/lib/supabase";
import { inp, ta, sel, Field } from "./shared";

const STATUS_LABEL = { draft: "Brouillon", open: "Ouvert", closed: "Fermé", archived: "Archivé" };
const STATUS_COLOR = {
  draft:    "bg-muted text-muted-foreground",
  open:     "bg-emerald-500/15 text-emerald-400",
  closed:   "bg-amber-500/15 text-amber-400",
  archived: "bg-muted/50 text-muted-foreground opacity-60",
};
const TYPE_LABEL = { webinaire: "Webinaire", atelier: "Atelier", reunion: "Réunion" };

const EMPTY_EVENT = {
  title:                "",
  description:          "",
  date_time:            "",
  zoom_link:            "",
  max_participants:     "",
  event_type:           "webinaire",
  status:               "draft",
  gdpr_consent_required: true,
  affiche:              "",
  intervenants:         [],
  documents:            [],
};

const EMPTY_INTERVENANT = { nom: "", profession: "", role: "", photo: "" };
const EMPTY_DOCUMENT    = { nom: "", url: "" };

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return iso; }
}

function fmtDatetimeLocal(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}

// ── Sous-composant : liste des inscrits pour un événement ────────────────────

function RegistrationsList({ event }) {
  const { registrations, registered, attended, loading, markAttended, unregister, reload } = useWebinarRegistrations(event.id);

  function exportCSV() {
    if (!registrations.length) { toast("Aucune inscription à exporter."); return; }
    const headers = ["Nom", "Email", "Téléphone", "Profession", "Organisation", "Raison", "Newsletter", "Statut", "Date inscription"];
    const rows = registrations.map(r => [
      r.nom_complet, r.email, r.telephone || "", r.profession || "",
      r.organisation || "", r.raison_participation || "",
      r.newsletter_opt_in ? "Oui" : "Non",
      r.status,
      new Date(r.registration_date).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscriptions-${event.title.replace(/\s+/g, "-").toLowerCase().slice(0, 40)}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} inscrit(s) exporté(s).`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{registered.length} inscrits</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-primary">{attended.length} présents</span>
        </div>
        {event.max_participants && (
          <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-1.5">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {Math.max(0, event.max_participants - registered.length)} place(s) restante(s)
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Exporter CSV
        </button>
        <button onClick={reload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5" /> Rafraîchir
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/activites/webinaires#${event.id}`;
            navigator.clipboard.writeText(url);
            toast.success("URL copiée !");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
          <Link2 className="w-3.5 h-3.5" /> Copier lien public
        </button>
      </div>

      {/* Tableau des inscrits */}
      {registrations.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Aucune inscription pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Nom</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Email</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Profession</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Raison</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Statut</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground">{r.nom_complet}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <a href={`mailto:${r.email}`} className="hover:text-primary transition-colors">{r.email}</a>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{r.profession || "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell capitalize">{r.raison_participation || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "attended"     ? "bg-primary/10 text-primary" :
                      r.status === "registered"   ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-muted/60 text-muted-foreground line-through"
                    }`}>
                      {r.status === "attended" ? "Présent" : r.status === "registered" ? "Inscrit" : "Désinscrit"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                    {new Date(r.registration_date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      {r.status === "registered" && (
                        <button
                          onClick={() => markAttended(r.id)}
                          title="Marquer présent"
                          className="w-6 h-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                        </button>
                      )}
                      {r.status === "registered" && (
                        <button
                          onClick={() => unregister(r.id)}
                          title="Désinscrire"
                          className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Ligne intervenant (avec upload photo) ────────────────────────────────────

function IntervenantRow({ iv, onChange, onRemove }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange({ ...iv, photo: url });
    } catch (err) {
      toast.error("Erreur upload : " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-muted/20">
      {/* Photo */}
      <div className="flex-shrink-0">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-12 h-12 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden transition-colors"
        >
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            : iv.photo
              ? <img src={iv.photo} alt="" className="w-full h-full object-cover" />
              : <User className="w-5 h-5 text-muted-foreground opacity-50" />}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      {/* Champs */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          className={inp} placeholder="Nom complet *"
          value={iv.nom} onChange={e => onChange({ ...iv, nom: e.target.value })}
        />
        <input
          className={inp} placeholder="Profession / titre"
          value={iv.profession} onChange={e => onChange({ ...iv, profession: e.target.value })}
        />
        <input
          className={inp} placeholder="Rôle (ex: Modérateur, Panéliste…)"
          value={iv.role} onChange={e => onChange({ ...iv, role: e.target.value })}
        />
      </div>

      <button type="button" onClick={onRemove}
        className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Ligne document (PDF / affiche) ───────────────────────────────────────────

function DocumentRow({ doc, onChange, onRemove }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let url;
      if (file.type.startsWith("image/")) {
        url = await uploadImage(file);
      } else {
        url = await uploadFile(file);
      }
      onChange({ ...doc, url, nom: doc.nom || file.name.replace(/\.[^.]+$/, "") });
    } catch (err) {
      toast.error("Erreur upload : " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/20">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        {doc.url
          ? (doc.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)
              ? <img src={doc.url} alt="" className="w-full h-full object-cover rounded-lg" />
              : <FileText className="w-4 h-4 text-primary" />)
          : <FileText className="w-4 h-4 text-muted-foreground opacity-40" />}
      </div>

      <input
        className={`${inp} flex-1`} placeholder="Nom du document (ex: Affiche, Programme…)"
        value={doc.nom} onChange={e => onChange({ ...doc, nom: e.target.value })}
      />

      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="flex-shrink-0 flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? "Upload…" : doc.url ? "Changer" : "Uploader"}
      </button>
      <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />

      <button type="button" onClick={onRemove}
        className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Formulaire création / édition d'un événement ─────────────────────────────

function EventForm({ initial = EMPTY_EVENT, onSave, onCancel, saving }) {
  const afficheRef = useRef(null);
  const [uploadingAffiche, setUploadingAffiche] = useState(false);
  const [form, setForm] = useState({
    ...EMPTY_EVENT,
    ...initial,
    date_time:        fmtDatetimeLocal(initial.date_time),
    max_participants: initial.max_participants || "",
    intervenants:     Array.isArray(initial.intervenants) ? initial.intervenants : [],
    documents:        Array.isArray(initial.documents)    ? initial.documents    : [],
  });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function updateIntervenant(i, updated) {
    const next = [...form.intervenants];
    next[i] = updated;
    set("intervenants", next);
  }

  function removeIntervenant(i) {
    set("intervenants", form.intervenants.filter((_, j) => j !== i));
  }

  function updateDocument(i, updated) {
    const next = [...form.documents];
    next[i] = updated;
    set("documents", next);
  }

  function removeDocument(i) {
    set("documents", form.documents.filter((_, j) => j !== i));
  }

  async function handleAffiche(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAffiche(true);
    try {
      const url = await uploadImage(file);
      set("affiche", url);
    } catch (err) {
      toast.error("Erreur upload affiche : " + err.message);
    } finally {
      setUploadingAffiche(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Le titre est obligatoire."); return; }
    onSave({
      ...form,
      date_time:        form.date_time ? new Date(form.date_time).toISOString() : null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      zoom_link:        form.zoom_link?.trim() || null,
      affiche:          form.affiche?.trim() || null,
      intervenants:     form.intervenants.filter(iv => iv.nom.trim()),
      documents:        form.documents.filter(d => d.nom.trim() || d.url),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">

      {/* ── Infos de base ── */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Titre" required>
            <input className={inp} value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="Webinaire Assurance & Expertise juridique" required />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea className={ta} rows={3} value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Présentation du webinaire, programme, objectifs…" />
          </Field>
        </div>

        <Field label="Date et heure">
          <input className={inp} type="datetime-local" value={form.date_time}
            onChange={e => set("date_time", e.target.value)} />
        </Field>

        <Field label="Lien Zoom">
          <input className={inp} type="url" value={form.zoom_link}
            onChange={e => set("zoom_link", e.target.value)}
            placeholder="https://zoom.us/j/…" />
        </Field>

        <Field label="Type d'événement">
          <select className={sel} value={form.event_type} onChange={e => set("event_type", e.target.value)}>
            <option value="webinaire">Webinaire</option>
            <option value="atelier">Atelier</option>
            <option value="reunion">Réunion</option>
          </select>
        </Field>

        <Field label="Statut">
          <select className={sel} value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="draft">Brouillon (non visible)</option>
            <option value="open">Ouvert (inscriptions)</option>
            <option value="closed">Fermé (inscriptions closes)</option>
            <option value="archived">Archivé</option>
          </select>
        </Field>

        <Field label="Nombre max. participants">
          <input className={inp} type="number" min="1" value={form.max_participants}
            onChange={e => set("max_participants", e.target.value)}
            placeholder="Illimité si vide" />
        </Field>

        <div className="flex items-center gap-2 mt-1">
          <input type="checkbox" id="gdpr_cb" checked={form.gdpr_consent_required}
            onChange={e => set("gdpr_consent_required", e.target.checked)}
            className="w-4 h-4 rounded border-border accent-primary" />
          <label htmlFor="gdpr_cb" className="text-xs font-medium text-foreground cursor-pointer">
            Consentement RGPD obligatoire
          </label>
        </div>
      </div>

      {/* ── Affiche / bannière ── */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-primary" /> Affiche / Bannière
        </p>
        <div className="flex items-start gap-3">
          {form.affiche && (
            <div className="relative flex-shrink-0">
              <img src={form.affiche} alt="Affiche"
                className="h-24 w-auto rounded-xl border border-border object-cover"
                onError={e => e.target.style.display = "none"} />
              <button type="button" onClick={() => set("affiche", "")}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input className={inp} type="url" value={form.affiche}
              onChange={e => set("affiche", e.target.value)}
              placeholder="URL de l'image (https://…)" />
            <button type="button" onClick={() => afficheRef.current?.click()} disabled={uploadingAffiche}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-colors text-muted-foreground hover:text-foreground">
              {uploadingAffiche
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Upload…</>
                : <><Upload className="w-3.5 h-3.5" /> Uploader une image</>}
            </button>
            <input ref={afficheRef} type="file" accept="image/*" className="hidden" onChange={handleAffiche} />
          </div>
        </div>
      </div>

      {/* ── Intervenants ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> Intervenants
          </p>
          <button type="button"
            onClick={() => set("intervenants", [...form.intervenants, { ...EMPTY_INTERVENANT }])}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {form.intervenants.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Aucun intervenant — cliquez Ajouter</p>
        )}
        <div className="space-y-2">
          {form.intervenants.map((iv, i) => (
            <IntervenantRow key={i} iv={iv}
              onChange={updated => updateIntervenant(i, updated)}
              onRemove={() => removeIntervenant(i)} />
          ))}
        </div>
      </div>

      {/* ── Documents / fiches ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Documents & fiches
          </p>
          <button type="button"
            onClick={() => set("documents", [...form.documents, { ...EMPTY_DOCUMENT }])}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        {form.documents.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Aucun document — cliquez Ajouter</p>
        )}
        <div className="space-y-2">
          {form.documents.map((doc, i) => (
            <DocumentRow key={i} doc={doc}
              onChange={updated => updateDocument(i, updated)}
              onRemove={() => removeDocument(i)} />
          ))}
        </div>
      </div>

      {/* ── Boutons ── */}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</> : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// ── Module principal ──────────────────────────────────────────────────────────

export default function WebinarsSection() {
  const { events, loading, saving, add, update, remove, reload } = useWebinars({ adminMode: true });
  const [creating, setCreating]         = useState(false);
  const [editing, setEditing]           = useState(null); // event object
  const [expanded, setExpanded]         = useState(null); // event id — panel inscriptions
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [qrModal, setQrModal]           = useState(null); // { event, dataUrl }
  const [cloningId, setCloningId]       = useState(null);

  async function generateQR(event) {
    const url = `${window.location.origin}/activites/webinaires`;
    const dataUrl = await QRCodeLib.toDataURL(url, {
      width: 360, margin: 2,
      color: { dark: "#0a3d28", light: "#ffffff" },
    });
    setQrModal({ event, dataUrl, url });
  }

  function downloadQR() {
    if (!qrModal) return;
    const a = document.createElement("a");
    a.href = qrModal.dataUrl;
    a.download = `qr-webinaire-${qrModal.event.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}.png`;
    a.click();
  }

  async function cloneEvent(event) {
    setCloningId(event.id);
    try {
      const { id, created_at, created_by, ...rest } = event;
      await add({
        ...rest,
        title:  `${rest.title} (copie)`,
        status: "draft",
      });
    } finally {
      setCloningId(null);
    }
  }

  // Charger les compteurs d'inscrits pour tous les events
  useEffect(() => {
    if (!events.length) return;
    const ids = events.map(e => e.id);
    supabase
      .from("webinar_registrations")
      .select("event_id")
      .in("event_id", ids)
      .eq("status", "registered")
      .then(({ data }) => {
        const c = {};
        (data ?? []).forEach(r => { c[r.event_id] = (c[r.event_id] || 0) + 1; });
        setRegistrationCounts(c);
      });
  }, [events]);

  async function handleSave(data) {
    if (editing) {
      await update(editing.id, data);
      setEditing(null);
    } else {
      await add(data);
      setCreating(false);
    }
  }

  async function sendReminder(event) {
    if (!event.zoom_link) {
      toast.error("Ajoutez d'abord un lien Zoom avant d'envoyer les rappels.");
      return;
    }
    const { data: inscrits } = await supabase
      .from("webinar_registrations")
      .select("email, nom_complet")
      .eq("event_id", event.id)
      .eq("status", "registered");

    if (!inscrits?.length) { toast("Aucun inscrit à relancer."); return; }

    try {
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "webinar_reminder",
          event_title: event.title,
          event_date:  event.date_time,
          zoom_link:   event.zoom_link,
          inscrits:    inscrits,
        }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Erreur serveur");
      toast.success(`Rappel envoyé à ${result.sent} participant(s).`);
    } catch (err) {
      toast.error("Erreur rappel : " + err.message);
    }
  }

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Webinaires</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gérez les événements en ligne et les inscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload}
            className="h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setCreating(true); setEditing(null); }}
            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Créer un webinaire
          </button>
        </div>
      </div>

      {/* Formulaire création */}
      <AnimatePresence>
        {creating && !editing && (
          <motion.div key="create-form"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-card rounded-2xl border border-primary/30 shadow-sm p-5"
          >
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Nouvel événement
            </h3>
            <EventForm onSave={handleSave} onCancel={() => setCreating(false)} saving={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Liste vide */}
      {!loading && events.length === 0 && !creating && (
        <div className="rounded-2xl border border-border bg-muted/20 p-10 text-center">
          <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">Aucun webinaire créé.</p>
          <button onClick={() => setCreating(true)}
            className="mt-3 text-sm font-semibold text-primary hover:underline">
            Créer le premier webinaire →
          </button>
        </div>
      )}

      {/* Événements */}
      {!loading && events.map(event => (
        <div key={event.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

          {/* Barre couleur statut */}
          <div className={`h-0.5 w-full ${event.status === "open" ? "bg-emerald-500" : event.status === "draft" ? "bg-muted-foreground/30" : "bg-amber-500/50"}`} />

          {/* Formulaire édition */}
          <AnimatePresence>
            {editing?.id === event.id && (
              <motion.div key="edit-form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-5 border-b border-border bg-muted/20"
              >
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-primary" /> Modifier l'événement
                </h3>
                <EventForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* En-tête événement */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Video className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[event.status]}`}>
                    {STATUS_LABEL[event.status]}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {TYPE_LABEL[event.event_type]}
                  </span>
                  {registrationCounts[event.id] > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      {registrationCounts[event.id]} inscrit(s)
                    </span>
                  )}
                </div>

                <p className="font-semibold text-sm text-foreground leading-snug">{event.title}</p>

                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {event.date_time && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmtDate(event.date_time)}
                    </span>
                  )}
                  {event.zoom_link && (
                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:underline">
                      <Video className="w-3 h-3" /> Zoom
                    </a>
                  )}
                  {event.max_participants && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {event.max_participants} places max.
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/activites/webinaires`;
                    navigator.clipboard.writeText(url);
                    toast.success("URL copiée !");
                  }}
                  title="Copier lien public"
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => generateQR(event)}
                  title="QR code vers le formulaire"
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => sendReminder(event)}
                  title="Envoyer rappel aux inscrits"
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => cloneEvent(event)}
                  title="Dupliquer cet événement"
                  disabled={cloningId === event.id}
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  {cloningId === event.id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setEditing(event); setCreating(false); setExpanded(null); }}
                  title="Modifier"
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(event.id)}
                  title="Supprimer"
                  className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setExpanded(v => v === event.id ? null : event.id)}
                  title="Voir les inscrits"
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                    expanded === event.id
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {expanded === event.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Panel inscriptions */}
          <AnimatePresence>
            {expanded === event.id && (
              <motion.div
                key="registrations"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border p-4 bg-muted/10">
                  <RegistrationsList event={event} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* ── Modale QR code ── */}
      <AnimatePresence>
        {qrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setQrModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-sm text-foreground">QR code — Formulaire d'inscription</p>
                <button onClick={() => setQrModal(null)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img
                src={qrModal.dataUrl}
                alt="QR code vers le formulaire d'inscription"
                className="w-48 h-48 mx-auto rounded-xl border border-border"
              />

              <p className="text-xs text-muted-foreground mt-3 truncate">{qrModal.url}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{qrModal.event.title}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { navigator.clipboard.writeText(qrModal.url); toast.success("URL copiée !"); }}
                  className="flex-1 h-9 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" /> Copier l'URL
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Télécharger PNG
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
