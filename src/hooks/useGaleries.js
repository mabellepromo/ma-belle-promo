import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { galeries as galeriesStatic } from "@/data/galeries";
import { slugify } from "@/lib/localStore";

export function useGaleries() {
  const [galeries,  setGaleries]  = useState(galeriesStatic);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [isSeeded,  setIsSeeded]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("galeries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setGaleries(galeriesStatic);
      setIsSeeded(false);
    } else {
      setGaleries(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = item.id || slugify(item.titre);
    const { error } = await supabase
      .from("galeries")
      .insert({ ...item, id, photos: item.photos ?? [] });
    if (error) toast.error("Erreur ajout : " + error.message);
    else { toast.success("Galerie ajoutée !"); await load(); }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("galeries")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error("Erreur mise à jour : " + error.message);
    else { toast.success("Galerie mise à jour !"); await load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette galerie définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("galeries").delete().eq("id", id);
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Galerie supprimée."); await load(); }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("galeries")
      .upsert(
        galeriesStatic.map(g => ({ ...g, photos: g.photos ?? [] })),
        { onConflict: "id" }
      );
    if (error) toast.error("Erreur migration : " + error.message);
    else { toast.success(`${galeriesStatic.length} galeries migrées !`); await load(); }
    setSaving(false);
  }

  return { galeries, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
