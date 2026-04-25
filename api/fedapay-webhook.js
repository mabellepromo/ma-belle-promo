// Vercel serverless — reçoit les événements FedaPay
// FedaPay envoie un POST dès qu'une transaction change de statut.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL     || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // clé service (pas anon) pour ignorer RLS
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const event = req.body;
    // FedaPay envoie { name: "transaction.approved", object: { id, status, amount, ... } }
    const tx     = event?.object;
    const status = tx?.status;
    const txId   = String(tx?.id || "");

    if (!txId || !status) return res.status(400).json({ error: "Payload invalide." });

    // Mettre à jour le statut dans Supabase
    const { error } = await supabase
      .from("payments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("transaction_id", txId);

    if (error) {
      console.error("webhook supabase error:", error.message);
      // On répond quand même 200 pour éviter que FedaPay renvoie sans cesse
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("webhook error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
