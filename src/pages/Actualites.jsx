import { motion } from "framer-motion";
import { Calendar, ArrowRight, Search, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../lib/localStore";
import { articles as articlesStatic } from "../data/articles";

const catPills = {
  "Webinaire":   "bg-blue-500/90 text-white",
  "Événement":   "bg-purple-500/90 text-white",
  "Conférence":  "bg-teal-500/90 text-white",
  "Gala":        "bg-amber-500/90 text-white",
  "Solidarité":  "bg-red-500/90 text-white",
  "Association": "bg-emerald-500/90 text-white",
  "Partenariat": "bg-cyan-500/90 text-white",
  "Histoire":    "bg-orange-500/90 text-white",
  "Hommage":     "bg-slate-500/90 text-white",
  "Médias":      "bg-pink-500/90 text-white",
  "Prix":        "bg-yellow-500/90 text-white",
};

const catLight = {
  "Webinaire":   "bg-blue-100 text-blue-700",
  "Événement":   "bg-purple-100 text-purple-700",
  "Conférence":  "bg-teal-100 text-teal-700",
  "Gala":        "bg-amber-100 text-amber-700",
  "Solidarité":  "bg-red-100 text-red-700",
  "Association": "bg-emerald-100 text-emerald-700",
  "Partenariat": "bg-cyan-100 text-cyan-700",
  "Histoire":    "bg-orange-100 text-orange-700",
  "Hommage":     "bg-slate-100 text-slate-600",
  "Médias":      "bg-pink-100 text-pink-700",
  "Prix":        "bg-yellow-100 text-yellow-700",
};

function extractYear(date) {
  const m = String(date).match(/\d{4}/);
  return m ? m[0] : "—";
}

function groupByYear(list) {
  const map = {};
  for (const a of list) {
    const y = extractYear(a.date);
    if (!map[y]) map[y] = [];
    map[y].push(a);
  }
  return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]));
}

/* ── Carte hero (pleine largeur, image en fond) ── */
function HeroCard({ article }) {
  const pill = catPills[article.categorie] ?? "bg-primary/90 text-white";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Link
        to={`/actualites/${article.id}`}
        className="group relative block w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Image fond */}
        <img
          src={article.image}
          alt={article.titre}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Contenu */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 ${pill}`}>
            {article.categorie}
          </span>
          <h2 className="font-heading text-white text-2xl md:text-4xl font-bold leading-tight mb-3 group-hover:text-primary/90 transition-colors">
            {article.titre}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-5 max-w-2xl">
            {article.extrait}
          </p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white/60 text-xs">
              <Calendar className="w-3.5 h-3.5" /> {article.date}
            </span>
            <span className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary/90 transition-colors">
              Lire l'article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Carte medium (image + texte dessous) ── */
function MediumCard({ article, index }) {
  const pill = catPills[article.categorie] ?? "bg-primary/90 text-white";
  const light = catLight[article.categorie] ?? "bg-gray-100 text-gray-700";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="h-full"
    >
      <Link
        to={`/actualites/${article.id}`}
        className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0">
          <img
            src={article.image}
            alt={article.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute bottom-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${pill}`}>
            {article.categorie}
          </span>
        </div>

        {/* Texte */}
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3" /> {article.date}
          </span>
          <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2 flex-1">
            {article.titre}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {article.extrait}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all">
            Lire <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Carte liste (horizontale, compacte) ── */
function ListCard({ article, index }) {
  const light = catLight[article.categorie] ?? "bg-gray-100 text-gray-700";
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/actualites/${article.id}`}
        className="group flex gap-4 items-center py-4 border-b border-border/50 hover:border-primary/20 transition-colors"
      >
        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          <img src={article.image} alt={article.titre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${light}`}>{article.categorie}</span>
            <span className="text-[10px] text-muted-foreground">{article.date}</span>
          </div>
          <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.titre}
          </h3>
        </div>
        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

/* ── Page principale ── */
export default function Actualites() {
  const articles = useContent("articles", articlesStatic);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");

  const allCats = useMemo(() =>
    ["Tous", ...Object.keys(catPills).filter(c => articles.some(a => a.categorie === c))],
    [articles]
  );

  const filtered = useMemo(() => articles.filter(a => {
    const matchCat = cat === "Tous" || a.categorie === cat;
    const matchSearch = !search ||
      a.titre.toLowerCase().includes(search.toLowerCase()) ||
      (a.extrait || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [articles, search, cat]);

  const isFiltering = search || cat !== "Tous";
  const grouped = useMemo(() => groupByYear(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-background">

      {/* ── En-tête éditorial ── */}
      <div className="bg-gradient-to-br from-foreground/5 via-background to-primary/5 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Ma Belle Promo</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              Actualités
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Toute l'histoire de l'association — événements, conférences, galas et engagements depuis 2018.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Recherche + filtres ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 items-start sm:items-center">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un article…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-60 shadow-sm"
            />
          </div>
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
        </div>

        {/* ── Vide ── */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">Aucun résultat</p>
            <p className="text-sm">Essayez un autre mot-clé ou une autre catégorie.</p>
          </div>
        )}

        {/* ── Contenu groupé par année ── */}
        {grouped.map(([year, list], gi) => (
          <div key={year} className="mb-20">

            {/* Séparateur d'année */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="relative flex items-center gap-6 mb-10"
            >
              <span className="font-heading text-7xl md:text-8xl font-black text-primary/8 select-none leading-none flex-shrink-0">
                {year}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex-shrink-0">
                {list.length} article{list.length > 1 ? "s" : ""}
              </span>
            </motion.div>

            {/* Layout selon le nombre d'articles */}
            {list.length === 1 && (
              <HeroCard article={list[0]} />
            )}

            {list.length === 2 && (
              <div className="grid md:grid-cols-2 gap-6">
                {list.map((a, i) => <MediumCard key={a.id} article={a} index={i} />)}
              </div>
            )}

            {list.length >= 3 && (
              <div className="space-y-8">
                {/* Premier article : hero */}
                <HeroCard article={list[0]} />

                {/* Articles 2 & 3 : medium côte à côte */}
                {list.length >= 2 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.slice(1, list.length <= 4 ? undefined : 4).map((a, i) => (
                      <MediumCard key={a.id} article={a} index={i} />
                    ))}
                  </div>
                )}

                {/* Articles suivants : liste compacte */}
                {list.length > 4 && (
                  <div className="bg-card border border-border rounded-2xl px-6 py-2">
                    {list.slice(4).map((a, i) => (
                      <ListCard key={a.id} article={a} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
