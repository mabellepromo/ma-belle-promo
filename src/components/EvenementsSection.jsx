import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const EVENEMENT_PHARE_ID = "session-de-partage-sur-le-nouvequ-code-du-travail-1776658409803";

export default function EvenementsSection() {
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("id, titre, extrait, date, categorie, image")
        .eq("id", EVENEMENT_PHARE_ID)
        .single();
      setEvenement(data ?? null);
      setLoading(false);
    }
    load();
  }, []);

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
          <span className="eyebrow text-accent">Agenda</span>
          <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-foreground">
            Nos Évènements
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Les évènements à venir de Ma Belle Promo.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : evenement ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Link
              to={`/actualites/${evenement.id}`}
              className="group block bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {evenement.image && (
                <div className="relative h-56 md:h-72 overflow-hidden">
                  <img
                    src={evenement.image}
                    alt={evenement.titre}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {evenement.categorie && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      <Tag className="w-3 h-3" />
                      {evenement.categorie}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4 sm:p-7">
                {evenement.date && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    {evenement.date}
                  </p>
                )}
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {evenement.titre}
                </h3>
                {evenement.extrait && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                    {evenement.extrait}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Lire le compte-rendu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <div className="mt-6 text-center">
              <Link
                to="/activites/evenements"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
              >
                <Clock className="w-4 h-4" /> Voir tous les évènements
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-12 text-center shadow-sm"
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
        )}
      </div>
    </section>
  );
}
