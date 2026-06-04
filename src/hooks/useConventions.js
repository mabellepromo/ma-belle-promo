import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * CRUD des conventions / partenariats (suivi des échéances de renouvellement).
 * Triées par échéance croissante : les plus urgentes en tête.
 */
export function useConventions() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("conventions")
      .select("*")
      .order("date_echeance", { ascending: true, nullsFirst: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const { error } = await supabase.from("conventions").insert(item);
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Convention ajoutée !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("conventions")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Convention mise à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette convention ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("conventions").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Convention supprimée."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { items, loading, saving, add, update, remove, reload: load };
}
