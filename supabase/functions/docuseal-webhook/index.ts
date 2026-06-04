// Edge Function — Webhook DocuSeal
//
// DocuSeal appelle cette URL quand un document est signé.
// verify_jwt = false (DocuSeal ne peut pas envoyer de JWT Supabase) :
// l'authenticité est vérifiée via un secret en query (?token=...) comparé à
// DOCUSEAL_WEBHOOK_SECRET. La mise à jour passe par la service_role (RLS contournée).
//
// Événements gérés :
//   • form.completed       → un signataire a signé (suivi partiel)
//   • submission.completed → tous ont signé → statut "signe" + date + URL signée

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Vérification du secret partagé
  const expected = Deno.env.get("DOCUSEAL_WEBHOOK_SECRET");
  const token = new URL(req.url).searchParams.get("token");
  if (!expected || token !== expected) {
    return jsonResponse({ error: "Non autorisé" }, 401);
  }

  let payload: { event_type?: string; data?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return jsonResponse({ error: "JSON invalide" }, 400); }

  const eventType = payload.event_type;
  const data = payload.data ?? {};

  // L'identifiant de submission peut être dans data.id (submission.completed)
  // ou data.submission_id (form.completed)
  const submissionId = String(
    (data.submission_id as string | number) ?? (data.id as string | number) ?? ""
  );
  if (!submissionId) return jsonResponse({ ok: true, ignored: "pas de submission_id" });

  const db = getServiceClient();

  try {
    if (eventType === "submission.completed") {
      const signedUrl = (data.combined_document_url as string)
        ?? ((data.documents as Array<{ url?: string }> | undefined)?.[0]?.url)
        ?? null;
      await db.from("signatures").update({
        statut: "signe",
        date_signature: new Date().toISOString(),
        signed_url: signedUrl,
      }).eq("docuseal_submission_id", submissionId);
      return jsonResponse({ ok: true, updated: "signe" });
    }

    // form.completed : on note la progression sans changer le statut global
    if (eventType === "form.completed") {
      // Rien de bloquant : le passage à "signe" se fait sur submission.completed.
      return jsonResponse({ ok: true, noted: "form.completed" });
    }

    return jsonResponse({ ok: true, ignored: eventType ?? "inconnu" });
  } catch (err) {
    return jsonResponse({ ok: false, error: (err as Error).message }, 500);
  }
});
