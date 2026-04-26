import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { articles as articlesStatic } from "@/data/articles";
import { slugify } from "@/lib/localStore";

export function useArticles() {
  const [articles, setArticles] = useState(articlesStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setArticles(articlesStatic);
      setIsSeeded(false);
    } else {
      setArticles(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = item.id || slugify(item.titre);
      const { error } = await supabase
        .from("articles")
        .insert({ ...item, id, photos: item.photos ?? [] });
      if (error) {
        toast.error("Erreur ajout : " + error.message);
      } else {
        toast.success("Article ajouté !");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("articles")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        toast.error("Erreur mise à jour : " + error.message);
      } else {
        toast.success("Article mis à jour !");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cet article définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) {
        toast.error("Erreur suppression : " + error.message);
      } else {
        toast.success("Article supprimé.");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("articles")
        .upsert(
          articlesStatic.map(a => ({ ...a, photos: a.photos ?? [] })),
          { onConflict: "id" }
        );
      if (error) {
        toast.error("Erreur migration : " + error.message);
      } else {
        toast.success(`${articlesStatic.length} articles migrés avec succès !`);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  return { articles, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
