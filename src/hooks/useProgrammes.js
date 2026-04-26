import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { programmes as programmesStatic } from "@/data/programmes";

export function useProgrammes() {
  const [programmes, setProgrammes] = useState(programmesStatic);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [isSeeded,   setIsSeeded]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .order("numero", { ascending: true });

    if (error) {
      setProgrammes(programmesStatic);
      setIsSeeded(false);
    } else {
      setProgrammes(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = String(item.id || Date.now());
      const { error } = await supabase.from("programmes").insert({ ...item, id });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Programme ajouté !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("programmes")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", String(id));
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Programme mis à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce programme définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("programmes").delete().eq("id", String(id));
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Programme supprimé."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("programmes")
        .upsert(programmesStatic.map(p => ({ ...p, id: String(p.id) })), { onConflict: "id" });
      if (error) toast.error("Erreur migration : " + error.message);
      else { toast.success(`${programmesStatic.length} programmes migrés !`); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { programmes, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
