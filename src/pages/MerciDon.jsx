import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Home, ArrowRight, Phone } from "lucide-react";

const programmesLabels = {
  general: "Fonds général MBP",
  bourses: "Programme Bourses étudiants",
  humanitaire: "Actions humanitaires",
  numerique: "Ouvrage numérique collectif",
};

export default function MerciDon() {
  const { state } = useLocation();
  const nom = state?.nom || "Généreux donateur";
  const montant = state?.montant;
  const programme = state?.programme || "general";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <Heart className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Merci, {nom} !
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Votre générosité illumine notre mission. Chaque contribution, grande ou petite, nous rapproche de nos objectifs au service des étudiants et des plus vulnérables.
          </p>

          {montant && (
            <div className="inline-block bg-primary/5 border border-primary/20 rounded-2xl px-8 py-5 mb-8">
              <div className="text-3xl font-bold text-primary mb-1">{montant.toLocaleString("fr-FR")} FCFA</div>
              <div className="text-sm text-muted-foreground">affecté à : <strong className="text-foreground">{programmesLabels[programme]}</strong></div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Prochaines étapes
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>📱 <strong className="text-foreground">TMoney :</strong> Envoyez votre don au +228 90 05 36 06</p>
              <p>📱 <strong className="text-foreground">Flooz :</strong> Envoyez votre don au +228 96 02 00 00</p>
              <p>✉️ <strong className="text-foreground">Confirmation :</strong> Envoyez une copie à mabellepromo@gmail.com avec votre nom et le programme choisi.</p>
              <p className="text-xs border-t border-border pt-3 mt-3">Notre équipe vous enverra un reçu de don dans les 48 heures suivant la réception de votre virement.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              <Home className="w-4 h-4" /> Retour à l'accueil
            </Link>
            <Link to="/activites/projets" className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors">
              Voir nos réalisations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}