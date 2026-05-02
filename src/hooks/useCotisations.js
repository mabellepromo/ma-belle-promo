import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useCotisations(annee) {
  const [cotisations, setCotisations] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cotisations")
      .select("*")
      .eq("annee", annee)
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        toast.error("Table « cotisations » introuvable — créez-la d'abord dans Supabase.");
      }
    } else {
      setCotisations(data ?? []);
    }
    setLoading(false);
  }, [annee]);

  useEffect(() => { load(); }, [load]);

  async function upsert(memberId, patch) {
    setSaving(true);
    try {
      const { error } = await supabase.from("cotisations").upsert(
        { member_id: String(memberId), annee, ...patch, updated_at: new Date().toISOString() },
        { onConflict: "member_id,annee" }
      );
      if (error) toast.error("Erreur : " + error.message);
      else await load();
    } finally {
      setSaving(false);
    }
  }

  async function marquerPaye(memberId, montant, modePaiement) {
    await upsert(memberId, {
      statut: "payé",
      montant: Number(montant) || 0,
      date_paiement: new Date().toISOString().split("T")[0],
      mode_paiement: modePaiement || "virement",
    });
    toast.success("Cotisation enregistrée !");
  }

  async function marquerEnAttente(memberId) {
    await upsert(memberId, { statut: "en_attente", date_paiement: null, montant: 0 });
    toast.success("Remis en attente.");
  }

  async function marquerExempte(memberId) {
    await upsert(memberId, { statut: "exempté", date_paiement: null, montant: 0 });
    toast.success("Membre exempté.");
  }

  async function mettreAJour(memberId, patch) {
    await upsert(memberId, patch);
    toast.success("Mise à jour enregistrée.");
  }

  return { cotisations, loading, saving, marquerPaye, marquerEnAttente, marquerExempte, mettreAJour, reload: load };
}
