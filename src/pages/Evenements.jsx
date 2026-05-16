import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { Calendar, MapPin, Clock, ArrowRight, ChevronRight } from "lucide-react";
import TiltCard from "../components/TiltCard";
import { useEvenements } from "../hooks/useEvenements";
import { useArticles } from "../hooks/useArticles";

const TYPE_STYLE = {
  "Webinaire":        { badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500",    border: "border-blue-200" },
  "Conférence":       { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500",  border: "border-purple-200" },
  "Gala":             { badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500",   border: "border-amber-200" },
  "Projet éditorial": { badge: "bg-green-100 text-green-700",   dot: "bg-green-500",   border: "border-green-200" },
  "Événement":        { badge: "bg-gray-100 text-gray-700",     dot: "bg-gray-400",    border: "border-gray-200" },
};

const TYPES = ["Tous", "Webinaire", "Conférence", "Gala", "Projet éditorial"];

const SESSION_ID = "session-de-partage-sur-le-nouvequ-code-du-travail-1776658409803";

function TypeBadge({ type }) {
  const s = TYPE_STYLE[type] || TYPE_STYLE["Événement"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {type}
    </span>
  );
}

/* ── Carte hero (1er événement passé) — image en haut, texte en bas ── */
function HeroCard({ evt }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={evt.image}
          alt={evt.titre}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.style.display = "none"; }}
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <TypeBadge type={evt.type} />
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-black/50 text-white backdrop-blur-sm">
            Passé
          </span>
        </div>
      </div>

      {/* Texte */}
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
          {evt.date && <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" />{evt.date}</span>}
          {evt.heures && <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" />{evt.heures}</span>}
          {evt.lieu && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" />{evt.lieu}</span>}
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
          {evt.titre}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-5">{evt.description}</p>
        {evt.article && (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            Lire le compte-rendu <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </motion.div>
  );

  return evt.article
    ? <Link to={`/actualites/${evt.article.id}`}>{inner}</Link>
    : inner;
}

/* ── Carte compacte (grille) ── */
function GridCard({ evt, i }) {
  const s = TYPE_STYLE[evt.type] || TYPE_STYLE["Événement"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      style={{ perspective: "900px" }}
    >
      <TiltCard className={`group bg-card border ${s.border} rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={evt.image}
          alt={evt.titre}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <TypeBadge type={evt.type} />
        </div>
        <span className="absolute bottom-3 right-3 font-heading text-4xl font-black text-white/15 leading-none select-none">
          {String(evt.num).padStart(2, "0")}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2.5">
          {evt.date && <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" />{evt.date}</span>}
          {evt.lieu && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" />{evt.lieu}</span>}
        </div>
        <h3 className="font-heading text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {evt.titre}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{evt.description}</p>
        {evt.article && (
          <Link
            to={`/actualites/${evt.article.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all"
          >
            Compte-rendu <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      </TiltCard>
    </motion.div>
  );
}

/* ── Carte "À venir" ── */
function UpcomingCard({ evt }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-primary/5 border-2 border-primary/20 rounded-3xl p-5 sm:p-8 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              À venir
            </span>
            <TypeBadge type={evt.type} />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3 leading-snug">{evt.titre}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">{evt.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-foreground font-medium">
            {evt.date && <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{evt.date}</span>}
            {evt.heures && <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{evt.heures}</span>}
            {evt.lieu && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{evt.lieu}</span>}
          </div>
        </div>
        {evt.image && (
          <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden flex-shrink-0">
            <img src={evt.image} alt={evt.titre} className="w-full h-full object-cover object-top" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Evenements() {
  const { evenements } = useEvenements();
  const { articles } = useArticles();
  const [filtre, setFiltre] = useState("Tous");

  const liste = useMemo(() => {
    const fromEvenements = evenements
      .filter(e => String(e.id) !== "1")
      .map((evt) => {
        const articleId = evt.articleId || evt.articleid;
        const article = articleId ? articles.find(a => a.id === articleId) : null;
        return { ...evt, article, image: article?.image || evt.image };
      });

    const artSession = articles.find(a => a.id === SESSION_ID);
    const sessionCard = artSession ? [{
      id: artSession.id,
      titre: artSession.titre,
      date: artSession.date,
      heures: "",
      lieu: "",
      type: artSession.categorie || "Événement",
      statut: "Passé",
      description: artSession.extrait,
      image: artSession.image,
      article: artSession,
    }] : [];

    return [...sessionCard, ...fromEvenements];
  }, [evenements, articles]);

  const aVenir  = liste.filter(e => e.statut?.toLowerCase() !== "passé");
  const passes  = liste.filter(e => e.statut?.toLowerCase() === "passé");
  const filtres = filtre === "Tous" ? passes : passes.filter(e => e.type === filtre);
  const numbered = filtres.map((e, i) => ({ ...e, num: i + 1 }));

  const [hero, ...rest] = numbered;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Événements" description="Tous les événements de Ma Belle Promo : galas, conférences, webinaires et rencontres des membres de la promotion FDD Lomé 1994–2000." path="/activites/evenements" />

      {/* ── En-tête ── */}
      <div className="bg-foreground">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="eyebrow text-primary/70 mb-3">Ma Belle Promo · FDD Lomé</p>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-black text-white leading-none mb-4">
              Événements
            </h1>
            <div className="w-12 h-0.5 bg-primary mb-6 mx-auto" />
            <p className="text-white/50 text-base leading-relaxed">
              Conférences, webinaires, galas — les rendez-vous qui rythment la vie de l'association depuis 2021.
            </p>
          </motion.div>

          {/* Compteurs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-10"
          >
            {[
              { val: liste.length, label: "événements" },
              { val: aVenir.length, label: "à venir" },
              { val: passes.length, label: "éditions passées" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="font-heading text-3xl font-black text-white">{val}</div>
                <div className="text-xs text-white/35 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── À venir ── */}
        {aVenir.length > 0 && (
          <section>
            <h2 className="font-heading eyebrow text-primary mb-6">Prochain événement</h2>
            <div className="space-y-4">
              {aVenir.map(evt => <UpcomingCard key={evt.id} evt={evt} />)}
            </div>
          </section>
        )}

        {/* ── Passés ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="font-heading eyebrow text-primary">
              {aVenir.length > 0 ? "Éditions passées" : "Tous les événements"}
            </h2>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFiltre(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    filtre === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {numbered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-16">Aucun événement dans cette catégorie.</p>
          )}

          {/* Hero card */}
          {hero && <div className="mb-6"><HeroCard evt={hero} /></div>}

          {/* Grille 2 colonnes */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((evt, i) => <GridCard key={evt.id} evt={evt} i={i} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
