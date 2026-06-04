// Edge Function — Intégration DocuSeal (signature électronique)
//
// Sécurité :
//   • Vérification JWT puis rôle admin CÔTÉ SERVEUR (403 sinon).
//   • La clé API DocuSeal (DOCUSEAL_API_KEY) reste un secret Supabase, jamais exposée au frontend.
//
// Secrets requis : DOCUSEAL_URL (ex: https://sign.mabellepromo.org), DOCUSEAL_API_KEY.
//
// Actions (body.action) :
//   • "send"     → crée une demande de signature dans DocuSeal + enregistre le suivi.
//   • "document" → récupère une URL FRAÎCHE du document signé (les URLs DocuSeal expirent).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";

interface Signataire { name: string; email: string; role?: string; }

function docusealHeaders(apiKey: string) {
  return { "X-Auth-Token": apiKey, "Content-Type": "application/json" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // 1) Auth + rôle admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Non autorisé" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return jsonResponse({ error: "Configuration Supabase manquante" }, 500);

  const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }).auth.getUser();
  if (authErr || !user) return jsonResponse({ error: "Token invalide ou expiré" }, 401);

  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== "admin" && role !== "bureau") {
    return jsonResponse({ error: "Accès réservé au bureau de l'association." }, 403);
  }

  // 2) Config DocuSeal
  const docusealUrl = Deno.env.get("DOCUSEAL_URL");
  const docusealKey = Deno.env.get("DOCUSEAL_API_KEY");
  if (!docusealUrl || !docusealKey) {
    return jsonResponse({ error: "DocuSeal non configuré (DOCUSEAL_URL / DOCUSEAL_API_KEY)." }, 500);
  }
  const base = docusealUrl.replace(/\/+$/, "");
  const db = getServiceClient();

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return jsonResponse({ error: "JSON invalide" }, 400); }
  const action = body.action as string;

  try {
    // ─── Créer une demande de signature ───
    if (action === "send") {
      const documentTitre = (body.document_titre as string)?.trim();
      const templateId = body.template_id as string | number;
      const signataires = (body.signataires as Signataire[]) ?? [];
      if (!documentTitre) return jsonResponse({ error: "Titre du document requis" }, 400);
      if (!templateId) return jsonResponse({ error: "template_id DocuSeal requis" }, 400);
      if (signataires.length === 0) return jsonResponse({ error: "Au moins un signataire requis" }, 400);

      const res = await fetch(`${base}/api/submissions`, {
        method: "POST",
        headers: docusealHeaders(docusealKey),
        body: JSON.stringify({
          template_id: templateId,
          send_email: true,
          submitters: signataires.map(s => ({ name: s.name, email: s.email, role: s.role })),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`DocuSeal HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }
      const created = await res.json();
      // La réponse est un tableau de submitters ; tous partagent le même submission_id
      const submissionId = Array.isArray(created)
        ? (created[0]?.submission_id ?? created[0]?.submission?.id)
        : (created?.id ?? created?.submission_id);

      const { data: row, error: insErr } = await db.from("signatures").insert({
        document_titre: documentTitre,
        docuseal_template_id: String(templateId),
        signataires,
        statut: "envoye",
        docuseal_submission_id: submissionId ? String(submissionId) : null,
        created_by: user.email ?? null,
      }).select().maybeSingle();
      if (insErr) throw new Error(`Enregistrement: ${insErr.message}`);

      return jsonResponse({ success: true, submission_id: submissionId, signature: row });
    }

    // ─── Récupérer une URL fraîche du document signé ───
    if (action === "document") {
      const signatureId = body.signature_id as string;
      if (!signatureId) return jsonResponse({ error: "signature_id requis" }, 400);

      const { data: sig, error: sigErr } = await db
        .from("signatures").select("docuseal_submission_id").eq("id", signatureId).maybeSingle();
      if (sigErr) throw new Error(sigErr.message);
      if (!sig?.docuseal_submission_id) return jsonResponse({ error: "Aucune soumission DocuSeal liée." }, 404);

      const res = await fetch(`${base}/api/submissions/${sig.docuseal_submission_id}`, {
        headers: docusealHeaders(docusealKey),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`DocuSeal HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }
      const data = await res.json();
      // URL combinée signée, sinon premier document
      const url = data?.combined_document_url
        ?? data?.documents?.[0]?.url
        ?? data?.submitters?.[0]?.documents?.[0]?.url
        ?? null;
      return jsonResponse({ success: true, url, audit_log_url: data?.audit_log_url ?? null });
    }

    return jsonResponse({ error: "Action inconnue" }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
});
