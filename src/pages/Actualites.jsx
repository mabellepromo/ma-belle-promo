import { motion } from "framer-motion";
import { Calendar, ArrowRight, Search, Tag, X } from "lucide-react";
import { useState, useMemo } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";

const catPills = {
  "Webinaire":   "bg-blue-500/90 text-white",
  "Événement":   "bg-purple-500/90 text-white",
  "Conférence":  "bg-teal-500/90 text-white",
  "Gala":        "bg-amber-500/90 text-white",
  "Solidarité":  "bg-red-500/90 text-white",
  "Association": "bg-primary/90 text-white",
  "Partenariat": "bg-cyan-500/90 text-white",
  "Histoire":    "bg-orange-500/90 text-white",
  "Hommage":     "bg-slate-500/90 text-white",
  "Médias":      "bg-pink-500/90 text-white",
  "Prix":        "bg-yellow-500/90 text-white",
  "Juridique":   "bg-violet-500/90 text-white",
};

const catLight = {
  "Webinaire":   "bg-blue-100 text-blue-700",
  "Événement":   "bg-purple-100 text-purple-700",
  "Conférence":  "bg-teal-100 text-teal-700",
  "Gala":        "bg-amber-100 text-amber-700",
  "Solidarité":  "bg-red-100 text-red-700",
  "Association": "bg-secondary text-primary",
  "Partenariat": "bg-cyan-100 text-cyan-700",
  "Histoire":    "bg-orange-100 text-orange-700",
  "Hommage":     "bg-slate-100 text-slate-600",
  "Médias":      "bg-pink-100 text-pink-700",
  "Prix":        "bg-yellow-100 text-yellow-700",
  "Juridique":   "bg-violet-100 text-violet-700",
};

function getYear(a) {
  if (a.date_iso) return a.date_iso.slice(0, 4);
  const m = (a.date || "").match(/\d{4}/);
  return m ? m[0] : null;
}

/* ── Article vedette ── */
function FeaturedCard({ article }) {
  const pill = catPills[article.categorie] ?? "bg-primary/90 text-white";
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
      <Link to={`/actualites/${article.id}`}
        className="group grid md:grid-cols-2 rounded-3xl overflow-hidden border border-border bg-card hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 shadow-md">
        <div className="relative h-72 md:h-full min-h-[300px] overflow-hidden bg-muted flex items-center justify-center">
          <img src={article.image} alt={article.titre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
          <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full ${pill}`}>
            {article.categorie}
          </span>
        </div>
        <div className="flex flex-col justify-center p-4 sm:p-8 md:p-12">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-5">
            <Calendar className="w-3.5 h-3.5 text-primary" /> {article.date}
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight mb-5 group-hover:text-primary transition-colors duration-300">
            {article.titre}
          </h2>
          {article.extrait && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
              {article.extrait}
            </p>
          )}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {article.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all duration-300">
            Lire l'article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Carte grille ── */
function GridCard({ article, index }) {
  const pill = catPills[article.categorie] ?? "bg-primary/90 text-white";
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: (index % 3) * 0.07 }} className="h-full">
      <Link to={`/actualites/${article.id}`}
        className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-48 overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
          <img loading="lazy" src={article.image} alt={article.titre}
            className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${article.photo_position === "contain" ? "object-contain" : "object-cover object-top"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute bottom-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${pill}`}>
            {article.categorie}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3 text-primary" /> {article.date}
          </span>
          <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2 flex-1">
            {article.titre}
          </h3>
          {article.extrait && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {article.extrait}
            </p>
          )}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.slice(0, 3).map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all">
            Lire <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Actualites() {
  const { articles } = useArticles({ publicOnly: true });
  const [search, setSearch]   = useState("");
  const [cat,    setCat]      = useState("Tous");
  const [year,   setYear]     = useState("Toutes");
  const [tag,    setTag]      = useState("");

  /* Années disponibles */
  const allYears = useMemo(() => {
    const ys = new Set(articles.map(a => getYear(a)).filter(Boolean));
    return ["Toutes", ...[...ys].sort((a, b) => b - a)];
  }, [articles]);

  /* Catégories présentes */
  const allCats = useMemo(() =>
    ["Tous", ...Object.keys(catPills).filter(c => articles.some(a => a.categorie === c))],
    [articles]
  );

  /* Tags disponibles */
  const allTags = useMemo(() => {
    const ts = new Set();
    articles.forEach(a => (a.tags || []).forEach(t => ts.add(t)));
    return [...ts].sort();
  }, [articles]);

  const filtered = useMemo(() => articles.filter(a => {
    if (cat !== "Tous" && a.categorie !== cat) return false;
    if (year !== "Toutes" && getYear(a) !== year) return false;
    if (tag && !(a.tags || []).includes(tag)) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = [a.titre, a.extrait, ...(a.tags || [])].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [articles, cat, year, tag, search]);

  const [featured, ...rest] = filtered;

  const activeFilters = [
    cat !== "Tous" && cat,
    year !== "Toutes" && year,
    tag,
  ].filter(Boolean);

  function clearAll() { setCat("Tous"); setYear("Toutes"); setTag(""); setSearch(""); }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Actualités"
        description="Toutes les actualités de Ma Belle Promo : événements, projets, actions solidaires et nouvelles de l'association au Togo."
        path="/informations/actualites"
      />

      {/* En-tête */}
      <div className="bg-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow text-primary/70 mb-2">Ma Belle Promo</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">Actualités</h1>
            <p className="text-white/50 text-sm">
              Toute l'histoire de l'association — événements, conférences, galas et engagements depuis 2018.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Barre de recherche */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-60 shadow-sm" />
            </div>
            {/* Filtre année */}
            {allYears.length > 2 && (
              <select value={year} onChange={e => setYear(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/50">
                {allYears.map(y => <option key={y}>{y}</option>)}
              </select>
            )}
            {activeFilters.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" /> Effacer les filtres
              </button>
            )}
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-1.5">
            {allCats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  cat === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>
                {c}
                <span className="ml-1 opacity-40 text-[10px]">
                  {c === "Tous" ? articles.length : articles.filter(a => a.categorie === c).length}
                </span>
              </button>
            ))}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {allTags.map(t => (
                <button key={t} onClick={() => setTag(tag === t ? "" : t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    tag === t ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aucun résultat */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">Aucun résultat</p>
            <p className="text-sm">Essayez un autre mot-clé ou une autre catégorie.</p>
          </div>
        )}

        {/* Article vedette */}
        {featured && <FeaturedCard article={featured} />}

        {/* Grille */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((a, i) => <GridCard key={a.id} article={a} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
