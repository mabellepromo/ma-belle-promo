// Edge Function — Envoi d'email de masse via Brevo
// Fichiers joints téléchargés depuis Supabase Storage (pas de base64 dans la requête)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceClient, corsHeaders, jsonResponse } from "../_shared/db.ts";
import { wrapHtml } from "../_shared/brevo.ts";

const SENDER = { name: "Association Ma Belle Promo (MBP)", email: "contact@mabellepromo.org" };
const BATCH_SIZE = 100;
const BUCKET = "email-attachments";

interface Recipient { email: string; nom: string; }
interface AttachmentRef { name: string; storagePath: string; }

interface RequestBody {
  subject: string;
  htmlContent: string;
  recipients: Recipient[];
  sentBy?: string;
  attachments?: AttachmentRef[];
}

// Conversion Uint8Array → base64 sans débordement de pile (chunks de 8 Ko)
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Vérification JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Non autorisé" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey    = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return jsonResponse({ error: "Configuration Supabase manquante" }, 500);

  const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }).auth.getUser();
  if (authErr || !user) return jsonResponse({ error: "Token invalide ou expiré" }, 401);

  // Vérification du rôle CÔTÉ SERVEUR (admin ou bureau uniquement) — aligné sur assistant-ia.
  // Sans ce contrôle, n'importe quel membre authentifié pourrait déclencher un envoi de masse.
  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== "admin" && role !== "bureau") {
    return jsonResponse({ error: "Accès réservé au bureau de l'association." }, 403);
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) return jsonResponse({ error: "BREVO_API_KEY non configurée" }, 500);

  let body: RequestBody;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: "JSON invalide" }, 400); }

  const { subject, htmlContent, recipients, sentBy, attachments } = body;

  if (!subject?.trim())    return jsonResponse({ error: "Objet obligatoire" }, 400);
  if (!htmlContent?.trim()) return jsonResponse({ error: "Corps obligatoire" }, 400);
  if (!recipients?.length) return jsonResponse({ error: "Aucun destinataire" }, 400);
  if (recipients.length > 300) return jsonResponse({ error: "Max 300 destinataires" }, 400);

  // NB : la newsletter va TOUJOURS aux abonnés réels (envoi délibéré du bureau).
  // On n'applique volontairement PAS le détournement TEST_REDIRECT_EMAIL ici, contrairement
  // aux automatisations (cf. _shared/brevo.ts) : une campagne ne doit jamais être silencieusement
  // redirigée vers l'adresse de test tant que ce secret est posé pour tester les automatisations.

  const db = getServiceClient();

  // Téléchargement des pièces jointes depuis Supabase Storage
  const brevoAttachments: Array<{ content: string; name: string }> = [];
  const storagePathsToDelete: string[] = [];

  if (attachments?.length) {
    for (const att of attachments) {
      const { data, error } = await db.storage.from(BUCKET).download(att.storagePath);
      if (error) {
        console.error(`Storage download failed: ${att.storagePath} — ${error.message}`);
        continue;
      }
      const bytes = new Uint8Array(await data.arrayBuffer());
      brevoAttachments.push({ content: uint8ToBase64(bytes), name: att.name });
      storagePathsToDelete.push(att.storagePath);
    }
  }

  const processedContent = htmlContent.replace(/\{\{prenom\}\}/gi, "{{params.prenom}}");
  const wrappedHtml = wrapHtml(processedContent);

  let sent = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const messageVersions = batch.map(r => ({
      to: [{ email: r.email, name: r.nom || "" }],
      params: { prenom: r.nom?.split(" ")[0] || r.nom || "cher(e) membre" },
    }));

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: SENDER,
          subject,
          htmlContent: wrappedHtml,
          messageVersions,
          ...(brevoAttachments.length ? { attachment: brevoAttachments } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || `Brevo HTTP ${res.status}`);
      }
      sent += batch.length;
    } catch (err) {
      errors.push(`Lot ${Math.floor(i / BATCH_SIZE) + 1} : ${(err as Error).message}`);
    }
  }

  // Nettoyage Storage après envoi (succès ou partiel)
  if (storagePathsToDelete.length) {
    await db.storage.from(BUCKET).remove(storagePathsToDelete);
  }

  const status: "success" | "error" = errors.length > 0 && sent === 0 ? "error" : "success";

  await db.from("email_logs").insert({
    source: "envoi-masse",
    subject,
    recipients: recipients.map(r => r.email),
    recipient_count: sent,
    html_content: wrappedHtml,
    status,
    error_message: errors.length > 0 ? errors.join(" | ") : null,
    sent_by: sentBy || user.email || null,
    sent_at: new Date().toISOString(),
  });

  if (status === "error") return jsonResponse({ success: false, error: errors.join(" | "), sent }, 500);

  return jsonResponse({ success: true, sent, ...(errors.length ? { partialErrors: errors } : {}) });
});
