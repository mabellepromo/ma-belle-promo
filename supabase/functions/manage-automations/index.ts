// CRUD pour la table automations — contourne PostgREST via service role
// GET  → liste toutes les automatisations
// POST { action: "toggle",      id, enabled }      → active/désactive
// POST { action: "save_config", id, config }       → sauvegarde la config

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getServiceClient, jsonResponse } from "../_shared/db.ts";

serve(async (req) => {
  const db = getServiceClient();

  try {
    const body = await req.json().catch(() => ({}));
    const { action, id } = body as { action?: string; id?: string };

    if (action === "list") {
      const { data, error } = await db
        .from("automations")
        .select("*")
        .order("id");
      if (error) throw new Error(error.message);
      return jsonResponse(data ?? []);
    }

    if (action === "toggle") {
      if (!id) throw new Error("Paramètre 'id' manquant");
      const { enabled } = body as { enabled: boolean };
      const { error } = await db
        .from("automations")
        .update({ enabled })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return jsonResponse({ success: true });
    }

    if (action === "save_config") {
      if (!id) throw new Error("Paramètre 'id' manquant");
      const { config } = body as { config: Record<string, unknown> };
      const { error } = await db
        .from("automations")
        .update({ config })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return jsonResponse({ success: true });
    }

    throw new Error(`Action inconnue : ${action ?? "(vide)"}`);

  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
