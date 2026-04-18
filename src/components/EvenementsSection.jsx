import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function EvenementsSection() {
  return (
    <section id="evenements" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Agenda</span>
          <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-foreground">
            Nos Évènements
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Les évènements à venir de Ma Belle Promo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
            Pas d'évènements pour le moment
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Aucun évènement n'est planifié actuellement. Revenez bientôt ou inscrivez-vous
            à notre newsletter pour être informé en avant-première.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/activites/evenements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              <Clock className="w-4 h-4" /> Voir tous les évènements
            </Link>
            <a
              href="#newsletter"
              onClick={(e) => { e.preventDefault(); document.querySelector('#newsletter')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
            >
              S'inscrire à la newsletter <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
