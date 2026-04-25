// Vercel serverless — proxy FedaPay API
// La clé secrète reste côté serveur, jamais exposée au navigateur.

const FEDAPAY_BASE = process.env.FEDAPAY_ENV === "production"
  ? "https://api.fedapay.com/v1"
  : "https://sandbox-api.fedapay.com/v1";

const ALLOWED_ORIGINS = [
  "https://mabellepromo.org",
  "https://www.mabellepromo.org",
  "https://mabellepromo.vercel.app",
];

function getAllowedOrigin(req) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost")) return origin;
  return ALLOWED_ORIGINS[0];
}

/* ── Rate limiting ── */
const rateLimitMap = new Map();
const RATE_LIMIT = 10, RATE_WINDOW = 5 * 60 * 1000;
function checkRateLimit(ip) {
  const now = Date.now();
  const ts = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (ts.length >= RATE_LIMIT) return false;
  ts.push(now);
  rateLimitMap.set(ip, ts);
  return true;
}

/* ── Appel FedaPay ── */
async function fedaFetch(path, method = "GET", body = null) {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) throw new Error("FEDAPAY_SECRET_KEY non configurée");
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${FEDAPAY_BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `FedaPay ${res.status}`);
  return json;
}

/* ── Validation ── */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
function isValidEmail(e) { return typeof e === "string" && EMAIL_RE.test(e); }

export default async function handler(req, res) {
  const origin = getAllowedOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) return res.status(429).json({ error: "Trop de requêtes." });

  const { action, ...data } = req.body || {};

  try {
    // ── Créer une transaction et retourner l'URL de paiement ──
    if (action === "create") {
      const { type, amount, customer_nom, customer_email, annee, description } = data;

      if (!["cotisation", "don"].includes(type))
        return res.status(400).json({ error: "Type invalide." });
      if (!isValidEmail(customer_email))
        return res.status(400).json({ error: "Email invalide." });
      if (!customer_nom?.trim())
        return res.status(400).json({ error: "Nom requis." });
      if (!amount || amount < 500 || amount > 10_000_000)
        return res.status(400).json({ error: "Montant invalide." });

      // Décomposer le nom en prénom / nom de famille
      const parts = customer_nom.trim().split(/\s+/);
      const firstname = parts[0] || "—";
      const lastname  = parts.slice(1).join(" ") || "—";

      const callbackUrl = `${process.env.APP_URL || "https://mabellepromo.org"}/paiement/retour`;

      // 1. Créer la transaction
      const txData = await fedaFetch("/transactions", "POST", {
        description: description || (type === "cotisation"
          ? `Cotisation MBP ${annee || new Date().getFullYear()}`
          : "Don — Ma Belle Promo"),
        amount,
        currency: { iso: "XOF" },
        customer: { firstname, lastname, email: customer_email },
        callback_url: callbackUrl,
      });

      const txId = txData["v1/transaction"]?.id;
      if (!txId) throw new Error("Identifiant de transaction manquant.");

      // 2. Générer le token de paiement
      const tokenData = await fedaFetch(`/transactions/${txId}/token`, "POST");
      const checkoutUrl = tokenData.url || tokenData["v1/transaction_token"]?.url;
      if (!checkoutUrl) throw new Error("URL de paiement manquante.");

      return res.status(200).json({
        transaction_id: String(txId),
        checkout_url: checkoutUrl,
      });
    }

    // ── Vérifier le statut d'une transaction ──
    if (action === "verify") {
      const { transaction_id } = data;
      if (!transaction_id) return res.status(400).json({ error: "transaction_id requis." });

      const txData = await fedaFetch(`/transactions/${transaction_id}`);
      const tx = txData["v1/transaction"];
      return res.status(200).json({ status: tx?.status || "unknown" });
    }

    return res.status(400).json({ error: "Action invalide. Utilisez 'create' ou 'verify'." });

  } catch (err) {
    console.error("fedapay error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
