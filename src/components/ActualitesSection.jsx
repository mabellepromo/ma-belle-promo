import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { articles } from "../data/articles";
import { useContent } from "../lib/localStore";
import { evenements as evenementsStatic } from "../data/evenements";

export default function ActualitesSection() {
  const evenements = useContent("evenements", evenementsStatic);
  const prochains = evenements
    .filter(e => e.statut?.toLowerCase() !== "passé")
    .slice(0, 3);

  return (
    <section id="actualites" className="py-12 md:py-16 bg-muted/50">
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

        {/* Bloc événements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-accent">Agenda</span>
              <h3 className="mt-1 font-heading text-xl font-bold text-foreground">Prochains événements</h3>
            </div>
            <Link to="/activites/evenements" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {prochains.length > 0 ? (
            <div className="divide-y divide-border">
              {prochains.map((e, i) => (
                <div key={e.id || i} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{e.titre}</p>
                    <p className="text-xs text-muted-foreground">{e.date}{e.lieu ? ` · ${e.lieu}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Aucun événement à venir pour le moment. Revenez bientôt.</p>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}