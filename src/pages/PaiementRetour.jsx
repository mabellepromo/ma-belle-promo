import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Loader2, Home, RotateCcw } from "lucide-react";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";

const CONFIGS = {
  approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    title: "Paiement confirmé !",
    message: "Merci pour votre contribution. Votre paiement a bien été reçu et enregistré. Un email de confirmation vous sera envoyé à l'adresse indiquée.",
  },
  declined: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    title: "Paiement refusé",
    message: "Votre paiement n'a pas pu être traité. Aucun montant n'a été débité. Vous pouvez réessayer ou choisir un autre moyen de paiement.",
  },
  canceled: {
    icon: XCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    title: "Paiement annulé",
    message: "Vous avez annulé la transaction. Aucun montant n'a été débité. Vous pouvez reprendre le processus à tout moment.",
  },
  pending: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    title: "Paiement en attente",
    message: "Votre paiement est en cours de traitement. Le statut sera mis à jour automatiquement dès confirmation par l'opérateur.",
  },
  unknown: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
    title: "Vérification en cours",
    message: "Nous n'avons pas pu confirmer le statut de votre paiement immédiatement. Si vous avez été débité(e), votre paiement sera enregistré sous 24h. Contactez-nous si vous avez un doute.",
  },
};

export default function PaiementRetour() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  // FedaPay peut envoyer le token ou l'id de transaction en query param
  const transactionId =
    searchParams.get("transaction_id") ||
    searchParams.get("token") ||
    searchParams.get("id");

  useEffect(() => {
    if (!transactionId) {
      setStatus("unknown");
      return;
    }
    fetch("/api/fedapay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", transaction_id: transactionId }),
    })
      .then(r => r.json())
      .then(data => setStatus(data.status || "unknown"))
      .catch(() => setStatus("unknown"));
  }, [transactionId]);

  const cfg = CONFIGS[status] || CONFIGS.unknown;
  const Icon = cfg.icon;
  const canRetry = status === "declined" || status === "canceled";

  return (
    <div>
      <SEO title="Retour de paiement" description="Confirmation de votre paiement FedaPay." path="/paiement/retour" />
      <PageHero title="Retour de paiement" subtitle="Ma Belle Promo — Sécurisé par FedaPay" />

      <section className="py-20 max-w-lg mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-8 text-center shadow-sm"
        >
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Vérification du paiement…</p>
            </div>
          ) : (
            <>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${cfg.bg} mb-5`}>
                <Icon className={`w-8 h-8 ${cfg.color}`} />
              </div>

              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
                {cfg.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {cfg.message}
              </p>

              {transactionId && (
                <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted rounded-lg px-3 py-2 break-all">
                  Référence : {transactionId}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Home className="w-4 h-4" /> Retour à l'accueil
                </Link>

                {canRetry && (
                  <Link
                    to="/espace-membre"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Réessayer
                  </Link>
                )}

                {status === "approved" && (
                  <Link
                    to="/espace-membre"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                  >
                    Mon espace membre
                  </Link>
                )}
              </div>
            </>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Une question ?{" "}
          <a href="mailto:contact@mabellepromo.org" className="text-primary hover:underline">
            contact@mabellepromo.org
          </a>
        </p>
      </section>
    </div>
  );
}
