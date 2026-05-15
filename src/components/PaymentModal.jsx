import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

const COTISATION_AMOUNT = 30_000;

export default function PaymentModal({ open, onClose, type = "don", user = null }) {
  const annee = new Date().getFullYear();

  const [nom,    setNom]    = useState(user?.full_name || "");
  const [email,  setEmail]  = useState(user?.email     || "");
  const [amount, setAmount] = useState(type === "cotisation" ? COTISATION_AMOUNT : "");
  const [error,  setError]  = useState("");
  const [loading, setLoading] = useState(false);

  const montantAffiche = type === "cotisation"
    ? `${COTISATION_AMOUNT.toLocaleString("fr-FR")} XOF`
    : null;

  async function handlePay(e) {
    e.preventDefault();
    setError("");

    const finalAmount = type === "cotisation" ? COTISATION_AMOUNT : Number(amount);
    if (!nom.trim())          return setError("Veuillez saisir votre nom.");
    if (!email.trim())        return setError("Veuillez saisir votre email.");
    if (finalAmount < 500)    return setError("Montant minimum : 500 XOF.");

    setLoading(true);
    try {
      // 1. Créer la transaction côté serveur
      const r = await fetch("/api/fedapay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:         "create",
          type,
          amount:         finalAmount,
          customer_nom:   nom.trim(),
          customer_email: email.trim(),
          annee:          type === "cotisation" ? annee : undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.checkout_url) {
        setError(data.error || "Erreur lors de la création du paiement.");
        return;
      }

      // 2. Enregistrer le paiement en attente dans Supabase
      await supabase.from("payments").insert({
        transaction_id: data.transaction_id,
        type,
        amount:         finalAmount,
        customer_email: email.trim(),
        customer_nom:   nom.trim(),
        annee:          type === "cotisation" ? annee : null,
        status:         "pending",
      });

      // 3. Rediriger vers la page de paiement FedaPay
      window.location.href = data.checkout_url;

    } catch (err) {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-y-auto"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-primary/5">
              <div>
                <h2 className="font-heading font-bold text-foreground text-lg">
                  {type === "cotisation" ? `Cotisation ${annee}` : "Faire un don"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type === "cotisation"
                    ? `Paiement sécurisé — ${montantAffiche}`
                    : "Montant libre — paiement sécurisé"}
                </p>
              </div>
              <button onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modes de paiement acceptés */}
            <div className="px-6 pt-5 pb-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Acceptés :</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                <Smartphone className="w-3 h-3" /> Flooz (Moov)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
                <Smartphone className="w-3 h-3" /> T-Money
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border text-muted-foreground text-xs font-semibold rounded-full">
                <CreditCard className="w-3 h-3" /> Visa / Mastercard
              </span>
            </div>

            {/* Formulaire */}
            <form onSubmit={handlePay} className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nom complet</label>
                <input type="text" value={nom} onChange={e => { setNom(e.target.value); setError(""); }}
                  placeholder="Prénom Nom" required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Adresse email</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="votre@email.com" required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all" />
              </div>

              {type === "don" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Montant (XOF)</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(""); }}
                      placeholder="Ex : 10 000" min={500} required
                      className="w-full px-3.5 py-2.5 pr-16 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">XOF</span>
                  </div>
                  {/* Montants suggérés */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[5000, 10000, 20000, 50000].map(v => (
                      <button key={v} type="button" onClick={() => setAmount(v)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${Number(amount) === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                        {v.toLocaleString("fr-FR")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {type === "cotisation" && (
                <div className="flex items-center justify-between px-4 py-3 bg-primary/8 border border-primary/20 rounded-xl">
                  <span className="text-sm text-foreground">Cotisation {annee}</span>
                  <span className="font-bold text-primary">{COTISATION_AMOUNT.toLocaleString("fr-FR")} XOF</span>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: loading ? "rgba(16,185,129,0.5)" : "linear-gradient(135deg,#10b981,#34d399)",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(16,185,129,0.3)",
                }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Préparation…</>
                  : <><ExternalLink className="w-4 h-4" /> Procéder au paiement</>}
              </motion.button>

              <p className="text-center text-xs text-muted-foreground">
                Paiement sécurisé par{" "}
                <span className="font-semibold text-foreground">FedaPay</span>
                {" "}· Vous serez redirigé(e) sur leur page sécurisée.
              </p>
            </form>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
