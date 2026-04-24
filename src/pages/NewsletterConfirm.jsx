import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO from "../components/SEO";

export default function NewsletterConfirm() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error | invalid

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("invalid"); return; }

    supabase.rpc("confirm_newsletter_subscription", { p_token: token })
      .then(({ data, error }) => {
        if (error) { setStatus("error"); return; }
        setStatus(data === true ? "success" : "invalid");
      });
  }, [params]);

  const states = {
    loading: {
      icon: <Loader2 className="w-12 h-12 text-primary animate-spin" />,
      title: "Vérification en cours…",
      text: "Veuillez patienter quelques secondes.",
      color: "text-muted-foreground",
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
      title: "Inscription confirmée !",
      text: "Vous êtes maintenant abonné(e) à la newsletter de Ma Belle Promo. Vous recevrez nos prochaines actualités.",
      color: "text-green-700",
    },
    invalid: {
      icon: <XCircle className="w-12 h-12 text-amber-500" />,
      title: "Lien invalide ou expiré",
      text: "Ce lien de confirmation n'est plus valable. Il est possible que vous ayez déjà confirmé votre inscription, ou que le lien ait expiré.",
      color: "text-amber-700",
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      title: "Erreur technique",
      text: "Une erreur est survenue. Veuillez réessayer depuis le formulaire d'inscription ou contacter contact@mabellepromo.org.",
      color: "text-red-700",
    },
  };

  const s = states[status];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <SEO title="Confirmation newsletter" description="Confirmation de votre inscription à la newsletter Ma Belle Promo." path="/newsletter/confirmer" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-10 shadow-sm"
      >
        <div className="flex justify-center mb-5">{s.icon}</div>
        <h1 className={`font-heading text-2xl font-bold mb-3 ${s.color}`}>{s.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">{s.text}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
