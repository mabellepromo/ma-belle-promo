import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { evenements as evenementsStatic } from "@/data/evenements";

export function useEvenements() {
  const [evenements, setEvenements] = useState(evenementsStatic);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [isSeeded,   setIsSeeded]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("evenements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setEvenements(evenementsStatic);
      setIsSeeded(false);
    } else {
      setEvenements(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = String(item.id || Date.now());
    const { error } = await supabase.from("evenements").insert({ ...item, id });
    if (error) {
      toast.error("Erreur ajout : " + error.message);
    } else {
      toast.success("Événement ajouté !");
      await load();
    }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("evenements")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", String(id));
    if (error) {
      toast.error("Erreur mise à jour : " + error.message);
    } else {
      toast.success("Événement mis à jour !");
      await load();
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cet événement définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("evenements").delete().eq("id", String(id));
    if (error) {
      toast.error("Erreur suppression : " + error.message);
    } else {
      toast.success("Événement supprimé.");
      await load();
    }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("evenements")
      .upsert(
        evenementsStatic.map(e => ({ ...e, id: String(e.id) })),
        { onConflict: "id" }
      );
    if (error) {
      toast.error("Erreur migration : " + error.message);
    } else {
      toast.success(`${evenementsStatic.length} événements migrés !`);
      await load();
    }
    setSaving(false);
  }

  return { evenements, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
