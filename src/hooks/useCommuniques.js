import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { communiques as communiquesStatic } from "@/data/communiques";

export function useCommuniques() {
  const [communiques, setCommuniques] = useState(communiquesStatic);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [isSeeded,    setIsSeeded]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("communiques")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      setCommuniques(communiquesStatic);
      setIsSeeded(false);
    } else {
      setCommuniques(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    const id = String(item.id || Date.now());
    const { error } = await supabase.from("communiques").insert({ ...item, id });
    if (error) toast.error("Erreur ajout : " + error.message);
    else { toast.success("Communiqué ajouté !"); await load(); }
    setSaving(false);
  }

  async function update(id, item) {
    setSaving(true);
    const { error } = await supabase
      .from("communiques")
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq("id", String(id));
    if (error) toast.error("Erreur mise à jour : " + error.message);
    else { toast.success("Communiqué mis à jour !"); await load(); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce communiqué définitivement ?")) return;
    setSaving(true);
    const { error } = await supabase.from("communiques").delete().eq("id", String(id));
    if (error) toast.error("Erreur suppression : " + error.message);
    else { toast.success("Communiqué supprimé."); await load(); }
    setSaving(false);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("communiques")
      .upsert(communiquesStatic.map(c => ({ ...c, id: String(c.id) })), { onConflict: "id" });
    if (error) toast.error("Erreur migration : " + error.message);
    else { toast.success(`${communiquesStatic.length} communiqués migrés !`); await load(); }
    setSaving(false);
  }

  return { communiques, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
