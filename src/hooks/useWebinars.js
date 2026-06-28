import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ── Gestion des événements webinaires (usage dashboard + page publique) ──────

export function useWebinars({ adminMode = false, includeArchived = false } = {}) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("webinar_events")
      .select("*")
      .order("date_time", { ascending: true });

    // En mode public, on ne charge que les events ouverts ou fermés (RLS filtre déjà)
    if (!adminMode) {
      query = query.in("status", ["open", "closed"]);
    }

    // L'archivage (soft-delete) passe par status='archived'. Au dashboard, on
    // masque les archivés par défaut ; la vue « Archivés » passe includeArchived.
    if (adminMode && !includeArchived) {
      query = query.neq("status", "archived");
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erreur chargement webinaires :", error.message);
      setEvents([]);
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [adminMode, includeArchived]);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("webinar_events").insert({
        ...item,
        created_by: user?.id ?? null,
      });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Webinaire créé !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("webinar_events")
        .update(item)
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Webinaire mis à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  // Archivage (soft-delete) : status='archived'. L'événement disparaît du public
  // (RLS) et du dashboard courant, mais toutes les inscriptions sont conservées
  // (RGPD). Réversible via unarchive().
  async function archive(id) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("webinar_events")
        .update({ status: "archived" })
        .eq("id", id);
      if (error) toast.error("Erreur archivage : " + error.message);
      else { toast.success("Événement archivé."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  // Désarchivage : on repasse l'événement en « Fermé » (visible au public,
  // inscriptions closes) — défaut sûr pour un événement généralement passé.
  async function unarchive(id) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("webinar_events")
        .update({ status: "closed" })
        .eq("id", id);
      if (error) toast.error("Erreur désarchivage : " + error.message);
      else { toast.success("Événement restauré (statut : Fermé)."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  // Suppression DÉFINITIVE (hard-delete) : détruit l'événement et ses
  // inscriptions en cascade. Action rare et délibérée (doublon, test, droit
  // à l'effacement RGPD). À réserver à un garde-fou côté UI.
  async function remove(id) {
    if (!confirm("SUPPRESSION DÉFINITIVE : l'événement ET toutes ses inscriptions seront effacés et irrécupérables.\n\nPour simplement le retirer du site, utilisez plutôt « Archiver ».\n\nConfirmer la suppression définitive ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("webinar_events").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Événement supprimé définitivement."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { events, loading, saving, add, update, archive, unarchive, remove, reload: load };
}

// ── Invitations des anciens participants (Phase 2) ────────────────────────────

// Récupère les inscrits ayant le statut « attended » sur d'autres événements,
// dédupliqués par email, en excluant l'événement cible et ceux déjà inscrits
// à cet événement. Renvoie [{ email, nom_complet, telephone, registration_id }].
export async function getPastAttendees(excludeEventId) {
  // 1. Tous les participants « présents » sur les autres événements
  const { data: attendees, error } = await supabase
    .from("webinar_registrations")
    .select("id, email, nom_complet, telephone, event_id, registration_date")
    .eq("status", "attended")
    .neq("event_id", excludeEventId)
    .order("registration_date", { ascending: false });
  if (error) { console.error("Erreur anciens participants :", error.message); return []; }

  // 2. Emails déjà inscrits à l'événement cible (à exclure)
  const { data: already } = await supabase
    .from("webinar_registrations")
    .select("email")
    .eq("event_id", excludeEventId);
  const alreadyEmails = new Set((already ?? []).map(r => r.email?.toLowerCase()));

  // 3. Déduplication par email + exclusion des déjà inscrits
  const seen = new Map();
  for (const a of attendees ?? []) {
    const key = a.email?.toLowerCase();
    if (!key || alreadyEmails.has(key) || seen.has(key)) continue;
    seen.set(key, { email: a.email, nom_complet: a.nom_complet, telephone: a.telephone, registration_id: a.id });
  }
  return [...seen.values()];
}

// ── Gestion des inscriptions pour un événement donné ─────────────────────────

export function useWebinarRegistrations(eventId) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [counts, setCounts]               = useState({});

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("webinar_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registration_date", { ascending: true });

    if (error) {
      console.error("Erreur chargement inscriptions :", error.message);
    } else {
      setRegistrations(data ?? []);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  // Compte par event_id — utile pour afficher les badges sur la liste
  const loadCounts = useCallback(async (eventIds) => {
    if (!eventIds?.length) return;
    const { data } = await supabase
      .from("webinar_registrations")
      .select("event_id")
      .in("event_id", eventIds)
      .eq("status", "registered");
    const c = {};
    (data ?? []).forEach(r => { c[r.event_id] = (c[r.event_id] || 0) + 1; });
    setCounts(c);
  }, []);

  async function markAttended(registrationId) {
    const { error } = await supabase
      .from("webinar_registrations")
      .update({ status: "attended" })
      .eq("id", registrationId);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Présence enregistrée."); await load(); }
  }

  async function unregister(registrationId) {
    const { error } = await supabase
      .from("webinar_registrations")
      .update({ status: "unregistered", unregistration_date: new Date().toISOString() })
      .eq("id", registrationId);
    if (error) toast.error("Erreur désinscription : " + error.message);
    else { toast.success("Participant désinscrit."); await load(); }
  }

  const registered = registrations.filter(r => r.status === "registered");
  const attended   = registrations.filter(r => r.status === "attended");

  return { registrations, registered, attended, loading, counts, loadCounts, markAttended, unregister, reload: load };
}

// ── Inscription publique (utilisée dans le formulaire) ────────────────────────

export async function registerToWebinar(eventId, formData) {
  const { data, error } = await supabase
    .from("webinar_registrations")
    .insert({
      event_id:             eventId,
      email:                formData.email.trim().toLowerCase(),
      nom_complet:          formData.nom_complet.trim(),
      telephone:            formData.telephone?.trim() || null,
      profession:           formData.profession?.trim() || null,
      organisation:         formData.organisation?.trim() || null,
      raison_participation: formData.raison_participation || null,
      mode_participation:   formData.mode_participation || null,
      gdpr_consent:         formData.gdpr_consent,
      newsletter_opt_in:    formData.newsletter_opt_in ?? false,
    })
    .select("id, unregistration_token")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Vous êtes déjà inscrit(e) à cet événement avec cette adresse email.");
    }
    throw new Error(error.message);
  }
  return data;
}

// ── Désinscription par token (sans authentification) ─────────────────────────

export async function getRegistrationByToken(token) {
  const { data, error } = await supabase
    .from("webinar_registrations")
    .select("id, nom_complet, email, status, event_id, webinar_events(title, date_time)")
    .eq("unregistration_token", token)
    .single();
  if (error) return null;
  return data;
}

export async function unregisterByToken(token) {
  const { error } = await supabase
    .from("webinar_registrations")
    .update({ status: "unregistered", unregistration_date: new Date().toISOString() })
    .eq("unregistration_token", token)
    .eq("status", "registered");
  if (error) throw new Error(error.message);
}
