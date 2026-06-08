// Utilitaires partagés pour l'accès à Supabase depuis les Edge Functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type SupabaseServiceClient = ReturnType<typeof createClient>;

export function getServiceClient(): SupabaseServiceClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  // Message éditable depuis le dashboard ({ subject, body }), ou null = repli sur le code.
  message_template: { subject?: string; body?: string } | null;
}

export async function getAutomation(
  client: SupabaseServiceClient,
  id: string
): Promise<Automation | null> {
  const { data, error } = await client
    .from("automations")
    .select("id, name, enabled, config, message_template")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Erreur lecture automation ${id}: ${error.message}`);
  return data as Automation | null;
}

export async function updateAutomationStatus(
  client: SupabaseServiceClient,
  id: string,
  status: "success" | "error" | "skipped",
  errorMessage?: string,
  nextRun?: Date
): Promise<void> {
  await client.from("automations").update({
    last_run: new Date().toISOString(),
    last_status: status,
    last_error: errorMessage ?? null,
    next_run: nextRun ? nextRun.toISOString() : null,
  }).eq("id", id);
}

// Calcule la prochaine occurrence d'un cron quotidien (lendemain même heure)
export function nextDailyRun(hourUTC = 8): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(hourUTC, 0, 0, 0);
  return d;
}

// Calcule le prochain 1er du mois à 8h UTC
export function nextMonthlyRun(): Date {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  d.setUTCHours(8, 0, 0, 0);
  return d;
}

// Calcule la prochaine heure pleine (cron horaire)
export function nextHourlyRun(): Date {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 1, 0, 0, 0);
  return d;
}

// Calcule la prochaine occurrence d'un jour de semaine donné à une heure UTC.
// dayOfWeek : 0 = dimanche … 1 = lundi … 6 = samedi
export function nextWeeklyRun(dayOfWeek = 1, hourUTC = 7): Date {
  const d = new Date();
  d.setUTCHours(hourUTC, 0, 0, 0);
  let diff = (dayOfWeek - d.getUTCDay() + 7) % 7;
  // Si on est le bon jour mais l'heure est déjà passée, viser la semaine suivante
  if (diff === 0 && d.getTime() <= Date.now()) diff = 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export async function wasAlreadySent(
  client: SupabaseServiceClient,
  automationId: string,
  targetId: string,
  targetKey: string,
  channel = "email"
): Promise<boolean> {
  const { data } = await client
    .from("automation_logs")
    .select("id")
    .eq("automation_id", automationId)
    .eq("target_id", targetId)
    .eq("target_key", targetKey)
    .eq("channel", channel)
    .maybeSingle();
  return !!data;
}

export async function markAsSent(
  client: SupabaseServiceClient,
  automationId: string,
  targetId: string,
  targetKey: string,
  channel = "email"
): Promise<void> {
  await client.from("automation_logs").upsert(
    { automation_id: automationId, target_id: targetId, target_key: targetKey, channel },
    { onConflict: "automation_id,target_id,target_key,channel", ignoreDuplicates: true }
  );
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Réponse JSON standard pour les edge functions
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
