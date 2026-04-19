import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ressources as ressourcesStatic } from "@/data/ressources";

export function useRessources() {
  const [ressources, setRessources] = useState(ressourcesStatic);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [isSeeded,   setIsSeeded]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ressources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setRessources(ressourcesStatic);
      setIsSeeded(false);
    } else {
      setRessources(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = String(item.id || Date.now());
    const { error } = await supabase.from("ressources").insert({ ...item, id });
    if (error) toast.error("Erreur ajout : " + error.message);
    else { toast.success("Ressource ajoutée !"); await load(); }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("ressources")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", String(id));
    if (error) toast.error("Erreur mise à jour : " + error.message);
    else { toast.success("Ressource mise à jour !"); await load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer cette ressource définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("ressources").delete().eq("id", String(id));
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Ressource supprimée."); await load(); }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("ressources")
      .upsert(ressourcesStatic.map(r => ({ ...r, id: String(r.id) })), { onConflict: "id" });
    if (error) toast.error("Erreur migration : " + error.message);
    else { toast.success(`${ressourcesStatic.length} ressources migrées !`); await load(); }
    setSaving(false);
  }

  return { ressources, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
