import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useContent } from "../lib/localStore";
import { evenements as evenementsStatic } from "../data/evenements";
import { articles as articlesStatic } from "../data/articles";


const typeColors = {
  "Webinaire":        "bg-blue-100 text-blue-700",
  "Conférence":       "bg-purple-100 text-purple-700",
  "Gala":             "bg-amber-100 text-amber-700",
  "Projet éditorial": "bg-green-100 text-green-700",
};

export default function Evenements() {
  const evenements = useContent("evenements", evenementsStatic);
  const articles   = useContent("articles",   articlesStatic);

  // Supprimer la première carte (id:1) quelle que soit la source
  const liste = evenements.filter(e => String(e.id) !== "1");

  return (
    <div>
      <PageHero title="Événements" subtitle="Activités — Nos rendez-vous" />

      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="space-y-8">
          {liste.map((evt, i) => {
            // Article lié via articleId de l'événement
            const article = evt.articleId
              ? articles.find(a => a.id === evt.articleId)
              : null;

            // Image : priorité à l'image de l'article lié, sinon image de l'événement
            const image = article?.image || evt.image;

            return (
              <motion.article
                key={evt.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Image */}
                  <div className="relative h-52 md:h-full overflow-hidden">
                    <img
                      src={image}
                      alt={evt.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${typeColors[evt.type] || "bg-gray-100 text-gray-700"}`}>
                        {evt.type}
                      </span>
                      {evt.statut === "Passé" && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 text-white backdrop-blur-sm">
                          Passé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="md:col-span-2 p-7 flex flex-col justify-between">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {evt.titre}
                      </h2>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />{evt.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />{evt.heures}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />{evt.lieu}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                        {evt.description}
                      </p>
                    </div>

                    {/* Lien vers l'article détaillé */}
                    {article && (
                      <div className="mt-5 pt-4 border-t border-border/50">
                        <Link
                          to={`/actualites/${article.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                        >
                          <span>Lire le compte-rendu</span>
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
