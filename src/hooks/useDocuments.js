import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { documents as documentsStatic } from "@/data/documents";

export function useDocuments() {
  const [documents, setDocuments] = useState(documentsStatic);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [isSeeded,  setIsSeeded]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setDocuments(documentsStatic);
      setIsSeeded(false);
    } else {
      setDocuments(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = String(item.id || Date.now());
      const { error } = await supabase.from("documents").insert({ ...item, id });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Document ajouté !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", String(id));
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Document mis à jour !"); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce document définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("documents").delete().eq("id", String(id));
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Document supprimé."); await load(); }
    } finally {
      setSaving(false);
    }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("documents")
        .upsert(documentsStatic.map(d => ({ ...d, id: String(d.id) })), { onConflict: "id" });
      if (error) toast.error("Erreur migration : " + error.message);
      else { toast.success(`${documentsStatic.length} documents migrés !`); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return { documents, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
