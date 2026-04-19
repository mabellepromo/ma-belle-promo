import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { mediaVideos as videosStatic } from "@/data/mediatheque";

export function useMediaVideos() {
  const [videos,   setVideos]   = useState(videosStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setVideos(videosStatic);
      setIsSeeded(false);
    } else {
      setVideos(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = String(item.id || Date.now());
    const { error } = await supabase.from("media_videos").insert({ ...item, id });
    if (error) toast.error("Erreur ajout : " + error.message);
    else { toast.success("Vidéo ajoutée !"); await load(); }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("media_videos")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", String(id));
    if (error) toast.error("Erreur mise à jour : " + error.message);
    else { toast.success("Vidéo mise à jour !"); await load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette vidéo définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("media_videos").delete().eq("id", String(id));
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Vidéo supprimée."); await load(); }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("media_videos")
      .upsert(videosStatic.map(v => ({ ...v, id: String(v.id) })), { onConflict: "id" });
    if (error) toast.error("Erreur migration : " + error.message);
    else { toast.success(`${videosStatic.length} vidéos migrées !`); await load(); }
    setSaving(false);
  }

  return { videos, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
