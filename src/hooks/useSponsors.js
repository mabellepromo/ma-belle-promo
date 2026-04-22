import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/localStore";

export function useSponsors() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = slugify(item.nom) + "-" + Date.now();
    const { error } = await supabase.from("sponsors").insert({ ...item, id });
    if (error) toast.error("Erreur ajout : " + error.message);
    else { toast.success("Sponsor ajouté !"); await load(); }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("sponsors")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error("Erreur mise à jour : " + error.message);
    else { toast.success("Sponsor mis à jour !"); await load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce sponsor ?")) return;
    setSaving(true);
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Sponsor supprimé."); await load(); }
    setSaving(false);
  }

  return { items, loading, saving, add, update, remove, reload: load };
}
