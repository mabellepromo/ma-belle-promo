import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Registre de suivi des signatures (mode manuel — DocuSeal Cloud gratuit).
 * Le bureau réalise la signature dans DocuSeal Cloud (interface web, sans serveur
 * à gérer) puis consigne ici le suivi : document, signataires, statut, lien du PDF
 * signé. CRUD Supabase direct (RLS réservée admin), aucune clé API requise.
 *
 * NB : les Edge Functions `docuseal` / `docuseal-webhook` restent déployées mais
 * inertes — elles serviront si l'association passe un jour à DocuSeal auto-hébergé
 * (envoi automatique depuis le dashboard).
 */
export function useSignatures() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("signatures")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(item) {
    setSaving(true);
    try {
      const { error } = await supabase.from("signatures").insert(item);
      if (error) toast.error("Erreur ajout : " + error.message);
      else { toast.success("Suivi enregistré !"); await load(); }
    } finally { setSaving(false); }
  }

  async function update(id, item) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("signatures")
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toast.error("Erreur mise à jour : " + error.message);
      else { toast.success("Suivi mis à jour !"); await load(); }
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce suivi de signature ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("signatures").delete().eq("id", id);
      if (error) toast.error("Erreur suppression : " + error.message);
      else { toast.success("Suivi supprimé."); await load(); }
    } finally { setSaving(false); }
  }

  return { items, loading, saving, add, update, remove, reload: load };
}
