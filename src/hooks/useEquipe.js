import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { equipe as equipeStatic } from "@/data/equipe";

export function useEquipe() {
  const [equipe,   setEquipe]   = useState(equipeStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipe")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data?.length) {
      setEquipe(equipeStatic);
      setIsSeeded(false);
    } else {
      setEquipe(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = String(item.id || Date.now());
    const { error } = await supabase.from("equipe").insert({ ...item, id });
    if (error) {
      toast.error("Erreur ajout : " + error.message);
    } else {
      toast.success("Membre ajouté !");
      await load();
    }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("equipe")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", String(id));
    if (error) {
      toast.error("Erreur mise à jour : " + error.message);
    } else {
      toast.success("Membre mis à jour !");
      await load();
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce membre définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("equipe").delete().eq("id", String(id));
    if (error) {
      toast.error("Erreur suppression : " + error.message);
    } else {
      toast.success("Membre supprimé.");
      await load();
    }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("equipe")
      .upsert(
        equipeStatic.map(m => ({ ...m, id: String(m.id) })),
        { onConflict: "id" }
      );
    if (error) {
      toast.error("Erreur migration : " + error.message);
    } else {
      toast.success(`${equipeStatic.length} membres migrés !`);
      await load();
    }
    setSaving(false);
  }

  return { equipe, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
