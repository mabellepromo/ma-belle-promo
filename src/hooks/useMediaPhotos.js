import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { mediaPhotos as photosStatic } from "@/data/mediatheque";

export function useMediaPhotos() {
  const [photos,   setPhotos]   = useState(photosStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setPhotos(photosStatic);
      setIsSeeded(false);
    } else {
      setPhotos(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = String(item.id || Date.now());
      const { error } = await supabase.from("media_photos").insert({ ...item, id });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Photo ajoutée !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("media_photos")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", String(id));
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Photo mise à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette photo définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("media_photos").delete().eq("id", String(id));
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Photo supprimée."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("media_photos")
        .upsert(photosStatic.map(p => ({ ...p, id: String(p.id) })), { onConflict: "id" });
      if (error) toast.error("Erreur migration : " + error.message);
      else { toast.success(`${photosStatic.length} photos migrées !`); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { photos, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
