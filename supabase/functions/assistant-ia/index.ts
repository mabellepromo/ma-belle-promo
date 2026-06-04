// Edge Function — Assistant IA du bureau MBP
//
// Deux modes :
//   • "data"    → questions-réponses sur les données réelles via function calling (lecture seule)
//   • "content" → génération de contenu (résumés de PV, communiqués, emails, circulaires)
//
// Sécurité :
//   • Vérification JWT puis vérification du rôle (admin | bureau) CÔTÉ SERVEUR → 403 sinon.
//   • La clé du moteur IA reste un secret Supabase, jamais exposée au frontend.
//   • Les tools sont des requêtes Supabase prédéfinies en lecture seule : l'IA ne génère jamais de SQL.
//     consulter_contenu n'accepte qu'un nom de rubrique pris dans une LISTE BLANCHE (RUBRIQUES).
//   • Périmètre des données (décision du bureau, juin 2026) : l'assistant peut consulter le détail
//     des rubriques de gestion (membres avec coordonnées, cotisations, trésorerie…). Seul le champ
//     confidentiel notes_internes reste exclu.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getServiceClient,
  corsHeaders,
  jsonResponse,
  type SupabaseServiceClient,
} from "../_shared/db.ts";

// ── Configuration du moteur IA (isolée pour rester agnostique du fournisseur) ──
// Pour basculer vers un autre moteur (ex : Claude Haiku), il suffit de réécrire callLLM()
// et d'adapter ces deux constantes — le reste de la fonction est indépendant.
const LLM_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const LLM_MODEL = Deno.env.get("LLM_MODEL") || "llama-3.3-70b-versatile";
const MAX_TOOL_ITERATIONS = 5; // garde-fou anti-boucle infinie

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  // deno-lint-ignore no-explicit-any
  tool_calls?: any[];
  tool_call_id?: string;
}

class LLMError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

// Appel unique au moteur IA. Renvoie le message de l'assistant (avec éventuels tool_calls).
// deno-lint-ignore no-explicit-any
async function callLLM(messages: ChatMessage[], tools?: any[]): Promise<ChatMessage> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new LLMError("GROQ_API_KEY non configurée", 500);

  const res = await fetch(LLM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (res.status === 429) {
    throw new LLMError("Quota du moteur IA atteint. Réessayez dans quelques minutes.", 429);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LLMError(`Moteur IA — HTTP ${res.status} ${detail}`.trim(), 502);
  }

  const data = await res.json();
  const message = data?.choices?.[0]?.message;
  if (!message) throw new LLMError("Réponse vide du moteur IA", 502);
  return message as ChatMessage;
}

// ── System prompts par mode ───────────────────────────────────────────────────
const SYSTEM_DATA = `Tu es l'assistant interne de l'association FDD Ma Belle Promo (MBP), \
association des diplômés de la Faculté de Droit de l'Université de Lomé (promotion 1994-2000).
Tu réponds aux questions du bureau en consultant EXCLUSIVEMENT les données réelles via les fonctions fournies.
Règles :
- N'invente jamais une information. Appelle toujours la fonction adaptée avant de répondre.
- Pour toute question sur le contenu du site (articles, projets, équipe, partenaires, communiqués,
  événements, programmes, documents, galeries, webinaires…) ou sur des listes détaillées (membres,
  cotisations, trésorerie, assemblées, mandats, factures, bénévoles, sondages), utilise consulter_contenu.
- Pour des décomptes ou statistiques, privilégie les fonctions dédiées (get_membres_stats,
  get_cotisations_status, get_tresorerie, get_repartition_geographique).
- Pour les coordonnées d'un membre (email, téléphone, fonction), utilise search_membres
  ou consulter_contenu avec rubrique "membres" — ces informations SONT disponibles.
- Si l'information n'est pas disponible via les fonctions, dis-le clairement.
- Réponds en français, de façon concise, factuelle et chaleureuse.
- Les montants sont en francs CFA (FCFA).`;

const SYSTEM_CONTENT = `Tu es le rédacteur officiel de l'association FDD Ma Belle Promo (MBP), \
association des diplômés de la Faculté de Droit de l'Université de Lomé (promotion 1994-2000).
Tu rédiges en français des contenus institutionnels : résumés de procès-verbaux, communiqués, \
emails, circulaires, à partir de la consigne ou du texte fourni.
Ton : professionnel, chaleureux et fédérateur. Structure claire. Pas de données chiffrées inventées : \
si un chiffre manque, laisse un champ à compléter entre crochets, ex : [montant].`;

// ── Liste blanche des rubriques consultables (lecture seule) ──────────────────
// L'IA ne fournit qu'un NOM de rubrique ; le code décide de la table et des colonnes.
// Ajouter une rubrique = ajouter une ligne ici.
interface RubriqueConfig {
  table: string;
  columns: string;
  order?: string;
  ascending?: boolean;
  limit: number;
}
// Limites volontairement basses : le palier gratuit Groq plafonne à ~12 000 tokens/minute.
const RUBRIQUES: Record<string, RubriqueConfig> = {
  // Contenu public du site
  articles:    { table: "articles",       columns: "id, titre, extrait, categorie, date, statut, auteur, created_at", order: "created_at", ascending: false, limit: 15 },
  projets:     { table: "projets",        columns: "*", limit: 15 },
  evenements:  { table: "evenements",     columns: "id, titre, date, lieu, type, statut", limit: 15 },
  equipe:      { table: "equipe",         columns: "*", limit: 20 },
  partenaires: { table: "sponsors",       columns: "*", limit: 20 },
  communiques: { table: "communiques",    columns: "id, titre, date, type, resume, url, created_at", order: "created_at", ascending: false, limit: 15 },
  programmes:  { table: "programmes",     columns: "*", limit: 15 },
  ressources:  { table: "ressources",     columns: "*", limit: 15 },
  documents:   { table: "documents",      columns: "*", limit: 20 },
  galeries:    { table: "galeries",       columns: "*", limit: 20 },
  videos:      { table: "media_videos",   columns: "*", limit: 20 },
  photos:      { table: "media_photos",   columns: "*", limit: 20 },
  webinaires:  { table: "webinar_events", columns: "*", limit: 15 },
  // Gestion / données détaillées (notes_internes exclu)
  membres:     { table: "members",        columns: "nom, profession, ville, pays, email, telephone, anniversaire, role, bureau, status", order: "nom", limit: 60 },
  cotisations: { table: "cotisations",    columns: "member_id, annee, montant, statut, date_paiement, mode_paiement", order: "annee", ascending: false, limit: 80 },
  tresorerie:  { table: "tresorerie_transactions", columns: "type, categorie, libelle, montant, date, annee", order: "date", ascending: false, limit: 80 },
  assemblees:  { table: "assemblees",     columns: "*", limit: 15 },
  mandats:     { table: "mandats",        columns: "*", limit: 20 },
  factures:    { table: "factures",       columns: "*", limit: 30 },
  benevoles:   { table: "benevoles",      columns: "*", limit: 30 },
  sondages:    { table: "sondages",       columns: "*", limit: 15 },
};

// Tronque les chaînes longues pour rester sous la limite de tokens/minute du moteur IA.
// deno-lint-ignore no-explicit-any
function compactRows(rows: any[]): any[] {
  return (rows ?? []).map((row) => {
    // deno-lint-ignore no-explicit-any
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === "string" && v.length > 160 ? v.slice(0, 160) + "…" : v;
    }
    return out;
  });
}

// ── Définition des tools (format function calling compatible OpenAI) ──────────
// deno-lint-ignore no-explicit-any
const TOOLS: any[] = [
  {
    type: "function",
    function: {
      name: "get_membres_stats",
      description:
        "Statistiques globales des membres : effectif total validé, nombre à jour de cotisation cette année, demandes en attente de validation, membres dormants (aucune cotisation payée/partielle sur 3 ans), nombre au bureau.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_membres_bureau",
      description:
        "Liste nominative des membres du bureau (nom, fonction/rôle, ville, profession). Ne renvoie pas d'email ni de téléphone.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cotisations_status",
      description:
        "État des cotisations pour une année donnée : nombre de payés, partiels, en attente, exemptés, taux de paiement et montant total perçu.",
      parameters: {
        type: "object",
        properties: {
          annee: { type: "integer", description: "Année concernée, ex : 2026" },
        },
        required: ["annee"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_evenements_a_venir",
      description: "Liste des prochains événements (titre, date, lieu, format, statut).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_tresorerie",
      description:
        "Trésorerie d'une année : total des recettes, total des dépenses et solde (en FCFA).",
      parameters: {
        type: "object",
        properties: {
          annee: { type: "integer", description: "Année concernée, ex : 2026" },
        },
        required: ["annee"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_repartition_geographique",
      description: "Répartition des membres validés par pays.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_membres",
      description:
        "Recherche un membre par nom, ville ou profession (10 résultats max) et renvoie ses coordonnées (email, téléphone, fonction). À utiliser pour retrouver un membre précis ou ses coordonnées.",
      parameters: {
        type: "object",
        properties: {
          critere: { type: "string", description: "Terme recherché : nom, ville ou profession" },
        },
        required: ["critere"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consulter_contenu",
      description:
        "Consulte une rubrique du site ou de la gestion et renvoie ses éléments (lecture seule). " +
        "À utiliser pour toute question portant sur le contenu : articles/actualités, projets, équipe, " +
        "partenaires, communiqués, événements, programmes, ressources, documents, galeries, vidéos, photos, " +
        "webinaires, ou les données détaillées (membres, cotisations, trésorerie, assemblées, mandats, " +
        "factures, bénévoles, sondages).",
      parameters: {
        type: "object",
        properties: {
          rubrique: {
            type: "string",
            enum: Object.keys(RUBRIQUES),
            description: "La rubrique à consulter.",
          },
        },
        required: ["rubrique"],
      },
    },
  },
];

const currentYear = () => new Date().getFullYear();

// ── Exécuteurs des tools (lecture seule, requêtes paramétrées) ────────────────
const TOOL_HANDLERS: Record<
  string,
  // deno-lint-ignore no-explicit-any
  (args: any, db: SupabaseServiceClient) => Promise<unknown>
> = {
  async get_membres_stats(_args, db) {
    const [{ data: members }, { data: cots }] = await Promise.all([
      db.from("members").select("id, bureau, status"),
      db.from("cotisations").select("member_id, statut, annee"),
    ]);
    const valides = (members ?? []).filter((m) => m.status === "validated");
    const enAttente = (members ?? []).filter((m) => m.status === "pending").length;
    const auBureau = valides.filter((m) => m.bureau).length;

    const yr = currentYear();
    const payesAnnee = new Set(
      (cots ?? [])
        .filter((c) => c.annee === yr && c.statut === "payé")
        .map((c) => String(c.member_id)),
    );
    const aJour = valides.filter((m) => payesAnnee.has(String(m.id))).length;

    const yrs3 = [yr - 2, yr - 1, yr];
    const actifs = new Set(
      (cots ?? [])
        .filter((c) => yrs3.includes(c.annee) && (c.statut === "payé" || c.statut === "partiel"))
        .map((c) => String(c.member_id)),
    );
    const dormants = valides.filter((m) => !actifs.has(String(m.id))).length;

    return {
      total_membres: valides.length,
      a_jour_cotisation: aJour,
      en_attente_validation: enAttente,
      dormants,
      au_bureau: auBureau,
      annee_reference: yr,
    };
  },

  async get_membres_bureau(_args, db) {
    const { data } = await db
      .from("members")
      .select("nom, role, ville, profession")
      .eq("status", "validated")
      .eq("bureau", true)
      .order("nom");
    return {
      count: (data ?? []).length,
      membres: (data ?? []).map((m) => ({
        nom: m.nom,
        fonction: m.role,
        ville: m.ville,
        profession: m.profession,
      })),
    };
  },

  async get_cotisations_status(args, db) {
    const annee = Number(args?.annee) || currentYear();
    const [{ data: cots }, { count: effectif }] = await Promise.all([
      db.from("cotisations").select("statut, montant").eq("annee", annee),
      db.from("members").select("id", { count: "exact", head: true }).eq("status", "validated"),
    ]);
    const rows = cots ?? [];
    const payes = rows.filter((c) => c.statut === "payé").length;
    const partiels = rows.filter((c) => c.statut === "partiel").length;
    const exemptes = rows.filter((c) => c.statut === "exempté").length;
    const enAttente = rows.filter((c) => c.statut === "en_attente").length;
    const montantTotal = rows.reduce((s, c) => s + Number(c.montant || 0), 0);
    const base = (effectif ?? 0) - exemptes;

    return {
      annee,
      payes,
      partiels,
      en_attente: enAttente,
      exemptes,
      effectif_total: effectif ?? 0,
      taux_paiement_pct: base > 0 ? Math.round((payes / base) * 100) : 0,
      montant_total_percu_fcfa: montantTotal,
    };
  },

  async get_evenements_a_venir(_args, db) {
    const { data } = await db
      .from("evenements")
      .select("titre, date, lieu, type, statut");
    const aVenir = (data ?? []).filter((e) => (e.statut || "").toLowerCase() !== "passé");
    return {
      count: aVenir.length,
      evenements: aVenir.map((e) => ({
        titre: e.titre,
        date: e.date,
        lieu: e.lieu,
        format: e.type,
        statut: e.statut,
      })),
    };
  },

  async get_tresorerie(args, db) {
    const annee = Number(args?.annee) || currentYear();
    const { data } = await db
      .from("tresorerie_transactions")
      .select("type, montant")
      .eq("annee", annee);
    const rows = data ?? [];
    const recettes = rows
      .filter((r) => r.type === "recette")
      .reduce((s, r) => s + Number(r.montant || 0), 0);
    const depenses = rows
      .filter((r) => r.type === "depense")
      .reduce((s, r) => s + Number(r.montant || 0), 0);
    return {
      annee,
      recettes_fcfa: recettes,
      depenses_fcfa: depenses,
      solde_fcfa: recettes - depenses,
    };
  },

  async get_repartition_geographique(_args, db) {
    const { data } = await db.from("members").select("pays, status");
    const valides = (data ?? []).filter((m) => m.status === "validated");
    const counts: Record<string, number> = {};
    for (const m of valides) {
      const key = (m.pays || "").trim() || "Non renseigné";
      counts[key] = (counts[key] || 0) + 1;
    }
    const repartition = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([pays, count]) => ({ pays, count }));
    return { total_membres: valides.length, repartition };
  },

  async search_membres(args, db) {
    // Neutralise les caractères qui casseraient le filtre .or() de PostgREST
    const critere = String(args?.critere ?? "").replace(/[,%()*]/g, " ").trim();
    if (!critere) return { count: 0, resultats: [] };
    const { data } = await db
      .from("members")
      .select("nom, profession, ville, pays, email, telephone, role, bureau")
      .eq("status", "validated")
      .or(`nom.ilike.%${critere}%,ville.ilike.%${critere}%,profession.ilike.%${critere}%`)
      .limit(10);
    return { count: (data ?? []).length, resultats: data ?? [] };
  },

  async consulter_contenu(args, db) {
    const key = String(args?.rubrique ?? "").toLowerCase().trim();
    const cfg = RUBRIQUES[key];
    if (!cfg) {
      return {
        error: `Rubrique inconnue : "${key}". Rubriques disponibles : ${Object.keys(RUBRIQUES).join(", ")}.`,
      };
    }
    let query = db.from(cfg.table).select(cfg.columns).limit(cfg.limit);
    if (cfg.order) query = query.order(cfg.order, { ascending: cfg.ascending ?? true });
    const { data, error } = await query;
    if (error) return { error: `Lecture de la rubrique "${key}" impossible : ${error.message}` };
    return { rubrique: key, count: (data ?? []).length, elements: compactRows(data ?? []) };
  },
};

async function executeTool(
  name: string,
  // deno-lint-ignore no-explicit-any
  args: any,
  db: SupabaseServiceClient,
): Promise<unknown> {
  const handler = TOOL_HANDLERS[name];
  if (!handler) return { error: `Fonction inconnue : ${name}` };
  try {
    return await handler(args, db);
  } catch (err) {
    return { error: `Erreur lors de l'exécution de ${name} : ${(err as Error).message}` };
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // 1) Vérification JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Non autorisé" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Configuration Supabase manquante" }, 500);
  }

  const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }).auth.getUser();
  if (authErr || !user) return jsonResponse({ error: "Token invalide ou expiré" }, 401);

  // 2) Vérification du rôle CÔTÉ SERVEUR (admin ou bureau uniquement)
  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== "admin" && role !== "bureau") {
    return jsonResponse({ error: "Accès réservé au bureau de l'association." }, 403);
  }

  // 3) Lecture du corps
  let body: { messages?: ChatMessage[]; mode?: "data" | "content" };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON invalide" }, 400);
  }

  const mode = body.mode === "content" ? "content" : "data";
  // On ne garde que les 8 derniers messages : limite la taille envoyée au moteur IA
  // (palier gratuit Groq plafonné en tokens/minute).
  const userMessages = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-8);
  if (userMessages.length === 0) {
    return jsonResponse({ error: "Aucun message fourni" }, 400);
  }

  const systemPrompt: ChatMessage = {
    role: "system",
    content: mode === "content" ? SYSTEM_CONTENT : SYSTEM_DATA,
  };
  const conversation: ChatMessage[] = [systemPrompt, ...userMessages];

  try {
    // Mode "content" : pas de tools, un seul aller-retour
    if (mode === "content") {
      const assistant = await callLLM(conversation);
      return jsonResponse({ reply: assistant.content ?? "" });
    }

    // Mode "data" : boucle de function calling
    const db = getServiceClient();
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const assistant = await callLLM(conversation, TOOLS);
      conversation.push(assistant);

      const toolCalls = assistant.tool_calls ?? [];
      if (toolCalls.length === 0) {
        return jsonResponse({ reply: assistant.content ?? "" });
      }

      for (const tc of toolCalls) {
        let parsedArgs: unknown = {};
        try {
          parsedArgs = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          parsedArgs = {};
        }
        const result = await executeTool(tc.function?.name, parsedArgs, db);
        conversation.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
    }

    // Garde-fou atteint : on demande une réponse finale sans tools
    const fallback = await callLLM(conversation);
    return jsonResponse({ reply: fallback.content ?? "Désolé, je n'ai pas pu finaliser la réponse." });
  } catch (err) {
    const e = err as LLMError;
    return jsonResponse({ error: e.message || "Erreur interne" }, e.status || 500);
  }
});
