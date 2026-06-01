// Edge Function — Envoi d'email de masse via Brevo
// Appelée depuis le dashboard admin (BulkEmailComposer.jsx)
// Utilise messageVersions Brevo pour personnaliser {{prenom}} par destinataire

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";
import { wrapHtml } from "../_shared/brevo.ts";

const SENDER = {
  name: "Association Ma Belle Promo (MBP)",
  email: "contact@mabellepromo.org",
};

const BATCH_SIZE = 100; // Limite Brevo messageVersions par appel

interface Recipient {
  email: string;
  nom: string;
}

interface Attachment {
  name: string;
  content: string; // base64
  type: string;
}

interface RequestBody {
  subject: string;
  htmlContent: string;
  recipients: Recipient[];
  sentBy?: string;
  attachments?: Attachment[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Vérification JWT — seul un utilisateur authentifié peut déclencher l'envoi
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Non autorisé : Authorization manquant" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey    = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Configuration Supabase manquante" }, 500);
  }

  const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }).auth.getUser();

  if (authErr || !user) {
    return jsonResponse({ error: "Token invalide ou expiré" }, 401);
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "BREVO_API_KEY non configurée" }, 500);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Corps de la requête invalide (JSON attendu)" }, 400);
  }

  const { subject, htmlContent, recipients, sentBy, attachments } = body;

  if (!subject?.trim()) {
    return jsonResponse({ error: "L'objet (subject) est obligatoire" }, 400);
  }
  if (!htmlContent?.trim()) {
    return jsonResponse({ error: "Le corps du message (htmlContent) est obligatoire" }, 400);
  }
  if (!recipients?.length) {
    return jsonResponse({ error: "Aucun destinataire fourni" }, 400);
  }
  if (recipients.length > 300) {
    return jsonResponse({ error: "Dépassement de la limite : 300 destinataires maximum" }, 400);
  }

  // Remplace {{prenom}} par {{params.prenom}} pour la substitution Brevo
  const processedContent = htmlContent.replace(/\{\{prenom\}\}/gi, "{{params.prenom}}");
  const wrappedHtml = wrapHtml(processedContent);

  const db = getServiceClient();
  let sent = 0;
  const errors: string[] = [];

  // Envoi par lots de BATCH_SIZE
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const messageVersions = batch.map((r) => ({
      to: [{ email: r.email, name: r.nom || "" }],
      params: {
        prenom: r.nom?.split(" ")[0] || r.nom || "cher(e) membre",
      },
    }));

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: SENDER,
          subject,
          htmlContent: wrappedHtml,
          messageVersions,
          ...(attachments?.length ? {
            attachment: attachments.map(f => ({
              content: f.content,
              name: f.name,
            })),
          } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || `Brevo HTTP ${res.status}`
        );
      }

      sent += batch.length;
    } catch (err) {
      errors.push(`Lot ${Math.floor(i / BATCH_SIZE) + 1} : ${(err as Error).message}`);
    }
  }

  const status: "success" | "error" =
    errors.length > 0 && sent === 0 ? "error" : "success";

  // Log dans email_logs (service role, bypass RLS)
  await db.from("email_logs").insert({
    subject,
    recipient_count: sent,
    status,
    error_message: errors.length > 0 ? errors.join(" | ") : null,
    sent_by: sentBy || user.email || null,
    sent_at: new Date().toISOString(),
  });

  if (status === "error") {
    return jsonResponse(
      { success: false, error: errors.join(" | "), sent },
      500
    );
  }

  return jsonResponse({
    success: true,
    sent,
    ...(errors.length > 0 ? { partialErrors: errors } : {}),
  });
});
