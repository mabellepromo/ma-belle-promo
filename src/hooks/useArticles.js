import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { articles as articlesStatic } from "@/data/articles";
import { slugify } from "@/lib/localStore";

// Convertit date ISO (2025-01-15) en texte FR (15 Janvier 2025)
export function formatDateFr(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  return `${d} ${mois[m - 1]} ${y}`;
}

export function useArticles({ publicOnly = false } = {}) {
  const [articles, setArticles] = useState(articlesStatic);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("articles")
      .select("*")
      .order("date_iso", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (publicOnly) q = q.eq("statut", "publie");

    const { data, error } = await q;

    if (error) {
      setArticles(articlesStatic);
      setIsSeeded(false);
    } else {
      setArticles(data);
      setIsSeeded(true);
    }
    setLoading(false);
  }, [publicOnly]);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const id = item.id || slugify(item.titre);
      const { error } = await supabase
        .from("articles")
        .insert({ ...item, id, photos: item.photos ?? [], tags: item.tags ?? [] });
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Article ajouté !"); await load(); }
    } finally { setSaving(false); }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("articles")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Article mis à jour !"); await load(); }
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm("Supprimer cet article définitivement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Article supprimé."); await load(); }
    } finally { setSaving(false); }
  }

  async function seedFromStatic() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("articles")
        .upsert(
          articlesStatic.map(a => ({ ...a, photos: a.photos ?? [], tags: [], statut: "publie" })),
          { onConflict: "id" }
        );
      if (error) toast.error("Erreur migration : " + error.message);
      else { toast.success(`${articlesStatic.length} articles migrés !`); await load(); }
    } finally { setSaving(false); }
  }

  return { articles, loading, saving, isSeeded, add, update, remove, seedFromStatic, reload: load };
}
