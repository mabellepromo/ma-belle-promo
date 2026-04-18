import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useContent } from "../lib/localStore";
import { evenements as evenementsStatic } from "../data/evenements";
import { articles as articlesStatic } from "../data/articles";

const TYPE_STYLE = {
  "Webinaire":        { badge: "bg-blue-100 text-blue-700",   accent: "bg-blue-500" },
  "Conférence":       { badge: "bg-purple-100 text-purple-700", accent: "bg-purple-500" },
  "Gala":             { badge: "bg-amber-100 text-amber-700",  accent: "bg-amber-500" },
  "Projet éditorial": { badge: "bg-green-100 text-green-700",  accent: "bg-green-500" },
};

export default function Evenements() {
  const evenements = useContent("evenements", evenementsStatic);
  const articles   = useContent("articles",   articlesStatic);

  const liste = useMemo(() =>
    evenements
      .filter(e => String(e.id) !== "1")
      .map((evt, idx) => {
        const article = evt.articleId ? articles.find(a => a.id === evt.articleId) : null;
        return { ...evt, article, image: article?.image || evt.image, num: idx + 1 };
      }),
    [evenements, articles]
  );

  return (
    <div className="min-h-screen bg-background">

      {/* En-tête éditorial */}
      <div className="bg-gradient-to-br from-foreground/5 via-background to-primary/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Ma Belle Promo</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              Événements
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Conférences, webinaires, galas — les rendez-vous qui ont marqué l'histoire de l'association.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        {liste.map((evt, i) => {
          const style = TYPE_STYLE[evt.type] || { badge: "bg-gray-100 text-gray-700", accent: "bg-gray-400" };

          return (
            <motion.article
              key={evt.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-400"
            >
              {/* Barre accent gauche */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="flex flex-col md:flex-row">

                {/* Image */}
                <div className="relative md:w-72 lg:w-80 h-52 md:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${style.badge}`}>
                      {evt.type}
                    </span>
                    {evt.statut === "Passé" && (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-black/60 text-white backdrop-blur-sm">
                        Passé
                      </span>
                    )}
                  </div>

                  {/* Numéro décoratif */}
                  <div className="absolute bottom-3 right-3 font-heading text-5xl font-black text-white/20 leading-none select-none">
                    {String(evt.num).padStart(2, "0")}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex flex-col justify-between flex-1 p-6 md:p-8">
                  <div>
                    <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">
                      {evt.titre}
                    </h2>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />{evt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />{evt.heures}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />{evt.lieu}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {evt.description}
                    </p>
                  </div>

                  {evt.article && (
                    <div className="mt-5 pt-4 border-t border-border/50">
                      <Link
                        to={`/actualites/${evt.article.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all group/link"
                      >
                        Lire le compte-rendu
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}
