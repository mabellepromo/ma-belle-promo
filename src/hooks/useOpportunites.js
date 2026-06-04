import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Gestion des opportunités côté dashboard (bureau/admin) : CRUD + modération.
 * Charge TOUTES les offres (la RLS admin l'autorise) triées par date de création.
 */
export function useOpportunites() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("opportunites")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const { error } = await supabase.from("opportunites").insert(item);
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Opportunité ajoutée !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("opportunites")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Opportunité mise à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette opportunité ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("opportunites").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Opportunité supprimée."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  // Publie une offre puis déclenche (si activée) la notification email aux membres
  async function publish(id) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("opportunites")
        .update({ statut: "publiee", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) { toast.error("Erreur publication : " + error.message); return; }
      toast.success("Opportunité publiée !");
      // L'Edge Function ne fait rien si l'automatisation est désactivée (no-op).
      supabase.functions.invoke("opportunite-notification", { body: { opportunite_id: id } })
        .catch(() => {});
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function refuse(id) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("opportunites")
        .update({ statut: "refusee", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur refus : " + error.message);
      else { toast.success("Opportunité refusée."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { items, loading, saving, add, update, remove, publish, refuse, reload: load };
}
