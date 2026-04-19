import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Play } from "lucide-react";
import { articles } from "../data/articles";

export default function ActualitesSection() {
  return (
    <section id="actualites" className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Restez informés</span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            Actualités & Événements
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">
            Nous agissons, intervenons et influons sur divers programmes. Retrouvez ici nos dernières nouvelles.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  loading="lazy"
                  src={article.image}
                  alt={article.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm rounded-full text-foreground">
                    {article.categorie}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.titre}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {article.contenu.replace(/[*#_>]/g, "").slice(0, 130)}...
                </p>
                <Link to={`/actualites/${article.id}`} className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
                  Lire la suite <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Video highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 relative rounded-2xl overflow-hidden bg-foreground/5 border border-border"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12">
              <span className="text-xs font-semibold tracking-widest uppercase text-accent">À la une</span>
              <h3 className="mt-3 font-heading text-2xl md:text-3xl font-bold text-foreground">
                Plan d'action 2023-2025
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Découvrez en vidéo notre feuille de route stratégique et nos ambitions 
                pour accompagner les étudiants de la Faculté de Droit de Lomé.
              </p>
              <Link
                to="/actualites/numerique-togo"
                className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" /> Voir l'article complet
              </Link>
            </div>
            <div className="relative h-64 md:h-80">
              <img
                loading="lazy"
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=450&fit=crop"
                alt="Campus de l'Université de Lomé"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent md:from-background/40" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}