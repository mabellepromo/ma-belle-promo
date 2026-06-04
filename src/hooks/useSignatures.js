import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Suivi des demandes de signature DocuSeal.
 * La création et la récupération du document passent par l'Edge Function `docuseal`
 * (la clé API DocuSeal n'est jamais exposée au frontend).
 */
export function useSignatures() {
  const [items,   setItems]   = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  // Envoie une demande de signature via DocuSeal
  async function send({ document_titre, template_id, signataires }) {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("docuseal", {
        body: { action: "send", document_titre, template_id, signataires },
      });
      if (error || data?.error) {
        toast.error("Erreur DocuSeal : " + (data?.error || error.message));
        return false;
      }
      toast.success("Demande de signature envoyée !");
      await load();
      return true;
    } finally {
      setSending(false);
    }
  }

  // Récupère une URL fraîche du document signé (les URLs DocuSeal expirent)
  async function openDocument(signatureId) {
    const { data, error } = await supabase.functions.invoke("docuseal", {
      body: { action: "document", signature_id: signatureId },
    });
    if (error || data?.error || !data?.url) {
      toast.error("Document indisponible : " + (data?.error || error?.message || "URL introuvable"));
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  async function remove(id) {
    if (!confirm("Supprimer ce suivi de signature ? (le document reste dans DocuSeal)")) return;
    const { error } = await supabase.from("signatures").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else { toast.success("Suivi supprimé."); await load(); }
  }

  return { items, loading, sending, send, openDocument, remove, reload: load };
}
