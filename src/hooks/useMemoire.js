import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/* ─── Procédures (savoir-faire interne, versionnées) ─── */
export function useProcedures() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("procedures")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const { error } = await supabase.from("procedures").insert(item);
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Procédure créée !"); await load(); }
    } finally { setSaving(false); }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      // L'ancien contenu est archivé automatiquement par le trigger côté base
      const { error } = await supabase.from("procedures").update(item).eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Procédure mise à jour !"); await load(); }
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette procédure et son historique ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("procedures").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Procédure supprimée."); await load(); }
    } finally { setSaving(false); }
  }

  async function fetchVersions(procedureId) {
    const { data } = await supabase
      .from("procedure_versions")
      .select("*")
      .eq("procedure_id", procedureId)
      .order("modifie_le", { ascending: false });
    return data ?? [];
  }

  return { items, loading, saving, add, update, remove, fetchVersions, reload: load };
}

/* ─── Modèles de passation réutilisables ─── */
export function usePassationModeles() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("passation_modeles")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    const { error } = await supabase.from("passation_modeles").insert(item);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Modèle créé !"); await load(); }
  }
  async function update(id, item) {
    const { error } = await supabase.from("passation_modeles").update(item).eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Modèle mis à jour !"); await load(); }
  }
  async function remove(id) {
    if (!confirm("Supprimer ce modèle ?")) return;
    const { error } = await supabase.from("passation_modeles").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Modèle supprimé."); await load(); }
  }

  return { items, loading, add, update, remove, reload: load };
}

/* ─── Passations (instances de changement de bureau) ─── */
export function usePassations() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("passations")
      .select("*")
      .order("date_passation", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    const { data, error } = await supabase.from("passations").insert(item).select().maybeSingle();
    if (error) { toast.error("Erreur : " + error.message); return null; }
    toast.success("Passation créée !"); await load();
    return data;
  }
  async function update(id, item) {
    const { error } = await supabase.from("passations").update(item).eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else await load();
  }
  async function remove(id) {
    if (!confirm("Supprimer cette passation ?")) return;
    const { error } = await supabase.from("passations").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Passation supprimée."); await load(); }
  }

  return { items, loading, add, update, remove, reload: load };
}
