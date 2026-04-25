import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { projets as projetsStatic } from "@/data/projets";
import { slugify } from "@/lib/localStore";

export function useProjets() {
  const [projets,  setProjets]  = useState(projetsStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setProjets(projetsStatic);
      setIsSeeded(false);
    } else {
      setProjets(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = item.id || slugify(item.titre) + "-" + Date.now();
      const { error } = await supabase
        .from("projets")
        .insert({ ...item, id, photos: item.photos ?? [], videos: item.videos ?? [] });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Projet ajouté !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projets")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Projet mis à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce projet définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("projets").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Projet supprimé."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projets")
        .upsert(
          projetsStatic.map(p => ({ ...p, photos: p.photos ?? [], videos: p.videos ?? [] })),
          { onConflict: "id" }
        );
      if (error) toast.error("Erreur migration : " + error.message);
      else { toast.success(`${projetsStatic.length} projets migrés !`); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { projets, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
