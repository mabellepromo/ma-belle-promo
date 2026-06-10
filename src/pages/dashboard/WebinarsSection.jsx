import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Download,
  Copy, Users, X, Loader2, Calendar, Link2, RefreshCw,
  UserCheck, Tag, Send, QrCode, Upload, FileText, Image, User, MapPin,
  Search, Check
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useWebinars, useWebinarRegistrations } from "@/hooks/useWebinars";
import { genererListePresentiel } from "@/lib/documentGenerators";
import { supabase, uploadImage, uploadFile } from "@/lib/supabase";
import { inp, sel, Field } from "./shared";
import RichEditor from "@/components/RichEditor";

const STATUS_LABEL = { draft: "Brouillon", open: "Ouvert", closed: "Fermé", archived: "Archivé" };
const STATUS_COLOR = {
  draft:    "bg-muted text-muted-foreground",
  open:     "bg-emerald-500/15 text-emerald-400",
  closed:   "bg-amber-500/15 text-amber-400",
  archived: "bg-muted/50 text-muted-foreground opacity-60",
};
const TYPE_LABEL = { webinaire: "Webinaire", atelier: "Atelier", reunion: "Réunion" };

const FORMAT_LABEL = {
  en_ligne:   "En ligne",
  presentiel: "Présentiel",
  hybride:    "Hybride",
};
const FORMAT_COLOR = {
  en_ligne:   "bg-blue-500/15 text-blue-400",
  presentiel: "bg-amber-500/15 text-amber-400",
  hybride:    "bg-violet-500/15 text-violet-400",
};
const PLATEFORME_LABEL = {
  zoom: "Zoom", meet: "Google Meet", teams: "Microsoft Teams",
  facebook: "Facebook Live", youtube: "YouTube Live", autre: "Autre",
};
const MODE_LABEL = { presentiel: "Présentiel", en_ligne: "En ligne" };

const EMPTY_EVENT = {
  title:                "",
  description:          "",
  date_time:            "",
  format:               "en_ligne",
  zoom_link:            "",
  plateforme:           "zoom",
  lieu:                 "",
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
  // Africa/Lome = UTC+0 toute l'année : on lit directement la valeur UTC
  return iso.slice(0, 16);
}

// ── Sous-composant : liste des inscrits pour un événement ────────────────────

function RegistrationsList({ event }) {
  const { registrations, registered, attended, loading, markAttended, unregister, reload } = useWebinarRegistrations(event.id);
  const [sending, setSending] = useState(null); // "zoom" | "qr" | null

  function exportCSV() {
    if (!registrations.length) { toast("Aucune inscription à exporter."); return; }
    const headers = ["Nom", "Email", "Téléphone", "Profession", "Organisation", "Raison", "Participation", "Newsletter", "Statut", "Date inscription"];
    const rows = registrations.map(r => [
      r.nom_complet, r.email, r.telephone || "", r.profession || "",
      r.organisation || "", r.raison_participation || "",
      MODE_LABEL[r.mode_participation] || "",
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

  // Génère la feuille d'émargement PDF des participants en présentiel.
  // Disponible uniquement pour les événements présentiel ou hybride.
  function exportPresentielPDF() {
    const candidats = registrations.filter(r => {
      if (r.status === "unregistered" || r.status === "cancelled") return false;
      if (event.format === "hybride") return r.mode_participation === "presentiel";
      return true; // présentiel pur
    });
    if (!candidats.length) {
      toast("Aucun participant en présentiel à exporter.");
      return;
    }
    genererListePresentiel(event, registrations);
  }

  // Le mode présentiel n'existe que pour les formats « presentiel » et « hybride »
  const hasPresentiel = event.format === "presentiel" || event.format === "hybride";
  // Le mode en ligne n'existe que pour les formats « en_ligne » et « hybride »
  const hasOnline = event.format === "en_ligne" || event.format === "hybride";

  // Envoi des billets/liens via l'Edge Function webinaire-billet.
  // channel "zoom" → lien de connexion aux inscrits en ligne
  // channel "qr"   → billet QR aux inscrits présentiel
  async function sendBillets(channel) {
    // Destinataires éligibles côté client (pour le décompte et la confirmation)
    const wantedMode = channel === "zoom" ? "en_ligne" : "presentiel";
    const cibles = registrations.filter(
      r => r.status === "registered" && r.mode_participation === wantedMode && r.email,
    );

    // Pré-conditions
    if (channel === "zoom" && !event.zoom_link) {
      toast.error("Ajoutez d'abord le lien Zoom à l'événement (bouton Modifier).");
      return;
    }
    if (channel === "qr" && !event.lieu) {
      toast.error("Cet événement n'a pas de lieu : le billet QR n'est pas applicable.");
      return;
    }
    if (!cibles.length) {
      toast(channel === "zoom"
        ? "Aucun inscrit en ligne à notifier."
        : "Aucun inscrit en présentiel à notifier.");
      return;
    }

    // Confirmation systématique (emails réels), détaillée si envoi de masse
    const libelle = channel === "zoom" ? "le lien de connexion" : "le billet QR";
    const ok = window.confirm(
      `Envoyer ${libelle} à ${cibles.length} participant(s) ${
        channel === "zoom" ? "en ligne" : "en présentiel"
      } ?\n\nCette action envoie de vrais emails.`,
    );
    if (!ok) return;

    setSending(channel);
    try {
      const { data, error } = await supabase.functions.invoke("webinaire-billet", {
        body: { event_id: event.id, channel },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const nb = data?.sent ?? 0;
      const echecs = (data?.results || []).filter(x => String(x.status).startsWith("erreur"));
      if (echecs.length) {
        toast.warning(`${nb} envoyé(s), ${echecs.length} en échec. Voir le détail dans la console.`);
        console.warn("[webinaire-billet] échecs :", echecs);
      } else {
        toast.success(`${nb} ${channel === "zoom" ? "lien(s)" : "billet(s)"} envoyé(s).`);
      }
      await reload(); // rafraîchit les indicateurs zoom_sent / qr_sent
    } catch (err) {
      toast.error("Erreur d'envoi : " + err.message);
    } finally {
      setSending(null);
    }
  }

  // ── Recherche / filtre / compteurs par mode ──
  const [search, setSearch]         = useState("");
  const [modeFilter, setModeFilter] = useState("all"); // all | presentiel | en_ligne | indefini
  const [adding, setAdding]         = useState(false);
  const [savingAdd, setSavingAdd]   = useState(false);

  const cPres   = registered.filter(r => r.mode_participation === "presentiel").length;
  const cOnline = registered.filter(r => r.mode_participation === "en_ligne").length;
  const cIndef  = registered.filter(r => !r.mode_participation).length;

  const filtered = registrations.filter(r => {
    if (modeFilter === "indefini" && r.mode_participation) return false;
    if (modeFilter !== "all" && modeFilter !== "indefini" && r.mode_participation !== modeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (r.nom_complet || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Ajout manuel d'un participant (insertion directe dans webinar_registrations)
  async function addParticipant(form) {
    const nom = form.nom_complet.trim();
    const email = form.email.trim().toLowerCase();
    if (!nom) { toast.error("Le nom complet est obligatoire."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Email invalide."); return; }
    setSavingAdd(true);
    try {
      const { error } = await supabase.from("webinar_registrations").insert({
        event_id:           event.id,
        nom_complet:        nom,
        email,
        telephone:          form.telephone?.trim() || null,
        mode_participation: form.mode_participation || null,
        status:             "registered",
        gdpr_consent:       true, // ajout par le bureau, consentement recueilli hors ligne
      });
      if (error) {
        if (error.code === "23505") toast.error("Cet email est déjà inscrit à ce webinaire.");
        else toast.error("Erreur ajout : " + error.message);
        return;
      }
      toast.success("Participant ajouté.");
      setAdding(false);
      await reload();
    } finally {
      setSavingAdd(false);
    }
  }

  // Mise à jour d'un participant (nom, email, téléphone, mode)
  async function saveParticipant(id, patch) {
    const email = patch.email.trim().toLowerCase();
    if (!patch.nom_complet.trim()) { toast.error("Le nom complet est obligatoire."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Email invalide."); return false; }
    const { error } = await supabase.from("webinar_registrations").update({
      nom_complet:        patch.nom_complet.trim(),
      email,
      telephone:          patch.telephone?.trim() || null,
      mode_participation: patch.mode_participation || null,
      status:             patch.status,
      // Passage en désinscrit : on horodate ; retour vers inscrit/présent : on efface
      unregistration_date: patch.status === "unregistered" ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) {
      if (error.code === "23505") toast.error("Cet email est déjà utilisé sur ce webinaire.");
      else toast.error("Erreur modification : " + error.message);
      return false;
    }
    toast.success("Participant modifié.");
    await reload();
    return true;
  }

  // ── Aperçu billet + envoi à l'unité ──
  const [preview, setPreview]           = useState(null);  // inscription dont on prévisualise le billet
  const [sendingOneId, setSendingOneId] = useState(null);  // id en cours d'envoi individuel

  // Envoi du lien Zoom (en ligne) ou du billet QR (présentiel) à UN seul inscrit.
  async function sendOne(r) {
    const channel = r.mode_participation === "presentiel" ? "qr" : "zoom";
    if (r.status !== "registered") { toast.error("Le participant doit être inscrit pour recevoir un envoi."); return false; }
    if (channel === "zoom" && !event.zoom_link) { toast.error("Ajoutez d'abord le lien Zoom à l'événement (Modifier)."); return false; }
    if (channel === "qr" && !event.lieu) { toast.error("Cet événement n'a pas de lieu : billet QR non applicable."); return false; }

    const libelle = channel === "zoom" ? "le lien de connexion" : "le billet QR";
    if (!window.confirm(`Envoyer ${libelle} à ${r.nom_complet} (${r.email}) ?`)) return false;

    setSendingOneId(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("webinaire-billet", {
        body: { event_id: event.id, channel, registration_ids: [r.id] },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const res0 = (data?.results || [])[0];
      if (res0 && String(res0.status).startsWith("erreur")) throw new Error(res0.status);
      toast.success(channel === "zoom" ? "Lien envoyé." : "Billet envoyé.");
      await reload();
      return true;
    } catch (err) {
      toast.error("Erreur d'envoi : " + err.message);
      return false;
    } finally {
      setSendingOneId(null);
    }
  }

  // Suppression définitive d'un participant (la ligne est conservée si l'opération échoue)
  async function deleteParticipant(r) {
    const ok = window.confirm(`Supprimer ${r.nom_complet} ?\n\nCette action est irréversible.`);
    if (!ok) return;
    const { error } = await supabase.from("webinar_registrations").delete().eq("id", r.id);
    if (error) { toast.error("Erreur suppression : " + error.message); return; }
    toast.success("Participant supprimé.");
    await reload();
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
      {/* KPIs — compteurs globaux et par mode */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{registered.length} inscrits</span>
        </div>
        {hasPresentiel && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">{cPres} présentiel</span>
          </div>
        )}
        {hasOnline && (
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5">
            <Video className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">{cOnline} en ligne</span>
          </div>
        )}
        {cIndef > 0 && (
          <div className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5">
            <span className="text-sm font-semibold text-muted-foreground">{cIndef} indéfini(s)</span>
          </div>
        )}
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
        <button onClick={() => setAdding(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter un participant
        </button>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Exporter CSV
        </button>
        {hasPresentiel && (
          <button onClick={exportPresentielPDF}
            title="Feuille d'émargement des participants sur place"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors">
            <MapPin className="w-3.5 h-3.5" /> Liste présentiel (PDF)
          </button>
        )}
        {hasOnline && (
          <button onClick={() => sendBillets("zoom")} disabled={sending !== null}
            title="Envoyer le lien de connexion aux inscrits en ligne"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-colors">
            {sending === "zoom" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
            Envoyer lien Zoom
          </button>
        )}
        {hasPresentiel && (
          <button onClick={() => sendBillets("qr")} disabled={sending !== null}
            title="Envoyer le billet QR aux inscrits en présentiel"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
            {sending === "qr" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
            Envoyer billet QR
          </button>
        )}
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

      {/* Formulaire d'ajout manuel */}
      {adding && (
        <AddParticipantForm
          hasPresentiel={hasPresentiel} hasOnline={hasOnline}
          saving={savingAdd}
          onSave={addParticipant} onCancel={() => setAdding(false)}
        />
      )}

      {/* Recherche + filtre par mode */}
      {registrations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un nom ou un email…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: "all",       label: "Tous" },
              ...(hasPresentiel ? [{ key: "presentiel", label: "Présentiel" }] : []),
              ...(hasOnline     ? [{ key: "en_ligne",   label: "En ligne" }]   : []),
              { key: "indefini", label: "Indéfini" },
            ].map(f => (
              <button key={f.key} onClick={() => setModeFilter(f.key)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  modeFilter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des inscrits */}
      {registrations.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Aucune inscription pour le moment.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Aucun participant ne correspond à la recherche.
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
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden sm:table-cell">Participation</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Statut</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <ParticipantRow
                  key={r.id} r={r}
                  hasPresentiel={hasPresentiel} hasOnline={hasOnline}
                  onSave={saveParticipant} onDelete={deleteParticipant}
                  onMarkAttended={markAttended} onUnregister={unregister}
                  onSendOne={sendOne} onPreview={setPreview}
                  sendingOne={sendingOneId === r.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aperçu du billet QR (présentiel) avec envoi individuel */}
      {preview && (
        <BilletPreview
          event={event} r={preview}
          sending={sendingOneId === preview.id}
          onClose={() => setPreview(null)}
          onSend={async () => { const ok = await sendOne(preview); if (ok) setPreview(null); }}
        />
      )}
    </div>
  );
}

// ── Formulaire d'ajout manuel d'un participant ───────────────────────────────

function AddParticipantForm({ hasPresentiel, hasOnline, saving, onSave, onCancel }) {
  const [form, setForm] = useState({ nom_complet: "", email: "", telephone: "", mode_participation: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5 text-primary" /> Nouveau participant
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <input className={inp} placeholder="Nom complet *"
          value={form.nom_complet} onChange={e => set("nom_complet", e.target.value)} />
        <input className={inp} type="email" placeholder="Email *"
          value={form.email} onChange={e => set("email", e.target.value)} />
        <input className={inp} placeholder="Téléphone"
          value={form.telephone} onChange={e => set("telephone", e.target.value)} />
        <select className={sel} value={form.mode_participation}
          onChange={e => set("mode_participation", e.target.value)}>
          <option value="">Mode : indéfini</option>
          {hasPresentiel && <option value="presentiel">Présentiel</option>}
          {hasOnline     && <option value="en_ligne">En ligne</option>}
        </select>
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
          Annuler
        </button>
        <button type="button" onClick={() => onSave(form)} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ── Ligne participant : affichage + édition inline ───────────────────────────

function ParticipantRow({ r, hasPresentiel, hasOnline, onSave, onDelete, onMarkAttended, onUnregister, onSendOne, onPreview, sendingOne }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [form, setForm]       = useState({
    nom_complet: r.nom_complet || "", email: r.email || "",
    telephone: r.telephone || "", mode_participation: r.mode_participation || "",
    status: r.status || "registered",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function startEdit() {
    setForm({
      nom_complet: r.nom_complet || "", email: r.email || "",
      telephone: r.telephone || "", mode_participation: r.mode_participation || "",
      status: r.status || "registered",
    });
    setEditing(true);
  }

  async function save() {
    setBusy(true);
    const ok = await onSave(r.id, form);
    setBusy(false);
    if (ok) setEditing(false);
  }

  // ── Mode édition : une seule cellule sur toute la largeur ──
  if (editing) {
    return (
      <tr className="border-b border-border bg-muted/20">
        <td colSpan={8} className="px-3 py-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <input className={inp} placeholder="Nom complet *"
              value={form.nom_complet} onChange={e => set("nom_complet", e.target.value)} />
            <input className={inp} type="email" placeholder="Email *"
              value={form.email} onChange={e => set("email", e.target.value)} />
            <input className={inp} placeholder="Téléphone"
              value={form.telephone} onChange={e => set("telephone", e.target.value)} />
            <select className={sel} value={form.mode_participation}
              onChange={e => set("mode_participation", e.target.value)}>
              <option value="">Mode : indéfini</option>
              {hasPresentiel && <option value="presentiel">Présentiel</option>}
              {hasOnline     && <option value="en_ligne">En ligne</option>}
            </select>
            <select className={sel} value={form.status}
              onChange={e => set("status", e.target.value)}>
              <option value="registered">Inscrit</option>
              <option value="attended">Présent</option>
              <option value="unregistered">Désinscrit</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // ── Mode affichage ──
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-3 py-2.5 font-medium text-foreground">{r.nom_complet}</td>
      <td className="px-3 py-2.5 text-muted-foreground">
        <a href={`mailto:${r.email}`} className="hover:text-primary transition-colors">{r.email}</a>
      </td>
      <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{r.profession || "—"}</td>
      <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell capitalize">{r.raison_participation || "—"}</td>
      <td className="px-3 py-2.5 hidden sm:table-cell">
        <div className="flex flex-col gap-1">
          {r.mode_participation ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
              r.mode_participation === "presentiel"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-blue-500/10 text-blue-400"
            }`}>
              {r.mode_participation === "presentiel"
                ? <MapPin className="w-2.5 h-2.5" />
                : <Video className="w-2.5 h-2.5" />}
              {MODE_LABEL[r.mode_participation]}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {r.mode_participation === "en_ligne" && r.zoom_sent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 w-fit">
              <Send className="w-2.5 h-2.5" /> Lien envoyé
            </span>
          )}
          {r.mode_participation === "presentiel" && r.qr_sent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 w-fit">
              <QrCode className="w-2.5 h-2.5" /> Billet envoyé
            </span>
          )}
        </div>
      </td>
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
          {r.status === "registered" && r.mode_participation === "presentiel" && (
            <button onClick={() => onPreview(r)} title="Voir / envoyer le billet QR"
              className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
              <QrCode className="w-3 h-3" />
            </button>
          )}
          {r.status === "registered" && r.mode_participation === "en_ligne" && (
            <button onClick={() => onSendOne(r)} disabled={sendingOne} title="Envoyer le lien Zoom à ce participant"
              className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 flex items-center justify-center transition-colors">
              {sendingOne ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          )}
          {r.status === "registered" && (
            <button onClick={() => onMarkAttended(r.id)} title="Marquer présent"
              className="w-6 h-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors">
              <UserCheck className="w-3 h-3" />
            </button>
          )}
          <button onClick={startEdit} title="Modifier"
            className="w-6 h-6 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 flex items-center justify-center transition-colors">
            <Edit2 className="w-3 h-3" />
          </button>
          {r.status === "registered" && (
            <button onClick={() => onUnregister(r.id)} title="Désinscrire (conserve la ligne)"
              className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
          <button onClick={() => onDelete(r)} title="Supprimer définitivement"
            className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Aperçu du billet QR (rendu proche de l'email réellement envoyé) ──────────

function BilletPreview({ event, r, sending, onClose, onSend }) {
  // Même encodage que l'Edge Function webinaire-billet
  const qrData = `MBP-WEBINAIRE|${event.id}|${r.id}|${r.nom_complet}|${r.email}|presentiel`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`;
  const dateStr = event.date_time
    ? new Intl.DateTimeFormat("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }).format(new Date(event.date_time))
    : "Date à préciser";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* En-tête modale */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="font-semibold text-sm text-foreground">Aperçu du billet</p>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Billet — rendu proche de l'email envoyé */}
        <div className="p-5">
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="bg-[#14532d] text-center px-4 py-4">
              <img src="/Logo%20Redesign1.png" alt="MBP"
                className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/40 object-cover"
                onError={e => { e.target.style.display = "none"; }} />
              <p className="text-white font-bold text-sm">Association Ma Belle Promo (MBP)</p>
              <p className="text-white/70 text-[10px]">FDD · Université de Lomé · 1994–2000</p>
            </div>
            <div className="bg-white px-5 py-4 text-center">
              <p className="text-[#111827] font-bold text-sm mb-1">{event.title}</p>
              <p className="text-[#6b7280] text-xs mb-0.5">📅 {dateStr}</p>
              {event.lieu && <p className="text-[#6b7280] text-xs mb-3">📍 {event.lieu}</p>}
              <img src={qrUrl} alt="Billet QR" width="200" height="200"
                className="mx-auto rounded-lg border border-gray-200 p-2 bg-white" />
              <p className="text-[#111827] font-bold text-xs mt-3">Présentez ce QR code à l'entrée.</p>
              <p className="text-[#6b7280] text-[11px] mt-2">{r.nom_complet} · {r.email}</p>
            </div>
          </div>
          {r.qr_sent && (
            <p className="text-[11px] text-emerald-500 mt-2 text-center">✓ Billet déjà envoyé à ce participant</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            Fermer
          </button>
          <button onClick={onSend} disabled={sending}
            className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {r.qr_sent ? "Renvoyer le billet" : "Envoyer le billet"}
          </button>
        </div>
      </div>
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
    if ((form.format === "presentiel" || form.format === "hybride") && !form.lieu?.trim()) {
      toast.error("Le lieu est obligatoire pour un événement présentiel ou hybride.");
      return;
    }
    onSave({
      ...form,
      // Suffixe Z : traiter la valeur saisie comme UTC (= heure de Lomé, UTC+0)
      date_time:        form.date_time ? new Date(form.date_time + ":00.000Z").toISOString() : null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      zoom_link:        form.zoom_link?.trim() || null,
      lieu:             form.lieu?.trim() || null,
      affiche:          form.affiche?.trim() || null,
      intervenants:     form.intervenants.filter(iv => iv.nom.trim()),
      documents:        form.documents.filter(d => d.nom.trim() || d.url),
    });
  }

  const hasOnline     = form.format === "en_ligne"   || form.format === "hybride";
  const hasPhysical   = form.format === "presentiel" || form.format === "hybride";

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
            <RichEditor value={form.description || ""} onChange={v => set("description", v)} />
          </Field>
        </div>

        <Field label="Date et heure">
          <input className={inp} type="datetime-local" value={form.date_time}
            onChange={e => set("date_time", e.target.value)} />
        </Field>

        <Field label="Type d'événement">
          <select className={sel} value={form.event_type} onChange={e => set("event_type", e.target.value)}>
            <option value="webinaire">Webinaire</option>
            <option value="atelier">Atelier</option>
            <option value="reunion">Réunion</option>
          </select>
        </Field>

        {/* Format */}
        <div className="sm:col-span-2">
          <Field label="Format">
            <div className="flex gap-2">
              {["en_ligne", "presentiel", "hybride"].map(f => (
                <button key={f} type="button"
                  onClick={() => set("format", f)}
                  className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all ${
                    form.format === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}>
                  {FORMAT_LABEL[f]}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Lieu physique — présentiel ou hybride */}
        {hasPhysical && (
          <div className="sm:col-span-2">
            <Field label="Lieu / Adresse" required={form.format === "presentiel"}>
              <input className={inp} value={form.lieu || ""}
                onChange={e => set("lieu", e.target.value)}
                placeholder="Salle de conférence, Université de Lomé, Togo…" />
            </Field>
          </div>
        )}

        {/* Plateforme de diffusion — en ligne ou hybride */}
        {hasOnline && (
          <>
            <Field label="Plateforme de diffusion">
              <select className={sel} value={form.plateforme || "zoom"}
                onChange={e => set("plateforme", e.target.value)}>
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="teams">Microsoft Teams</option>
                <option value="facebook">Facebook Live</option>
                <option value="youtube">YouTube Live</option>
                <option value="autre">Autre</option>
              </select>
            </Field>

            <Field label="Lien de diffusion">
              <input className={inp} type="url" value={form.zoom_link || ""}
                onChange={e => set("zoom_link", e.target.value)}
                placeholder={
                  form.plateforme === "zoom"     ? "https://zoom.us/j/…" :
                  form.plateforme === "meet"     ? "https://meet.google.com/…" :
                  form.plateforme === "teams"    ? "https://teams.microsoft.com/…" :
                  form.plateforme === "facebook" ? "https://facebook.com/live/…" :
                  form.plateforme === "youtube"  ? "https://youtube.com/live/…" :
                  "https://…"
                } />
            </Field>
          </>
        )}

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
                  {event.format && (
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${FORMAT_COLOR[event.format] || "bg-muted text-muted-foreground"}`}>
                      {FORMAT_LABEL[event.format] || event.format}
                    </span>
                  )}
                  {event.lieu && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <MapPin className="w-3 h-3" /> {event.lieu}
                    </span>
                  )}
                  {event.zoom_link && (
                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:underline">
                      <Video className="w-3 h-3" />
                      {PLATEFORME_LABEL[event.plateforme] || "En ligne"}
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
