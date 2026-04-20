import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Tag, Calendar, ArrowRight, BookOpen, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useArticles } from "../hooks/useArticles";
import PageHero from "../components/PageHero";

const CATEGORIES = [
  { id: "all", label: "Tout", color: "bg-foreground text-background" },
  { id: "Juridique", label: "Juridique", color: "bg-blue-100 text-blue-800" },
  { id: "Social", label: "Social", color: "bg-green-100 text-green-800" },
  { id: "Webinaire", label: "Webinaires", color: "bg-violet-100 text-violet-800" },
  { id: "Conférence", label: "Conférences", color: "bg-teal-100 text-teal-800" },
  { id: "Événement", label: "Événements", color: "bg-amber-100 text-amber-800" },
  { id: "Solidarité", label: "Solidarité", color: "bg-red-100 text-red-800" },
  { id: "Gala", label: "Galas", color: "bg-pink-100 text-pink-800" },
];

const CAT_COLORS = {
  "Webinaire": "bg-violet-100 text-violet-700",
  "Conférence": "bg-teal-100 text-teal-700",
  "Événement": "bg-amber-100 text-amber-700",
  "Solidarité": "bg-red-100 text-red-700",
  "Gala": "bg-pink-100 text-pink-700",
};

// Map article categories to thematic groups
const THEMATIC_MAP = {
  "Webinaire": ["Juridique"],
  "Conférence": ["Juridique", "Social"],
  "Événement": ["Juridique"],
  "Gala": ["Social"],
  "Solidarité": ["Social"],
};

function articleMatchesCategory(article, catId) {
  if (catId === "all") return true;
  if (article.categorie === catId) return true;
  const themes = THEMATIC_MAP[article.categorie] || [];
  return themes.includes(catId);
}

export default function Blog() {
  const { articles } = useArticles();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        a.titre.toLowerCase().includes(search.toLowerCase()) ||
        a.extrait.toLowerCase().includes(search.toLowerCase()) ||
        a.categorie.toLowerCase().includes(search.toLowerCase());
      const matchCat = articleMatchesCategory(a, activeCategory);
      return matchSearch && matchCat;
    });
  }, [articles, search, activeCategory]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <PageHero
        title="Blog & Ressources"
        subtitle="Informations — Analyses juridiques & sociales"
      />

      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Search + Filters */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article, une thématique..."
              className="pl-11 h-12 rounded-full border-border text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  activeCategory === cat.id
                    ? cat.color + " shadow-sm scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-muted-foreground text-center mb-10">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "all" && ` · ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
          {search && ` · "${search}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun article trouvé.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="mt-4 text-sm text-primary hover:underline">
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Link to={`/actualites/${featured.id}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-72 md:h-auto overflow-hidden">
                        <img
                          src={featured.image}
                          alt={featured.titre}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                            À la une
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${CAT_COLORS[featured.categorie] || "bg-gray-100 text-gray-700"}`}>
                            {featured.categorie}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 md:p-10 flex flex-col justify-center bg-card">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Calendar className="w-3.5 h-3.5" /> {featured.date}
                        </div>
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                          {featured.titre}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base line-clamp-4 mb-6">
                          {featured.extrait}
                        </p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                          Lire la suite <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article, i) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col"
                  >
                    <Link to={`/actualites/${article.id}`} className="flex flex-col flex-1">
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden flex-shrink-0">
                        <img
                          src={article.image}
                          alt={article.titre}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${CAT_COLORS[article.categorie] || "bg-gray-100 text-gray-700"}`}>
                            {article.categorie}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                          <Calendar className="w-3 h-3" /> {article.date}
                        </div>
                        <h3 className="font-heading text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">
                          {article.titre}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                          {article.extrait}
                        </p>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-auto group-hover:gap-2.5 transition-all">
                          Lire la suite <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}