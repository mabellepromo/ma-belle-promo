// @ts-nocheck
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Clock, ChevronRight } from "lucide-react";
import { useArticles } from "../hooks/useArticles";
import { useEvenements } from "../hooks/useEvenements";

const PLAN_IMAGE = "/Galeries/Reunion 18.05.2019/180519mbp-groupe1.webp";

// Axe 6 — shimmer pendant le chargement de l'image
const SHIMMER_CSS = `
  @keyframes img-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .img-shimmer {
    background: linear-gradient(90deg,
      hsl(var(--muted)) 25%,
      hsl(var(--card))  50%,
      hsl(var(--muted)) 75%
    );
    background-size: 200% 100%;
    animation: img-shimmer 1.4s ease-in-out infinite;
  }
`;

function ArticleCard({ article, i }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const shouldReduce = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.15 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {/* Shimmer tant que l'image n'est pas chargée */}
        {!imgLoaded && !shouldReduce && (
          <div className="absolute inset-0 img-shimmer" />
        )}
        <img
          loading="lazy"
          src={article.image}
          alt={article.titre}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-primary/10 text-primary">
            {article.categorie}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {article.date}
          </span>
        </div>
        <h3 className="font-heading text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {article.titre}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {(article.extrait || article.contenu || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)}
        </p>
        <Link to={`/actualites/${article.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all">
          Lire la suite <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function ActualitesSection() {
  const { articles } = useArticles();
  const { evenements } = useEvenements();
  const prochains = evenements
    .filter(e => e.statut?.toLowerCase() !== "passé")
    .slice(0, 3);

  return (
    <section id="actualites" className="py-12 md:py-16 bg-muted/50">
      <style>{SHIMMER_CSS}</style>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="eyebrow text-accent">Restez informés</span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            Actualités & Événements
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">
            Événements, projets en cours et feuille de route — tout ce qui anime l'association.
          </p>
        </motion.div>

        {/* Cartes articles avec shimmer image */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article, i) => (
            <ArticleCard key={article.id} article={article} i={i} />
          ))}
        </div>

        {/* Grille bas : Agenda + Plan d'action 2026 */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">

          {/* ── Prochains événements ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="eyebrow text-accent">Agenda</span>
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
                <div>
                  <p className="text-sm font-medium text-foreground">Prochain événement en préparation</p>
                  <Link to="/activites/evenements" className="text-xs text-primary hover:underline">
                    Consulter la page Événements →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Plan d'Action 2026 ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <Link
              to="/activites/plan-action-2026"
              className="group relative block h-full min-h-[220px] rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-500"
            >
              <img
                src={PLAN_IMAGE}
                alt="Plan d'action MBP 2026"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <div className="relative z-10 h-full flex flex-col justify-between p-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-accent/90 text-foreground backdrop-blur-sm">
                    Feuille de route
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20">
                    Adoption mars 2026
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">3 axes · 4 objectifs</p>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-accent transition-colors duration-300">
                    Plan d'Action 2026
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-accent group-hover:gap-3 transition-all duration-300">
                    Découvrir la feuille de route
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
